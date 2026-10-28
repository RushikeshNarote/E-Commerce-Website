import assert from "node:assert/strict";
import test from "node:test";
import {
  createEmailVerificationSender,
  EmailDeliveryError,
  EmailProviderNotConfiguredError,
} from "./emailVerification.js";

test("refuses to send when provider settings are missing", async () => {
  const send = createEmailVerificationSender({ apiKey: "", from: "" });
  await assert.rejects(send("customer@example.com", "123456"), EmailProviderNotConfiguredError);
});

test("sends the verification code through the configured Resend client", async () => {
  let sentMessage;
  const send = createEmailVerificationSender({
    apiKey: "test-key",
    from: "LEGENDS <verify@example.com>",
    clientFactory: () => ({
      emails: {
        send: async (message) => {
          sentMessage = message;
          return { data: { id: "email-id" }, error: null };
        },
      },
    }),
  });

  await send("customer@example.com", "123456");

  assert.equal(sentMessage.from, "LEGENDS <verify@example.com>");
  assert.deepEqual(sentMessage.to, ["customer@example.com"]);
  assert.match(sentMessage.text, /123456/);
  assert.match(sentMessage.html, /123456/);
});

test("reports provider rejection and network failures without provider details", async () => {
  const rejectedSend = createEmailVerificationSender({
    apiKey: "test-key",
    from: "verify@example.com",
    clientFactory: () => ({
      emails: { send: async () => ({ data: null, error: { message: "private provider detail" } }) },
    }),
  });
  const networkFailedSend = createEmailVerificationSender({
    apiKey: "test-key",
    from: "verify@example.com",
    clientFactory: () => ({
      emails: { send: async () => { throw new Error("private provider detail"); } },
    }),
  });
  const initializationFailedSend = createEmailVerificationSender({
    apiKey: "test-key",
    from: "verify@example.com",
    clientFactory: () => { throw new Error("private provider detail"); },
  });

  await assert.rejects(rejectedSend("customer@example.com", "123456"), (error) => {
    assert.ok(error instanceof EmailDeliveryError);
    assert.equal(error.message, "The email provider could not send a verification code.");
    assert.equal(error.message.includes("private provider detail"), false);
    return true;
  });
  await assert.rejects(networkFailedSend("customer@example.com", "123456"), EmailDeliveryError);
  await assert.rejects(initializationFailedSend("customer@example.com", "123456"), EmailDeliveryError);
});
