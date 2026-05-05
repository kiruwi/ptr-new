<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { normalizeGoogleAnalyticsId, normalizeGoogleTagManagerId } from "~/utils/analytics";

const config = useRuntimeConfig();
const gaId = normalizeGoogleAnalyticsId(config.public.googleAnalyticsId);
const gtmId = normalizeGoogleTagManagerId(config.public.googleTagManagerId);
const route = useRoute();
const loaderState = ref<"pending" | "closing" | "hidden">(route.path === "/" ? "pending" : "hidden");

useHead(() => ({
  script: [
    ...(gaId
      ? [
          {
            key: "google-analytics",
            src: `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`,
            async: true,
            crossorigin: "anonymous",
            tagPosition: "head",
          },
          {
            key: "google-analytics-config",
            tagPosition: "head",
            textContent: `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaId)}, {
  anonymize_ip: true,
  transport_type: 'beacon'
});`,
          },
        ]
      : []),
    ...(gtmId
      ? [
        {
          key: "google-tag-manager",
          tagPosition: "head",
          textContent: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(gtmId)});`,
        },
      ]
      : []),
  ],
}));

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

watch(
  () => route.fullPath,
  (path) => {
    if (!import.meta.client || !gaId || typeof window.gtag !== "function") {
      return;
    }

    window.gtag("config", gaId, {
      page_path: path,
      anonymize_ip: true,
      transport_type: "beacon",
    });
  },
);
</script>

<template>
  <noscript v-if="gtmId">
    <iframe
      :src="`https://www.googletagmanager.com/ns.html?id=${gtmId}`"
      height="0"
      width="0"
      style="display:none;visibility:hidden"
    />
  </noscript>
  <NuxtRouteAnnouncer />
  <div
    v-if="loaderState !== 'hidden'"
    :class="`app-loader app-loader--${loaderState}`"
    aria-hidden="true"
  >
    <img
      src="/images/logo.svg?v=7"
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
