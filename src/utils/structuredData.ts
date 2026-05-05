import { menuCategories, toNumericPrice } from "../data/menu.ts";
import { siteInfo } from "../data/site.ts";
import { absoluteUrl, normalizeSiteUrl } from "./site.ts";

export type StructuredDataValue = Record<string, unknown> | Array<Record<string, unknown>>;

export function serializeStructuredData(data: StructuredDataValue) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function getHomeStructuredData(siteUrlInput: string) {
  const siteUrl = normalizeSiteUrl(siteUrlInput);
  const pageUrl = absoluteUrl(siteUrl, "/");
  const imageUrl = absoluteUrl(siteUrl, siteInfo.image);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${pageUrl}#website`,
        url: pageUrl,
        name: siteInfo.name,
        inLanguage: "en",
      },
      {
        "@type": "Restaurant",
        "@id": `${pageUrl}#restaurant`,
        url: pageUrl,
        name: siteInfo.name,
        description: siteInfo.description,
        image: imageUrl,
        servesCuisine: ["African", "International", "Tanzanian"],
        telephone: siteInfo.telephone,
        email: siteInfo.reservationsEmail,
        address: {
          "@type": "PostalAddress",
          addressLocality: siteInfo.addressLocality,
          addressRegion: siteInfo.addressRegion,
          addressCountry: siteInfo.addressCountry,
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: 4.3,
          reviewCount: 95,
        },
        hasMenu: absoluteUrl(siteUrl, "/menu"),
        sameAs: [siteInfo.instagramUrl],
      },
    ],
  };
}

export function getMenuStructuredData(siteUrlInput: string) {
  const siteUrl = normalizeSiteUrl(siteUrlInput);
  const pageUrl = absoluteUrl(siteUrl, "/menu");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl(siteUrl, "/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Menu",
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "Menu",
        "@id": `${pageUrl}#menu`,
        url: pageUrl,
        inLanguage: "en",
        name: "Patamu Restaurant Menu",
        description: "Freshly prepared African and international dishes. All prices in TSH.",
        hasMenuSection: menuCategories.map((category) => ({
          "@type": "MenuSection",
          name: category.title,
          hasMenuSection: category.groups.map((group) => ({
            "@type": "MenuSection",
            name: group.title,
            ...(group.note ? { description: group.note } : {}),
            hasMenuItem: group.items.map((item) => ({
              "@type": "MenuItem",
              name: item.name,
              offers: {
                "@type": "Offer",
                priceCurrency: "TZS",
                price: toNumericPrice(item.price),
              },
            })),
          })),
        })),
      },
    ],
  };
}

export function getRoomsStructuredData(siteUrlInput: string) {
  const siteUrl = normalizeSiteUrl(siteUrlInput);
  const pageUrl = absoluteUrl(siteUrl, "/rooms");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "@id": `${pageUrl}#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: absoluteUrl(siteUrl, "/"),
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Rooms",
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "ItemList",
        "@id": `${pageUrl}#rooms`,
        name: "Patamu Room Types",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Single Suite",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Double Suite",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Triple Suite",
          },
        ],
      },
    ],
  };
}
