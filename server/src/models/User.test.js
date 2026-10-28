import assert from "node:assert/strict";
import test from "node:test";
import User from "./User.js";

test("new user accounts start with independent unverified contact statuses", () => {
  const user = new User({
    email: "customer@example.com",
    phone: "9876543210",
    passwordHash: "hashed-password",
  });

  assert.equal(User.collection.name, "users");
  assert.equal(user.emailVerified, false);
  assert.equal(user.phoneVerified, false);
  assert.equal(user.emailVerifiedAt, null);
  assert.equal(user.phoneVerifiedAt, null);
  assert.equal(user.passwordHash, "hashed-password");
});
