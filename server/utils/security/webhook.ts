import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWebhookSignature(payload: string | Buffer, signature: string | undefined, secret: string) {
  if (!signature || !secret) {
    return false;
  }

  const expectedSignature = createHmac("sha256", secret).update(payload).digest("hex");
  const normalizedSignature = signature.replace(/^sha256=/i, "");
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(normalizedSignature);

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
