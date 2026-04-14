import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { normalizeGoogleAnalyticsId } from "../src/utils/analytics.ts";
import { getHomeStructuredData, serializeStructuredData } from "../src/utils/structuredData.ts";
import { absoluteUrl, normalizeSiteUrl } from "../src/utils/site.ts";
import {
  createPasswordResetToken,
  hashPassword,
  hashOpaqueToken,
  issueCsrfToken,
  verifyPassword,
  verifyPasswordResetToken,
} from "../server/utils/security/auth.ts";
import { applySecurityHeaders, buildContentSecurityPolicy, parseAllowedOrigins } from "../server/utils/security/headers.ts";
import { redactSecrets } from "../server/utils/security/logging.ts";
import { assertRateLimit, checkRateLimit, resetRateLimitStore } from "../server/utils/security/rate-limit.ts";
import { isPrivateIpAddress, validateOutboundUrl } from "../server/utils/security/ssrf.ts";
import { verifyWebhookSignature } from "../server/utils/security/webhook.ts";

test("normalizeSiteUrl rejects unsafe production origins and strips fragments", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";

  assert.equal(normalizeSiteUrl("https://example.com/path/?q=1#frag"), "https://example.com/path");
  assert.throws(() => normalizeSiteUrl("http://example.com"), /https in production/i);

  process.env.NODE_ENV = originalNodeEnv;
});

test("absoluteUrl joins paths against validated site URLs", () => {
  assert.equal(absoluteUrl("https://example.com/", "/menu"), "https://example.com/menu");
});

test("analytics ids are validated before entering the client bundle", () => {
  assert.equal(normalizeGoogleAnalyticsId("g-3fhwvhdtzc"), "G-3FHWVHDTZC");
  assert.throws(() => normalizeGoogleAnalyticsId("';alert(1)//"), /valid Google Analytics/i);
});

test("structured data serialization remains escaped for XSS safety", () => {
  const siteUrl = normalizeSiteUrl("https://example.com");
  const structuredData = getHomeStructuredData(siteUrl);
  const serialized = serializeStructuredData(structuredData);

  assert.ok(serialized.includes("\\u003c") || !serialized.includes("<"));
});

test("argon2id hashing is used for passwords", async () => {
  const passwordHash = await hashPassword("correct horse battery staple");

  assert.match(passwordHash, /^\$argon2id\$/);
  assert.equal(await verifyPassword(passwordHash, "correct horse battery staple"), true);
  assert.equal(await verifyPassword(passwordHash, "wrong password"), false);
});

test("password reset tokens are opaque, hashed, and expire", () => {
  const resetToken = createPasswordResetToken(50);

  assert.notEqual(resetToken.token, resetToken.tokenHash);
  assert.equal(hashOpaqueToken(resetToken.token), resetToken.tokenHash);
  assert.equal(verifyPasswordResetToken(resetToken.token, resetToken.tokenHash, resetToken.expiresAt), true);
  assert.equal(verifyPasswordResetToken(resetToken.token, resetToken.tokenHash, Date.now() - 1), false);
});

test("csrf token generation produces high-entropy opaque values", () => {
  const token = issueCsrfToken();
  assert.match(token, /^[A-Za-z0-9_-]{32,}$/);
});

test("rate limiting fails closed after the threshold", () => {
  resetRateLimitStore();

  for (let index = 0; index < 10; index += 1) {
    const result = checkRateLimit({
      key: "auth:127.0.0.1",
      max: 10,
      windowMs: 1_000,
    });

    assert.equal(result.allowed, true);
  }

  const blocked = checkRateLimit({
    key: "auth:127.0.0.1",
    max: 10,
    windowMs: 1_000,
  });

  assert.equal(blocked.allowed, false);
  assert.throws(() => assertRateLimit(blocked), (error: unknown) => {
    return typeof error === "object" && error !== null && "statusCode" in error && error.statusCode === 429;
  });
});

test("webhook signatures are verified with HMAC-SHA256", () => {
  const payload = JSON.stringify({ ok: true });
  const secret = "webhook-secret";
  const validSignature = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;

  assert.equal(verifyWebhookSignature(payload, validSignature, secret), true);
  assert.equal(verifyWebhookSignature(payload, "sha256=deadbeef", secret), false);
});

test("ssrf validation rejects private IP ranges and non-allowlisted hosts", async () => {
  assert.equal(isPrivateIpAddress("127.0.0.1"), true);
  assert.equal(isPrivateIpAddress("10.0.0.7"), true);
  assert.equal(isPrivateIpAddress("8.8.8.8"), false);

  await assert.rejects(
    () =>
      validateOutboundUrl("https://169.254.169.254/latest/meta-data", {
        allowedHosts: ["169.254.169.254"],
        lookup: async () => [{ address: "169.254.169.254" }],
      }),
    /private IP/i,
  );

  await assert.rejects(
    () =>
      validateOutboundUrl("https://evil.example.com", {
        allowedHosts: ["api.example.com"],
        lookup: async () => [{ address: "93.184.216.34" }],
      }),
    /allowlisted/i,
  );

  assert.equal(
    await validateOutboundUrl("https://api.example.com/resource", {
      allowedHosts: ["api.example.com"],
      lookup: async () => [{ address: "93.184.216.34" }],
    }),
    "https://api.example.com/resource",
  );
});

test("security logging redacts secrets and pii", () => {
  const redacted = redactSecrets({
    password: "super-secret",
    nested: {
      token: "abc123",
      email: "guest@example.com",
    },
  });

  assert.deepEqual(redacted, {
    password: "[REDACTED]",
    nested: {
      token: "[REDACTED]",
      email: "[REDACTED]",
    },
  });
});

test("csp stays permissive enough for Nuxt hydration and animation runtime code", () => {
  const policy = buildContentSecurityPolicy("/", "https://example.com", "G-3FHWVHDTZC", "GTM-TCS6X8R9");
  const scriptDirective = policy
    .split("; ")
    .find((directive) => directive.startsWith("script-src"));

  assert.ok(scriptDirective);
  assert.match(policy, /script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: 'sha256-[^']+'/);
  assert.match(policy, /https:\/\/www\.googletagmanager\.com/);
  assert.match(policy, /frame-src 'self' https:\/\/www\.googletagmanager\.com/);
  assert.match(policy, /worker-src 'self' blob:/);
});

test("development csp allows local http and websocket runtime connections", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = "development";

  const policy = buildContentSecurityPolicy("/", "http://localhost:3000", "");

  process.env.NODE_ENV = originalNodeEnv;

  assert.match(policy, /connect-src 'self' http: ws:/);
});

test("development header application skips csp and browser isolation", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalStrictBrowserHeaders = process.env.SECURITY_STRICT_BROWSER_HEADERS;
  process.env.NODE_ENV = "development";
  process.env.SECURITY_STRICT_BROWSER_HEADERS = "true";

  const responseHeaders = new Map<string, string>();
  const event = {
    path: "/",
    node: {
      res: {
        setHeader(name: string, value: string) {
          responseHeaders.set(name.toLowerCase(), value);
        },
        getHeader(name: string) {
          return responseHeaders.get(name.toLowerCase());
        },
      },
    },
  } as never;

  applySecurityHeaders({
    event,
    allowedOrigins: [],
    gaId: "",
    siteUrl: "http://localhost:3000",
  });

  process.env.NODE_ENV = originalNodeEnv;
  process.env.SECURITY_STRICT_BROWSER_HEADERS = originalStrictBrowserHeaders;

  assert.equal(responseHeaders.get("content-security-policy"), undefined);
  assert.equal(responseHeaders.get("cross-origin-opener-policy"), undefined);
  assert.equal(responseHeaders.get("cross-origin-resource-policy"), undefined);
});

test("production header application only emits strict browser headers when explicitly enabled", () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalStrictBrowserHeaders = process.env.SECURITY_STRICT_BROWSER_HEADERS;
  process.env.NODE_ENV = "production";
  process.env.SECURITY_STRICT_BROWSER_HEADERS = "false";

  const relaxedHeaders = new Map<string, string>();
  const relaxedEvent = {
    path: "/",
    node: {
      res: {
        setHeader(name: string, value: string) {
          relaxedHeaders.set(name.toLowerCase(), value);
        },
      },
    },
  } as never;

  applySecurityHeaders({
    event: relaxedEvent,
    allowedOrigins: [],
    gaId: "",
    siteUrl: "https://patamurestaurants.com",
  });

  assert.equal(relaxedHeaders.get("content-security-policy"), undefined);
  assert.equal(relaxedHeaders.get("strict-transport-security"), "max-age=31536000; includeSubDomains; preload");

  process.env.SECURITY_STRICT_BROWSER_HEADERS = "true";

  const strictHeaders = new Map<string, string>();
  const strictEvent = {
    path: "/",
    node: {
      res: {
        setHeader(name: string, value: string) {
          strictHeaders.set(name.toLowerCase(), value);
        },
      },
    },
  } as never;

  applySecurityHeaders({
    event: strictEvent,
    allowedOrigins: [],
    gaId: "",
    siteUrl: "https://patamurestaurants.com",
  });

  process.env.NODE_ENV = originalNodeEnv;
  process.env.SECURITY_STRICT_BROWSER_HEADERS = originalStrictBrowserHeaders;

  assert.match(strictHeaders.get("content-security-policy") ?? "", /default-src 'self'/);
  assert.equal(strictHeaders.get("cross-origin-opener-policy"), "same-origin");
  assert.equal(strictHeaders.get("cross-origin-resource-policy"), "same-site");
});

test("allowed origins are normalized to exact origins", () => {
  assert.deepEqual(parseAllowedOrigins("https://admin.example.com/path, https://example.com"), [
    "https://admin.example.com",
    "https://example.com",
  ]);
});
