<script setup lang="ts">
import { loadGoogleAnalytics, normalizeGoogleAnalyticsId } from "~/utils/analytics";

const config = useRuntimeConfig();
const gaId = normalizeGoogleAnalyticsId(config.public.googleAnalyticsId);

onMounted(() => {
  if (gaId) {
    loadGoogleAnalytics(gaId);
  }
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <NuxtPage />
</template>
