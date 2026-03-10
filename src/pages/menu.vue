<script setup lang="ts">
import MenuGroupView from "~/components/menu/MenuGroupView.vue";
import { menuCategories, toNumericPrice } from "~/data/menu";
import { siteInfo } from "~/data/site";
import { absoluteUrl, normalizeSiteUrl } from "~/utils/site";

const runtimeConfig = useRuntimeConfig();
const siteUrl = normalizeSiteUrl(runtimeConfig.public.siteUrl);
const pageUrl = absoluteUrl(siteUrl, "/menu");
const imageUrl = absoluteUrl(siteUrl, siteInfo.image);
const pageTitle = `Patamu Restaurant Menu | ${siteInfo.name}`;

useSeoMeta({
  title: pageTitle,
  description: siteInfo.menuDescription,
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  ogTitle: pageTitle,
  ogDescription: siteInfo.menuDescription,
  ogType: "website",
  ogUrl: pageUrl,
  ogImage: imageUrl,
  ogSiteName: siteInfo.name,
  twitterCard: "summary_large_image",
  twitterTitle: pageTitle,
  twitterDescription: siteInfo.menuDescription,
  twitterImage: imageUrl,
});

useHead({
  link: [
    {
      rel: "canonical",
      href: pageUrl,
    },
  ],
});

const structuredData = {
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
          item: absoluteUrl(siteUrl, "/home"),
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
</script>

<template>
  <SeoStructuredData :data="structuredData" />

  <main class="restaurant-menu-page">
    <div class="restaurant-menu-shell">
      <header class="restaurant-menu-header">
        <NuxtLink to="/home" class="restaurant-menu-home">
          Back to home
        </NuxtLink>
        <div class="restaurant-menu-intro">
          <h1>Patamu Restaurant Menu</h1>
          <p>Freshly prepared African and international dishes.</p>
          <p>All prices in TSH.</p>
        </div>
      </header>

      <section
        v-for="category in menuCategories"
        :key="category.title"
        class="restaurant-menu-category"
        :aria-labelledby="`${category.title.toLowerCase().replace(/\s+/g, '-')}-heading`"
      >
        <figure class="restaurant-menu-media">
          <img :src="category.image" :alt="category.imageAlt" loading="lazy">
        </figure>
        <div class="restaurant-menu-content">
          <h2 :id="`${category.title.toLowerCase().replace(/\s+/g, '-')}-heading`">
            {{ category.title }}
          </h2>
          <MenuGroupView
            v-for="group in category.groups"
            :key="`${category.title}-${group.title}`"
            :group="group"
          />
        </div>
      </section>
    </div>
  </main>
</template>
