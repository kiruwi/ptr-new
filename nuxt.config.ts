export default defineNuxtConfig({
  compatibilityDate: "2026-03-16",
  srcDir: "src/",
  css: ["~/assets/styles/globals.css"],
  devtools: { enabled: false },
  modules: [],
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
        "data-theme": "dark",
      },
      meta: [
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        {
          name: "theme-color",
          content: "#151515",
        },
      ],
      link: [
        {
          rel: "icon",
          href: "/images/favicon.ico",
        },
        {
          rel: "shortcut icon",
          href: "/images/favicon.ico",
        },
        {
          rel: "apple-touch-icon",
          href: "/images/favicon.ico",
        },
        {
          rel: "preconnect",
          href: "https://fonts.googleapis.com",
        },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
      ],
    },
  },
  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || "https://patamurestaurants.com",
      googleAnalyticsId: process.env.NUXT_PUBLIC_GA_ID || "",
    },
  },
  routeRules: {
    "/": { prerender: true },
    "/menu": { prerender: true },
    "/robots.txt": { prerender: true },
    "/sitemap.xml": { prerender: true },
  },
  nitro: {
    prerender: {
      routes: ["/", "/menu", "/robots.txt", "/sitemap.xml"],
    },
  },
});
