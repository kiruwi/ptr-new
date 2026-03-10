<script setup lang="ts">
import BottomNoteSection from "~/components/home/BottomNoteSection.vue";
import DualOutlineBand from "~/components/home/DualOutlineBand.vue";
import FeatureSection from "~/components/home/FeatureSection.vue";
import HeroSection from "~/components/home/HeroSection.vue";
import HomeAnimations from "~/components/home/HomeAnimations.client.vue";
import LunchInTheWildSection from "~/components/home/LunchInTheWildSection.vue";
import SiteFooter from "~/components/home/SiteFooter.vue";
import SmoothScrollProvider from "~/components/home/SmoothScrollProvider.client.vue";
import SocialSection from "~/components/home/SocialSection.vue";
import ServicesSection from "~/components/home/ServicesSection.vue";
import StayIntroSection from "~/components/home/StayIntroSection.vue";
import SuitesSection from "~/components/home/SuitesSection.vue";
import { serviceItems, suiteCards, topMarqueeText } from "~/data/home";
import { siteInfo } from "~/data/site";
import { absoluteUrl, normalizeSiteUrl } from "~/utils/site";

const runtimeConfig = useRuntimeConfig();
const siteUrl = normalizeSiteUrl(runtimeConfig.public.siteUrl);
const pageUrl = absoluteUrl(siteUrl, "/");
const imageUrl = absoluteUrl(siteUrl, siteInfo.image);

useSeoMeta({
  title: siteInfo.title,
  description: siteInfo.description,
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  ogTitle: siteInfo.title,
  ogDescription: siteInfo.description,
  ogType: "website",
  ogUrl: pageUrl,
  ogImage: imageUrl,
  ogSiteName: siteInfo.name,
  twitterCard: "summary_large_image",
  twitterTitle: siteInfo.title,
  twitterDescription: siteInfo.description,
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
        ratingValue: 4.2,
        reviewCount: 94,
      },
      hasMenu: absoluteUrl(siteUrl, "/menu"),
      sameAs: [siteInfo.instagramUrl],
    },
  ],
};
</script>

<template>
  <SeoStructuredData :data="structuredData" />

  <SmoothScrollProvider>
    <main class="gem-shell">
      <HomeAnimations />
      <HeroSection />
      <DualOutlineBand :top-text="topMarqueeText" :bottom-text="topMarqueeText" />
      <FeatureSection />
      <LunchInTheWildSection />
      <ServicesSection :items="serviceItems" />
      <StayIntroSection />
      <SuitesSection :items="suiteCards" />
      <SocialSection />
      <SiteFooter />
      <BottomNoteSection />
    </main>
  </SmoothScrollProvider>
</template>
