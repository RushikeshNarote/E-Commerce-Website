import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyHmacSignature(rawBody, suppliedSignature, secret) {
  if (!Buffer.isBuffer(rawBody) || !suppliedSignature || !secret) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  let supplied;
  try {
    supplied = Buffer.from(suppliedSignature, "hex");
  } catch {
    return false;
  }
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}
