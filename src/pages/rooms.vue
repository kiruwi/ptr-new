<script setup lang="ts">
import { computed, ref } from "vue";
import BottomNoteSection from "~/components/home/BottomNoteSection.vue";
import SiteFooter from "~/components/home/SiteFooter.vue";
import { roomSuites } from "~/data/rooms";
import { siteInfo } from "~/data/site";
import { getRoomsStructuredData } from "~/utils/structuredData";
import { absoluteUrl, normalizeSiteUrl } from "~/utils/site";

type RoomFilterKey = "all" | (typeof roomSuites)[number]["slug"];

const runtimeConfig = useRuntimeConfig();
const siteUrl = normalizeSiteUrl(runtimeConfig.public.siteUrl);
const pageUrl = absoluteUrl(siteUrl, "/rooms");
const imageUrl = absoluteUrl(siteUrl, roomSuites[0]?.images[0]?.src ?? siteInfo.image);
const pageTitle = `Patamu Rooms | ${siteInfo.name}`;

const roomFilters = [
  { key: "all" as const, label: "All Rooms" },
  ...roomSuites.map((suite) => ({
    key: suite.slug,
    label: suite.shortLabel,
  })),
];

const activeFilter = ref<RoomFilterKey>("all");
const activeRoomImages = ref(roomSuites.map(() => 0));
const touchStartX = ref<number | null>(null);

const roomSuitesWithIndex = roomSuites.map((suite, index) => ({
  suite,
  index,
}));

const filteredSuites = computed(() =>
  roomSuitesWithIndex.filter(({ suite }) => activeFilter.value === "all" || suite.slug === activeFilter.value),
);

function showRoomImage(roomIndex: number, imageIndex: number) {
  activeRoomImages.value[roomIndex] = imageIndex;
}

function advanceRoomImage(roomIndex: number) {
  const imageCount = roomSuites[roomIndex]?.images.length ?? 0;

  if (imageCount < 2) {
    return;
  }

  const currentIndex = activeRoomImages.value[roomIndex] ?? 0;
  activeRoomImages.value[roomIndex] = (currentIndex + 1) % imageCount;
}

function retreatRoomImage(roomIndex: number) {
  const imageCount = roomSuites[roomIndex]?.images.length ?? 0;

  if (imageCount < 2) {
    return;
  }

  const currentIndex = activeRoomImages.value[roomIndex] ?? 0;
  activeRoomImages.value[roomIndex] = (currentIndex - 1 + imageCount) % imageCount;
}

function getActiveRoomImageIndex(roomIndex: number) {
  return activeRoomImages.value[roomIndex] ?? 0;
}

function getActiveRoomImage(roomIndex: number) {
  const suite = roomSuites[roomIndex];
  const activeIndex = getActiveRoomImageIndex(roomIndex);

  return suite?.images[activeIndex] ?? suite?.images[0];
}

function getRoomFeatureIcon(feature: string) {
  if (feature.startsWith("Sleeps")) {
    return "guest";
  }

  if (feature === "Private bath") {
    return "bath";
  }

  if (feature === "Wi-Fi") {
    return "wifi";
  }

  return "breakfast";
}

function handleRoomTouchStart(event: TouchEvent) {
  touchStartX.value = event.touches[0]?.clientX ?? null;
}

function handleRoomTouchEnd(event: TouchEvent, roomIndex: number) {
  if (touchStartX.value === null) {
    return;
  }

  const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX.value;
  const deltaX = touchEndX - touchStartX.value;
  touchStartX.value = null;

  if (Math.abs(deltaX) < 36) {
    return;
  }

  if (deltaX < 0) {
    advanceRoomImage(roomIndex);
    return;
  }

  retreatRoomImage(roomIndex);
}

useSeoMeta({
  title: pageTitle,
  description: siteInfo.roomsDescription,
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  ogTitle: pageTitle,
  ogDescription: siteInfo.roomsDescription,
  ogType: "website",
  ogUrl: pageUrl,
  ogImage: imageUrl,
  ogSiteName: siteInfo.name,
  twitterCard: "summary_large_image",
  twitterTitle: pageTitle,
  twitterDescription: siteInfo.roomsDescription,
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

const structuredData = getRoomsStructuredData(siteUrl);
</script>

<template>
  <SeoStructuredData :data="structuredData" />

  <div class="rooms-page">
    <main class="rooms-shell">
      <header class="rooms-header">
        <NuxtLink to="/" class="restaurant-menu-home">
          Back to home
        </NuxtLink>

        <div class="rooms-intro">
          <h1>Rooms</h1>
          <p>Comfortable suites with warm wood touches and a calm lodge atmosphere in the heart of Karatu.</p>
        </div>
      </header>

      <nav class="rooms-filters" aria-label="Room filters">
        <button
          v-for="filter in roomFilters"
          :key="filter.key"
          type="button"
          class="rooms-filter"
          :class="{ 'is-active': activeFilter === filter.key }"
          @click="activeFilter = filter.key"
        >
          {{ filter.label }}
        </button>
      </nav>

      <section class="rooms-stack" aria-label="Room suites">
        <article
          v-for="{ suite, index } in filteredSuites"
          :id="`suite-${suite.slug}`"
          :key="suite.slug"
          class="room-card"
          :class="{ 'room-card--all': activeFilter === 'all' }"
        >
          <figure
            class="room-card__media"
            @touchstart="handleRoomTouchStart"
            @touchend="handleRoomTouchEnd($event, index)"
          >
            <img
              :src="getActiveRoomImage(index)?.src"
              :alt="getActiveRoomImage(index)?.alt"
              loading="lazy"
            >

            <div class="room-card__dots" :aria-label="`${suite.title} gallery`">
              <button
                v-for="(image, imageIndex) in suite.images"
                :key="image.src"
                type="button"
                class="room-card__dot"
                :class="{ 'is-active': getActiveRoomImageIndex(index) === imageIndex }"
                :aria-label="`Show ${suite.title} photo ${imageIndex + 1}`"
                @click="showRoomImage(index, imageIndex)"
              >
                <span class="sr-only">Show photo {{ imageIndex + 1 }}</span>
              </button>
            </div>
          </figure>

          <div class="room-card__body">
            <h2>{{ suite.title }}</h2>
            <p class="room-card__description">
              {{ suite.description }}
            </p>

            <ul class="room-card__features" aria-label="Room features">
              <li v-for="feature in suite.features" :key="feature">
                <span class="room-card__feature-mark" aria-hidden="true">
                  <svg v-if="getRoomFeatureIcon(feature) === 'guest'" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-7 8a7 7 0 0 1 14 0"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                    />
                  </svg>
                  <svg v-else-if="getRoomFeatureIcon(feature) === 'bath'" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 11h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2Zm3 0V7a2 2 0 0 1 4 0v1"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                    />
                    <path d="M17 6h.01" stroke="currentColor" stroke-linecap="round" stroke-width="1.8" />
                  </svg>
                  <svg v-else-if="getRoomFeatureIcon(feature) === 'wifi'" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 9a11 11 0 0 1 14 0M8 12a6.5 6.5 0 0 1 8 0m-5 3a2 2 0 0 1 2 0"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                    />
                    <circle cx="12" cy="18" r="1" fill="currentColor" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 11h13a3 3 0 0 1 3 3v1H4Zm2-5v5m10-2V6M6 16v2m10-2v2"
                      stroke="currentColor"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1.8"
                    />
                  </svg>
                </span>
                <span>{{ feature }}</span>
              </li>
            </ul>

            <div class="room-card__actions">
              <a href="#contact" class="room-card__button room-card__button--primary">Book Now</a>
            </div>
          </div>
        </article>
      </section>

      <section class="rooms-cta" aria-labelledby="rooms-cta-title">
        <div class="rooms-cta__copy">
          <div class="rooms-cta__icon" aria-hidden="true">◌</div>
          <div>
            <h2 id="rooms-cta-title">Ready to book your room?</h2>
            <p>Contact Patamu for availability, rates, and room reservations.</p>
          </div>
        </div>

        <a href="#contact" class="rooms-cta__action">Check Availability</a>
      </section>
    </main>

    <div class="rooms-shell rooms-shell--footer">
      <SiteFooter />
      <BottomNoteSection />
    </div>
  </div>
</template>
