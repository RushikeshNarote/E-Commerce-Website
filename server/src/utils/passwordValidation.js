import { z } from "zod";

export const passwordSchema = z.string()
  .min(5, "Password must be at least 5 characters.")
  .max(128, "Password must not exceed 128 characters.")
  .refine(
    (password) => Buffer.byteLength(password, "utf8") <= 72,
    { message: "Password must not exceed 72 UTF-8 bytes." },
  );
