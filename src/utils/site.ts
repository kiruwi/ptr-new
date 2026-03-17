const DEFAULT_SITE_URL = "https://patamurestaurants.com";

export function normalizeSiteUrl(url?: string) {
  const candidate = url?.trim() || DEFAULT_SITE_URL;
  let parsedUrl: URL;

  try {
    parsedUrl = new URL(candidate);
  } catch {
    throw new Error("NUXT_PUBLIC_SITE_URL must be an absolute URL.");
  }

  if (!["https:", "http:"].includes(parsedUrl.protocol)) {
    throw new Error("NUXT_PUBLIC_SITE_URL must use http or https.");
  }

  if (process.env.NODE_ENV === "production" && parsedUrl.protocol !== "https:") {
    throw new Error("NUXT_PUBLIC_SITE_URL must use https in production.");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("NUXT_PUBLIC_SITE_URL must not include credentials.");
  }

  parsedUrl.hash = "";
  parsedUrl.search = "";

  return parsedUrl.toString().replace(/\/+$/, "");
}

export function absoluteUrl(siteUrl: string, path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizeSiteUrl(siteUrl)}${normalizedPath}`;
}
