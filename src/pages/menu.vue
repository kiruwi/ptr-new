<script setup lang="ts">
import BottomNoteSection from "~/components/home/BottomNoteSection.vue";
import SiteFooter from "~/components/home/SiteFooter.vue";
import MenuGroupView from "~/components/menu/MenuGroupView.vue";
import { menuCategories } from "~/data/menu";
import { siteInfo } from "~/data/site";
import { getMenuStructuredData } from "~/utils/structuredData";
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

const structuredData = getMenuStructuredData(siteUrl);
</script>

<template>
  <SeoStructuredData :data="structuredData" />

  <div class="restaurant-menu-page">
    <main class="restaurant-menu-shell">
      <header class="restaurant-menu-header">
        <NuxtLink to="/" class="restaurant-menu-home">
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
    </main>

    <div class="restaurant-menu-shell restaurant-menu-shell--footer">
      <SiteFooter />
      <BottomNoteSection />
    </div>
  </div>
</template>
