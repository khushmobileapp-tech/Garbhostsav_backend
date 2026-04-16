import "dotenv/config.js";
import crypto from "node:crypto";

const secret = process.env.AUTH_TOKEN_SECRET || "change-this-auth-secret";

function toBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function fromBase64Url(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

export function createAuthToken(payload, expiresInSeconds) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + expiresInSeconds;

  const body = {
    ...payload,
    iat: issuedAt,
    exp: expiresAt,
  };

  const encodedPayload = toBase64Url(JSON.stringify(body));
  const signature = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(expiresAt * 1000).toISOString(),
  };
}

export function verifyAuthToken(token) {
  const [encodedPayload, signature] = token.split(".");

  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");

  if (signature !== expectedSignature) {
    return null;
  }

  const payload = JSON.parse(fromBase64Url(encodedPayload));

  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    return null;
  }

  return payload;
}
