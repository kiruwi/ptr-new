import { getMethod, getRequestIP, getRequestURL, type H3Event } from "h3";

const SENSITIVE_KEY_PATTERN =
  /(authorization|cookie|token|secret|password|passwd|api[-_]?key|session|csrf|email|telephone|phone)/i;

function redactString(value: string) {
  if (value.includes("@")) {
    return "[REDACTED_EMAIL]";
  }

  if (value.length <= 4) {
    return "[REDACTED]";
  }

  return `${value.slice(0, 2)}...[REDACTED]`;
}

export function redactSecrets(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => redactSecrets(entry));
  }

  if (!value || typeof value !== "object") {
    return typeof value === "string" ? redactString(value) : value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entry]) => {
      if (SENSITIVE_KEY_PATTERN.test(key)) {
        return [key, "[REDACTED]"];
      }

      return [key, redactSecrets(entry)];
    }),
  );
}

function redactIpAddress(ipAddress?: string | null) {
  if (!ipAddress) {
    return "unknown";
  }

  if (ipAddress.includes(":")) {
    return `${ipAddress.split(":").slice(0, 2).join(":")}::[REDACTED]`;
  }

  const octets = ipAddress.split(".");
  return octets.length === 4 ? `${octets[0]}.${octets[1]}.[REDACTED]` : "[REDACTED_IP]";
}

export function logSecurityEvent(event: H3Event, action: string, detail: Record<string, unknown> = {}) {
  const payload = {
    at: new Date().toISOString(),
    action,
    method: getMethod(event),
    path: getRequestURL(event).pathname,
    ip: redactIpAddress(getRequestIP(event, { xForwardedFor: true })),
    detail: redactSecrets(detail),
  };

  console.warn(JSON.stringify(payload));
}
