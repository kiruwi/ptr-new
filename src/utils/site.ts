const DEFAULT_SITE_URL = "https://www.patamurestaurants.com";

export function normalizeSiteUrl(url?: string) {
  return (url?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export function absoluteUrl(siteUrl: string, path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizeSiteUrl(siteUrl)}${normalizedPath}`;
}
