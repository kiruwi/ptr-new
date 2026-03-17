import test from "node:test";
import assert from "node:assert/strict";
import { createApp, defineEventHandler, toPlainHandler } from "h3";
import securityMiddleware from "../server/middleware/00-security.ts";

function createSecuredHandler() {
  const app = createApp();
  app.use(securityMiddleware);
  app.use(
    defineEventHandler(() => {
      return {
        ok: true,
      };
    }),
  );

  return toPlainHandler(app);
}

test("security middleware adds strict headers, denies unauthorized admin routes, and enforces strict cors", async () => {
  const originalAllowedOrigins = process.env.NUXT_ALLOWED_ORIGINS;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalStrictBrowserHeaders = process.env.SECURITY_STRICT_BROWSER_HEADERS;
  const originalSessionSecret = process.env.AUTH_SESSION_SECRET;
  const originalUseRuntimeConfig = globalThis.useRuntimeConfig;

  process.env.NODE_ENV = "production";
  process.env.SECURITY_STRICT_BROWSER_HEADERS = "false";
  process.env.NUXT_ALLOWED_ORIGINS = "https://admin.example.com";
  process.env.AUTH_SESSION_SECRET = "this-is-a-demo-session-secret-with-32-chars";
  globalThis.useRuntimeConfig = () => ({
    public: {
      siteUrl: "https://patamurestaurants.com",
      googleAnalyticsId: "G-3FHWVHDTZC",
    },
  });

  try {
    const handler = createSecuredHandler();

    const homeResponse = await handler({
      method: "GET",
      path: "/",
      headers: {},
    });

    const homeHeaders = new Headers(homeResponse.headers);
    assert.equal(homeResponse.status, 200);
    assert.equal(homeHeaders.get("x-frame-options"), "DENY");
    assert.equal(homeHeaders.get("x-content-type-options"), "nosniff");
    assert.equal(homeHeaders.get("strict-transport-security"), "max-age=31536000; includeSubDomains; preload");
    assert.equal(homeHeaders.get("content-security-policy"), null);
    assert.equal(homeHeaders.get("cross-origin-opener-policy"), null);

    const adminResponse = await handler({
      method: "GET",
      path: "/api/admin/demo",
      headers: {},
    });

    assert.equal(adminResponse.status, 401);

    const blockedPreflight = await handler({
      method: "OPTIONS",
      path: "/api/admin/demo",
      headers: {
        origin: "https://evil.example.com",
        "access-control-request-method": "POST",
      },
    });

    assert.equal(blockedPreflight.status, 403);

    const allowedPreflight = await handler({
      method: "OPTIONS",
      path: "/api/admin/demo",
      headers: {
        origin: "https://admin.example.com",
        "access-control-request-method": "POST",
      },
    });

    const preflightHeaders = new Headers(allowedPreflight.headers);
    assert.equal(allowedPreflight.status, 204);
    assert.equal(preflightHeaders.get("access-control-allow-origin"), "https://admin.example.com");
  } finally {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.SECURITY_STRICT_BROWSER_HEADERS = originalStrictBrowserHeaders;
    process.env.NUXT_ALLOWED_ORIGINS = originalAllowedOrigins;
    process.env.AUTH_SESSION_SECRET = originalSessionSecret;
    globalThis.useRuntimeConfig = originalUseRuntimeConfig;
  }
});

test("production middleware can opt into strict browser headers explicitly", async () => {
  const originalAllowedOrigins = process.env.NUXT_ALLOWED_ORIGINS;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalStrictBrowserHeaders = process.env.SECURITY_STRICT_BROWSER_HEADERS;
  const originalUseRuntimeConfig = globalThis.useRuntimeConfig;

  process.env.NODE_ENV = "production";
  process.env.SECURITY_STRICT_BROWSER_HEADERS = "true";
  process.env.NUXT_ALLOWED_ORIGINS = "https://patamurestaurants.com";
  globalThis.useRuntimeConfig = () => ({
    public: {
      siteUrl: "https://patamurestaurants.com",
      googleAnalyticsId: "G-3FHWVHDTZC",
    },
  });

  try {
    const handler = createSecuredHandler();
    const response = await handler({
      method: "GET",
      path: "/",
      headers: {},
    });

    const headers = new Headers(response.headers);
    assert.equal(response.status, 200);
    assert.match(
      headers.get("content-security-policy") ?? "",
      /script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: data: 'sha256-/,
    );
    assert.equal(headers.get("cross-origin-opener-policy"), "same-origin");
    assert.equal(headers.get("cross-origin-resource-policy"), "same-site");
    assert.equal(headers.get("origin-agent-cluster"), "?1");
  } finally {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.SECURITY_STRICT_BROWSER_HEADERS = originalStrictBrowserHeaders;
    process.env.NUXT_ALLOWED_ORIGINS = originalAllowedOrigins;
    globalThis.useRuntimeConfig = originalUseRuntimeConfig;
  }
});

test("development middleware omits csp and browser-isolation headers so local runtime tooling keeps working", async () => {
  const originalAllowedOrigins = process.env.NUXT_ALLOWED_ORIGINS;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalUseRuntimeConfig = globalThis.useRuntimeConfig;

  process.env.NODE_ENV = "development";
  process.env.NUXT_ALLOWED_ORIGINS = "http://localhost:3000";
  globalThis.useRuntimeConfig = () => ({
    public: {
      siteUrl: "http://localhost:3000",
      googleAnalyticsId: "",
    },
  });

  try {
    const handler = createSecuredHandler();
    const response = await handler({
      method: "GET",
      path: "/",
      headers: {},
    });

    const headers = new Headers(response.headers);
    assert.equal(response.status, 200);
    assert.equal(headers.get("content-security-policy"), null);
    assert.equal(headers.get("cross-origin-opener-policy"), null);
    assert.equal(headers.get("cross-origin-resource-policy"), null);
    assert.equal(headers.get("origin-agent-cluster"), null);
  } finally {
    process.env.NODE_ENV = originalNodeEnv;
    process.env.NUXT_ALLOWED_ORIGINS = originalAllowedOrigins;
    globalThis.useRuntimeConfig = originalUseRuntimeConfig;
  }
});
