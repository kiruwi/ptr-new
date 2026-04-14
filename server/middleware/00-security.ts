import { createError, defineEventHandler, getRequestIP } from "h3";
import { normalizeGoogleAnalyticsId, normalizeGoogleTagManagerId } from "../../src/utils/analytics.ts";
import { assertCsrfProtection, assertOwnership, requireAdminSession, requireAuthenticatedSession } from "../utils/security/auth.ts";
import { applySecurityHeaders, handleStrictCors, parseAllowedOrigins } from "../utils/security/headers.ts";
import { logSecurityEvent } from "../utils/security/logging.ts";
import { assertRateLimit, checkRateLimit } from "../utils/security/rate-limit.ts";

const USER_RESOURCE_PATTERN = /^\/api\/users\/([^/]+)(?:\/|$)/;

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const gaId = normalizeGoogleAnalyticsId(runtimeConfig.public.googleAnalyticsId);
  const gtmId = normalizeGoogleTagManagerId(runtimeConfig.public.googleTagManagerId);
  const allowedOrigins = parseAllowedOrigins(process.env.NUXT_ALLOWED_ORIGINS);

  applySecurityHeaders({
    event,
    allowedOrigins,
    gaId,
    gtmId,
    siteUrl: runtimeConfig.public.siteUrl,
  });

  await handleStrictCors(event, allowedOrigins);

  if (event.path.startsWith("/api/auth/") || event.path.startsWith("/api/admin/")) {
    const rateLimit = checkRateLimit({
      key: `${event.path}:${getRequestIP(event, { xForwardedFor: true }) ?? "unknown"}`,
      max: 10,
      windowMs: 15 * 60 * 1000,
    });

    assertRateLimit(rateLimit);
  }

  if (event.path.startsWith("/api/admin/")) {
    await requireAdminSession(event);
    assertCsrfProtection(event);
    return;
  }

  if (event.path.startsWith("/api/account/")) {
    await requireAuthenticatedSession(event);
    assertCsrfProtection(event);
    return;
  }

  const ownershipMatch = event.path.match(USER_RESOURCE_PATTERN);

  if (ownershipMatch) {
    const { session } = await requireAuthenticatedSession(event);
    assertOwnership(event, session, decodeURIComponent(ownershipMatch[1]));
    assertCsrfProtection(event);
    return;
  }

  if (event.path.startsWith("/api/internal/")) {
    logSecurityEvent(event, "access.internal_denied");
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Internal routes are not publicly accessible.",
    });
  }
});
