import { createHash } from "node:crypto";
import { createError, getRequestHeader, getResponseStatus, handleCors, setResponseHeader, type H3Event } from "h3";
import { normalizeGoogleAnalyticsId, normalizeGoogleTagManagerId } from "../../../src/utils/analytics.ts";
import { getHomeStructuredData, getMenuStructuredData, serializeStructuredData } from "../../../src/utils/structuredData.ts";
import { normalizeSiteUrl } from "../../../src/utils/site.ts";
import { logSecurityEvent } from "./logging.ts";

type SecurityHeaderOptions = {
  event: H3Event;
  allowedOrigins: string[];
  gaId?: string;
  gtmId?: string;
  siteUrl: string;
};

function isProductionRuntime() {
  return process.env.NODE_ENV === "production";
}

function isStrictBrowserHardeningEnabled() {
  return process.env.SECURITY_STRICT_BROWSER_HEADERS === "true";
}

function sha256ContentHash(content: string) {
  return `'sha256-${createHash("sha256").update(content).digest("base64")}'`;
}

export function parseAllowedOrigins(value?: string) {
  return (value ?? "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)
    .map((origin) => new URL(origin).origin);
}

function buildStructuredDataHashes(siteUrl: string) {
  return {
    "/": sha256ContentHash(serializeStructuredData(getHomeStructuredData(siteUrl))),
    "/menu": sha256ContentHash(serializeStructuredData(getMenuStructuredData(siteUrl))),
  };
}

export function buildContentSecurityPolicy(pathname: string, siteUrlInput: string, gaIdInput?: string, gtmIdInput?: string) {
  const siteUrl = normalizeSiteUrl(siteUrlInput);
  const gaId = normalizeGoogleAnalyticsId(gaIdInput);
  const gtmId = normalizeGoogleTagManagerId(gtmIdInput);
  const structuredDataHashes = buildStructuredDataHashes(siteUrl);
  // Nuxt hydration, GSAP, Lenis, and smooth-scrolling behavior are all client-runtime concerns.
  // Keep the frontend script policy permissive enough that animation code is never blocked by CSP.
  const scriptSources = ["'self'", "'unsafe-inline'", "'unsafe-eval'", "blob:", "data:"];

  if (pathname in structuredDataHashes) {
    scriptSources.push(structuredDataHashes[pathname as keyof typeof structuredDataHashes]);
  }

  if (gaId || gtmId) {
    scriptSources.push("https://www.googletagmanager.com");
  }

  const connectSources = ["'self'"];

  if (!isProductionRuntime()) {
    connectSources.push("http:", "ws:");
  }

  if (gaId) {
    connectSources.push(
      "https://www.google-analytics.com",
      "https://region1.google-analytics.com",
    );
  }

  if (gaId || gtmId) {
    connectSources.push("https://www.googletagmanager.com");
  }

  const directives: Array<[string, string[]]> = [
    ["default-src", ["'self'"]],
    ["base-uri", ["'self'"]],
    ["frame-ancestors", ["'none'"]],
    ["form-action", ["'self'"]],
    ["object-src", ["'none'"]],
    ["script-src", scriptSources],
    ["style-src", ["'self'", "'unsafe-inline'", "blob:", "https://fonts.googleapis.com"]],
    ["font-src", ["'self'", "data:", "https://fonts.gstatic.com"]],
    ["img-src", ["'self'", "data:", "https://images.unsplash.com"]],
    ["connect-src", connectSources],
    ["frame-src", gtmId ? ["'self'", "https://www.googletagmanager.com"] : ["'self'"]],
    ["worker-src", ["'self'", "blob:"]],
    ["manifest-src", ["'self'"]],
  ];

  if (isProductionRuntime()) {
    directives.push(["upgrade-insecure-requests", []]);
  }

  return directives.map(([name, values]) => (values.length > 0 ? `${name} ${values.join(" ")}` : name)).join("; ");
}

export function applySecurityHeaders({ event, allowedOrigins, gaId, gtmId, siteUrl }: SecurityHeaderOptions) {
  setResponseHeader(event, "referrer-policy", "strict-origin-when-cross-origin");
  setResponseHeader(event, "x-content-type-options", "nosniff");
  setResponseHeader(event, "x-frame-options", "DENY");
  setResponseHeader(event, "x-permitted-cross-domain-policies", "none");
  setResponseHeader(event, "permissions-policy", "camera=(), geolocation=(), microphone=(), payment=(), usb=()");
  setResponseHeader(event, "x-dns-prefetch-control", "off");
  setResponseHeader(event, "vary", allowedOrigins.length > 0 ? "Origin" : "Accept-Encoding");

  if (isProductionRuntime()) {
    setResponseHeader(event, "strict-transport-security", "max-age=31536000; includeSubDomains; preload");

    if (isStrictBrowserHardeningEnabled()) {
      const contentSecurityPolicy = buildContentSecurityPolicy(event.path, siteUrl, gaId, gtmId);
      setResponseHeader(event, "content-security-policy", contentSecurityPolicy);
      setResponseHeader(event, "cross-origin-opener-policy", "same-origin");
      setResponseHeader(event, "cross-origin-resource-policy", "same-site");
      setResponseHeader(event, "origin-agent-cluster", "?1");
    }
  }
}

export async function handleStrictCors(event: H3Event, allowedOrigins: string[]) {
  if (!event.path.startsWith("/api/")) {
    return;
  }

  const origin = getRequestHeader(event, "origin");

  if (!origin) {
    return;
  }

  if (allowedOrigins.length === 0 || !allowedOrigins.includes(new URL(origin).origin)) {
    logSecurityEvent(event, "cors.denied", { origin });
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "CORS origin denied.",
    });
  }

  const handled = handleCors(event, {
    origin: allowedOrigins,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE"],
    allowHeaders: ["content-type", "x-csrf-token", "x-webhook-signature"],
    credentials: true,
    maxAge: "600",
  });

  if (handled && getResponseStatus(event) === 204) {
    setResponseHeader(event, "cache-control", "private, max-age=600");
  }
}
