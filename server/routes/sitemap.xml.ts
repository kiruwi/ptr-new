import { absoluteUrl, normalizeSiteUrl } from "../../src/utils/site";

export default defineEventHandler((event) => {
  const runtimeConfig = useRuntimeConfig(event);
  const siteUrl = normalizeSiteUrl(runtimeConfig.public.siteUrl);
  const lastModified = new Date().toISOString();

  const pages = [
    {
      loc: absoluteUrl(siteUrl, "/home"),
      changefreq: "weekly",
      priority: "1.0",
    },
    {
      loc: absoluteUrl(siteUrl, "/menu"),
      changefreq: "monthly",
      priority: "0.8",
    },
  ];

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...pages.map(
      (page) => [
        "  <url>",
        `    <loc>${page.loc}</loc>`,
        `    <lastmod>${lastModified}</lastmod>`,
        `    <changefreq>${page.changefreq}</changefreq>`,
        `    <priority>${page.priority}</priority>`,
        "  </url>",
      ].join("\n"),
    ),
    "</urlset>",
  ].join("\n");

  setResponseHeader(event, "content-type", "application/xml; charset=utf-8");

  return xml;
});
