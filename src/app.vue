<script setup lang="ts">
import "./assets/styles/Globals.css";

const config = useRuntimeConfig();
const gaId = config.public.googleAnalyticsId;

if (gaId) {
  useHead({
    script: [
      {
        src: `https://www.googletagmanager.com/gtag/js?id=${gaId}`,
        async: true,
        tagPosition: "bodyClose",
      },
      {
        key: "google-tag-manager-inline",
        tagPosition: "bodyClose",
        innerHTML: [
          "window.dataLayer = window.dataLayer || [];",
          "function gtag(){dataLayer.push(arguments);}",
          "gtag('js', new Date());",
          `gtag('config', '${gaId}');`,
        ].join(""),
      },
    ],
  });
}
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtPage />
</template>
