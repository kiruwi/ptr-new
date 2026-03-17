import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import argon2 from "argon2";
import { createError, getCookie, getMethod, getRequestHeader, getRequestProtocol, useSession, type H3Event } from "h3";
import { z } from "zod";
import { logSecurityEvent } from "./logging.ts";

export const SESSION_COOKIE_NAME = "__Host-ptr_session";
export const CSRF_COOKIE_NAME = "__Host-ptr_csrf";

const sessionSchema = z.object({
  userId: z.string().min(1).max(128),
  roles: z.array(z.enum(["user", "admin"])).default(["user"]),
});

export type AuthenticatedSession = z.infer<typeof sessionSchema>;

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET?.trim();

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SESSION_SECRET must be set to at least 32 characters.");
  }

  return secret;
}

function cookiesMustBeSecure(event: H3Event) {
  return process.env.NODE_ENV === "production" || getRequestProtocol(event, { xForwardedProto: true }) === "https";
}

function constantTimeEquals(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function getSessionManager(event: H3Event) {
  return useSession<AuthenticatedSession>(event, {
    password: getSessionSecret(),
    name: SESSION_COOKIE_NAME,
    maxAge: 60 * 60 * 12,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: cookiesMustBeSecure(event),
      path: "/",
    },
  });
}

export async function requireAuthenticatedSession(event: H3Event) {
  const sessionManager = await getSessionManager(event);
  const parsedSession = sessionSchema.safeParse(sessionManager.data);

  if (!parsedSession.success) {
    logSecurityEvent(event, "auth.session_missing");
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Authentication required.",
    });
  }

  return {
    sessionManager,
    session: parsedSession.data,
  };
}

export async function requireAdminSession(event: H3Event) {
  const { sessionManager, session } = await requireAuthenticatedSession(event);

  if (!session.roles.includes("admin")) {
    logSecurityEvent(event, "auth.admin_required", { userId: session.userId });
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Admin access required.",
    });
  }

  return {
    sessionManager,
    session,
  };
}

export function assertOwnership(event: H3Event, session: AuthenticatedSession, ownerId: string) {
  if (session.roles.includes("admin") || session.userId === ownerId) {
    return;
  }

  logSecurityEvent(event, "auth.ownership_denied", {
    userId: session.userId,
    ownerId,
  });

  throw createError({
    statusCode: 403,
    statusMessage: "Forbidden",
    message: "You do not have access to this resource.",
  });
}

export function hashOpaqueToken(token: string) {
  return createHash("sha256").update(token).digest("base64url");
}

export function issueCsrfToken() {
  return randomBytes(32).toString("base64url");
}

export function assertCsrfProtection(event: H3Event) {
  if (["GET", "HEAD", "OPTIONS"].includes(getMethod(event))) {
    return;
  }

  const cookieToken = getCookie(event, CSRF_COOKIE_NAME);
  const headerToken = getRequestHeader(event, "x-csrf-token");

  if (!cookieToken || !headerToken || !constantTimeEquals(cookieToken, headerToken)) {
    logSecurityEvent(event, "auth.csrf_failed");
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
      message: "Invalid CSRF token.",
    });
  }
}

export async function hashPassword(password: string) {
  return argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19 * 1024,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function verifyPassword(passwordHash: string, password: string) {
  return argon2.verify(passwordHash, password);
}

export function createPasswordResetToken(ttlMs = 15 * 60 * 1000) {
  const token = randomBytes(32).toString("base64url");

  return {
    token,
    tokenHash: hashOpaqueToken(token),
    expiresAt: Date.now() + ttlMs,
  };
}

export function verifyPasswordResetToken(token: string, tokenHash: string, expiresAt: number) {
  if (Date.now() > expiresAt) {
    return false;
  }

  return constantTimeEquals(hashOpaqueToken(token), tokenHash);
}
