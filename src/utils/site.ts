const DEFAULT_SITE_URL = "https://ptr-new.i4nkirui.workers.dev";

export function normalizeSiteUrl(url?: string) {
  return (url?.trim() || DEFAULT_SITE_URL).replace(/\/+$/, "");
}

export function absoluteUrl(siteUrl: string, path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizeSiteUrl(siteUrl)}${normalizedPath}`;
}
