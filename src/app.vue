<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { loadGoogleAnalytics, normalizeGoogleAnalyticsId } from "~/utils/analytics";

const config = useRuntimeConfig();
const gaId = normalizeGoogleAnalyticsId(config.public.googleAnalyticsId);
const route = useRoute();
const loaderState = ref<"pending" | "closing" | "hidden">(route.path === "/" ? "pending" : "hidden");

let loaderTimeout: ReturnType<typeof setTimeout> | undefined;

function finishLoader() {
  if (loaderState.value === "hidden") {
    return;
  }

  loaderState.value = "closing";
  loaderTimeout = setTimeout(() => {
    loaderState.value = "hidden";
  }, 320);
}

async function waitForHeroImage() {
  await nextTick();

  const existingImage = document.querySelector<HTMLImageElement>(".hero-image .media-fill");
  const heroImage =
    existingImage ||
    (await new Promise<HTMLImageElement | null>((resolve) => {
      const selector = ".hero-image .media-fill";
      const observer = new MutationObserver(() => {
        const image = document.querySelector<HTMLImageElement>(selector);
        if (image) {
          observer.disconnect();
          resolve(image);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      setTimeout(() => {
        observer.disconnect();
        resolve(document.querySelector<HTMLImageElement>(selector));
      }, 2200);
    }));

  if (!heroImage) {
    return;
  }

  if (heroImage.complete) {
    try {
      await heroImage.decode();
    } catch {
      return;
    }

    return;
  }

  await new Promise<void>((resolve) => {
    const finish = () => resolve();
    heroImage.addEventListener("load", finish, { once: true });
    heroImage.addEventListener("error", finish, { once: true });
  });

  try {
    await heroImage.decode();
  } catch {
    return;
  }
}

onMounted(() => {
  if (gaId) {
    loadGoogleAnalytics(gaId);
  }

  if (route.path !== "/" || loaderState.value === "hidden") {
    return;
  }

  void waitForHeroImage().finally(() => {
    finishLoader();
  });
});

onBeforeUnmount(() => {
  if (loaderTimeout) {
    clearTimeout(loaderTimeout);
  }
});
</script>

<template>
  <NuxtRouteAnnouncer />
  <div
    v-if="loaderState !== 'hidden'"
    :class="`app-loader app-loader--${loaderState}`"
    aria-hidden="true"
  >
    <img
      src="/images/logo.svg?v=6"
      alt=""
      width="300"
      height="120"
      fetchpriority="high"
      decoding="async"
      class="app-loader__logo"
    >
  </div>
  <NuxtPage />
</template>
