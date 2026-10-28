import assert from "node:assert/strict";
import test from "node:test";
import { passwordSchema } from "./passwordValidation.js";

test("accepts a password with exactly five characters", () => {
  assert.equal(passwordSchema.safeParse("12345").success, true);
});

test("rejects passwords shorter than five characters", () => {
  const result = passwordSchema.safeParse("1234");
  assert.equal(result.success, false);
  assert.match(result.error.issues[0].message, /at least 5 characters/);
});

test("keeps the password character and bcrypt byte limits", () => {
  assert.equal(passwordSchema.safeParse("existing-password-123").success, true);
  assert.equal(passwordSchema.safeParse("a".repeat(72)).success, true);
  assert.equal(passwordSchema.safeParse("a".repeat(73)).success, false);
  assert.equal(passwordSchema.safeParse("a".repeat(129)).success, false);
  assert.equal(passwordSchema.safeParse("é".repeat(37)).success, false);
});
