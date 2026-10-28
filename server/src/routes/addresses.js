import { Router } from "express";
import { z } from "zod";
import { config } from "../config.js";
import { authenticate } from "../middleware/authenticate.js";
import User from "../models/User.js";

const router = Router();
const phone = z.string().regex(/^[6-9][0-9]{9}$/);
const addressSchema = z.object({
  label: z.enum(["Home", "Work", "Other"]),
  recipientName: z.string().trim().min(2).max(100),
  phone,
  houseFlat: z.string().trim().min(1).max(100),
  street: z.string().trim().min(2).max(160),
  locality: z.string().trim().min(2).max(120),
  landmark: z.string().trim().max(120).optional().default(""),
  city: z.string().trim().min(2).max(80),
  state: z.string().trim().min(2).max(80),
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  isDefault: z.boolean().optional().default(false),
}).strict();

router.use(authenticate);

router.get("/", async (request, response, next) => {
  try {
    const user = await User.findById(request.user._id).select("addresses");
    return response.json({ addresses: user.addresses });
  } catch (error) {
    return next(error);
  }
});

router.post("/", async (request, response, next) => {
  try {
    const input = addressSchema.parse(request.body);
    const user = await User.findById(request.user._id);
    if (input.isDefault || user.addresses.length === 0) {
      user.addresses.forEach((address) => { address.isDefault = false; });
      input.isDefault = true;
    }
    user.addresses.push(input);
    await user.save();
    return response.status(201).json({ address: user.addresses.at(-1), addresses: user.addresses });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:addressId", async (request, response, next) => {
  try {
    const input = addressSchema.partial().parse(request.body);
    const user = await User.findById(request.user._id);
    const address = user.addresses.id(request.params.addressId);
    if (!address) return response.status(404).json({ error: "Saved address not found." });
    if (input.isDefault) user.addresses.forEach((entry) => { entry.isDefault = false; });
    address.set(input);
    await user.save();
    return response.json({ address, addresses: user.addresses });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:addressId", async (request, response, next) => {
  try {
    const user = await User.findById(request.user._id);
    const address = user.addresses.id(request.params.addressId);
    if (!address) return response.status(404).json({ error: "Saved address not found." });
    const wasDefault = address.isDefault;
    address.deleteOne();
    if (wasDefault && user.addresses.length) user.addresses[0].isDefault = true;
    await user.save();
    return response.json({ addresses: user.addresses });
  } catch (error) {
    return next(error);
  }
});

router.post("/:addressId/default", async (request, response, next) => {
  try {
    const user = await User.findById(request.user._id);
    const selected = user.addresses.id(request.params.addressId);
    if (!selected) return response.status(404).json({ error: "Saved address not found." });
    user.addresses.forEach((address) => { address.isDefault = address._id.equals(selected._id); });
    await user.save();
    return response.json({ addresses: user.addresses });
  } catch (error) {
    return next(error);
  }
});

router.post("/reverse-geocode", async (request, response, next) => {
  try {
    if (!config.openCageApiKey) {
      return response.status(503).json({ error: "Reverse geocoding is not configured. Enter the address manually." });
    }
    const { latitude, longitude } = z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }).parse(request.body);
    const url = new URL("https://api.opencagedata.com/geocode/v1/json");
    url.searchParams.set("key", config.openCageApiKey);
    url.searchParams.set("q", `${latitude},${longitude}`);
    url.searchParams.set("countrycode", "in");
    url.searchParams.set("limit", "1");
    const result = await fetch(url, { signal: AbortSignal.timeout(8_000) });
    if (!result.ok) {
      console.error("OpenCage reverse-geocoding failed:", result.status);
      return response.status(502).json({ error: "The address provider could not resolve this location." });
    }
    const data = await result.json();
    const components = data.results?.[0]?.components;
    if (!components) return response.status(404).json({ error: "No address was found for this location. Enter it manually." });
    return response.json({
      address: {
        street: [components.road, components.neighbourhood].filter(Boolean).join(", "),
        locality: components.suburb || components.residential || components.village || "",
        city: components.city || components.town || components.village || "",
        state: components.state || "",
        postalCode: components.postcode || "",
        latitude,
        longitude,
      },
      note: "Location results may be approximate. Review and correct every field before saving.",
    });
  } catch (error) {
    return next(error);
  }
});

export default router;
