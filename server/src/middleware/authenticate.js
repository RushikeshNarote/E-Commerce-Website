import jwt from "jsonwebtoken";
import { config } from "../config.js";
import User from "../models/User.js";

export async function authenticate(request, response, next) {
  const authorization = request.get("authorization") || "";
  const [scheme, token, extra] = authorization.split(" ");

  if (scheme !== "Bearer" || !token || extra) {
    return response.status(401).json({ error: "Sign in is required for this action." });
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, {
      issuer: "legends-store-api",
      audience: "legends-store-client",
    });
  } catch {
    return response.status(401).json({ error: "The session is invalid or expired. Sign in again." });
  }

  if (typeof payload !== "object" || typeof payload.sub !== "string") {
    return response.status(401).json({ error: "The session is invalid. Sign in again." });
  }

  const user = await User.findById(payload.sub).select(
    "_id email emailVerified fullName phone phoneVerified",
  );
  if (!user) {
    return response.status(401).json({ error: "The account for this session was not found." });
  }

  request.user = user;
  return next();
}
