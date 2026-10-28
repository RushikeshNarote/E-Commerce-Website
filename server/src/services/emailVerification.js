import { Resend } from "resend";

export class EmailProviderNotConfiguredError extends Error {
  constructor() {
    super("Email verification is unavailable: configure RESEND_API_KEY and EMAIL_FROM.");
    this.name = "EmailProviderNotConfiguredError";
  }
}

export class EmailDeliveryError extends Error {
  constructor() {
    super("The email provider could not send a verification code.");
    this.name = "EmailDeliveryError";
  }
}

export function createEmailVerificationSender({ apiKey, from, clientFactory } = {}) {
  return async function sendEmailVerificationCode(email, code) {
    if (!apiKey || !from) throw new EmailProviderNotConfiguredError();

    let result;
    try {
      const client = clientFactory ? clientFactory(apiKey) : new Resend(apiKey);
      result = await client.emails.send({
        from,
        to: [email],
        subject: "Verify your LEGENDS email",
        text: `Your LEGENDS verification code is ${code}. It expires in 10 minutes. If you did not request this, ignore this email.`,
        html: `<p>Your LEGENDS verification code is:</p><p style="font-size:24px;font-weight:bold;letter-spacing:6px">${code}</p><p>It expires in 10 minutes. If you did not request this, ignore this email.</p>`,
      });
    } catch {
      throw new EmailDeliveryError();
    }

    if (!result || result.error) throw new EmailDeliveryError();
  };
}
