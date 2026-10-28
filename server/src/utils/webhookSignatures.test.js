import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import { verifyHmacSignature } from "./webhookSignatures.js";

test("accepts a valid SHA-256 HMAC signature", () => {
  const body = Buffer.from('{"event":"payment.captured"}');
  const secret = "local-test-secret";
  const signature = createHmac("sha256", secret).update(body).digest("hex");

  assert.equal(verifyHmacSignature(body, signature, secret), true);
});

test("rejects a modified body, malformed signature, and missing secret", () => {
  const body = Buffer.from('{"event":"payment.captured"}');
  const signature = createHmac("sha256", "local-test-secret").update(body).digest("hex");

  assert.equal(verifyHmacSignature(Buffer.from("modified"), signature, "local-test-secret"), false);
  assert.equal(verifyHmacSignature(body, "xyz", "local-test-secret"), false);
  assert.equal(verifyHmacSignature(body, signature, ""), false);
});
