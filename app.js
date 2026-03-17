process.env.NODE_ENV ||= "production";

const REDACTION_PATTERN =
  /((?:authorization|cookie|token|secret|password|passwd|api[_-]?key|session)=)([^&\s]+)/gi;

function sanitizeLogValue(value) {
  return String(value ?? "")
    .replace(REDACTION_PATTERN, "$1[REDACTED]")
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]");
}

function formatStartupError(error) {
  if (!error || typeof error !== "object") {
    return sanitizeLogValue(error);
  }

  const { code, message, statusCode } = error;
  const parts = [
    code ? `code=${sanitizeLogValue(code)}` : "",
    statusCode ? `status=${sanitizeLogValue(statusCode)}` : "",
    message ? `message=${sanitizeLogValue(message)}` : "message=startup failure",
  ].filter(Boolean);

  return parts.join(" ");
}

function logFatalError(error) {
  console.error(`[startup] ${formatStartupError(error)}`);
}

process.on("unhandledRejection", (error) => {
  logFatalError(error);
  process.exitCode = 1;
});

process.on("uncaughtException", (error) => {
  logFatalError(error);
  process.exit(1);
});

import("./.output/server/index.mjs").catch((error) => {
  logFatalError(error);
  process.exit(1);
});
