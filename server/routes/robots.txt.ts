import { absoluteUrl, normalizeSiteUrl } from "../../src/utils/site";

export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const siteUrl = normalizeSiteUrl(runtimeConfig.public.siteUrl);

  setResponseHeader(event, "content-type", "text/plain; charset=utf-8");

  return [
    "User-agent: *",
    "Allow: /",
    `Sitemap: ${absoluteUrl(siteUrl, "/sitemap.xml")}`,
  ].join("\n");
});
