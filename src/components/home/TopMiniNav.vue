<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue";
import SiteLogo from "~/components/home/SiteLogo.vue";
import { siteInfo } from "~/data/site";

type NavLink = {
  href: string;
  label: string;
  external?: boolean;
};

const navLinks: NavLink[] = [
  { href: "/menu", label: "Our Menu" },
  { href: "/rooms", label: "Rooms" },
];

const isOpen = ref(false);
const isMounted = ref(false);
const navRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const floatingControlsRef = ref<HTMLElement | null>(null);

function closeMenu() {
  isOpen.value = false;
}

function toggleMenu() {
  isOpen.value = !isOpen.value;
}

function containsTarget(element: HTMLElement | null, target: Node | null) {
  return Boolean(element && target && element.contains(target));
}

function handlePointerDown(event: PointerEvent) {
  const target = event.target as Node | null;

  if (
    containsTarget(navRef.value, target) ||
    containsTarget(panelRef.value, target) ||
    containsTarget(floatingControlsRef.value, target)
  ) {
    return;
  }

  closeMenu();
}

function handleEscape(event: KeyboardEvent) {
  if (event.key === "Escape") {
    closeMenu();
  }
}

onMounted(() => {
  isMounted.value = true;
  document.addEventListener("pointerdown", handlePointerDown);
  document.addEventListener("keydown", handleEscape);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", handlePointerDown);
  document.removeEventListener("keydown", handleEscape);
});

watch(isOpen, (open, _, onCleanup) => {
  if (!open || !import.meta.client) {
    return;
  }

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  onCleanup(() => {
    document.body.style.overflow = previousOverflow;
  });
});
</script>

<template>
  <nav :class="`top-mini-nav${isOpen ? ' is-open' : ''}`" aria-label="Primary" ref="navRef">
    <div class="top-mini-nav__controls">
      <button
        :class="`top-mini-nav__toggle top-mini-nav__toggle--anchor${isOpen ? ' is-open' : ''}`"
        type="button"
        :aria-expanded="isOpen"
        aria-controls="top-mini-nav-links"
        @click="toggleMenu"
      >
        <span class="sr-only">{{ isOpen ? "Close navigation menu" : "Open navigation menu" }}</span>
        <span class="top-mini-nav__icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span class="top-mini-nav__text">Menu</span>
      </button>
    </div>
  </nav>

  <Teleport v-if="isMounted && isOpen" to="body">
    <div class="top-mini-nav__floating-controls" ref="floatingControlsRef">
      <button
        class="top-mini-nav__toggle top-mini-nav__toggle--floating is-open"
        type="button"
        :aria-expanded="isOpen"
        aria-controls="top-mini-nav-links"
        @click="closeMenu"
      >
        <span class="sr-only">Close navigation menu</span>
        <span class="top-mini-nav__icon" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <span class="top-mini-nav__text">Menu</span>
      </button>
    </div>

    <div
      class="top-mini-nav__panel is-open"
      id="top-mini-nav-links"
      role="dialog"
      aria-modal="true"
      ref="panelRef"
    >
      <section class="top-mini-nav__left image-chef">
        <SiteLogo class="top-mini-nav__logo top-mini-nav__logo--left" />
        <ul class="top-mini-nav__links">
          <li v-for="link in navLinks" :key="link.href">
            <a v-if="link.external" :href="link.href" @click="closeMenu">{{ link.label }}</a>
            <NuxtLink v-else :to="link.href" @click="closeMenu">{{ link.label }}</NuxtLink>
          </li>
        </ul>
      </section>

      <section class="top-mini-nav__right">
        <address>
          {{ siteInfo.addressLocality }}
          <br>
          {{ siteInfo.addressRegion }}
          <br>
          Tanzania
        </address>
        <a :href="`tel:${siteInfo.telephone}`">+255 620 600 100</a>
        <a :href="`tel:${siteInfo.alternateTelephone}`">+255 762 413 810</a>
        <a :href="`mailto:${siteInfo.reservationsEmail}`">{{ siteInfo.reservationsEmail }}</a>
        <a :href="`mailto:${siteInfo.salesEmail}`">{{ siteInfo.salesEmail }}</a>

        <div class="top-mini-nav__social" aria-label="Social links">
          <a
            :href="siteInfo.instagramUrl"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <span class="sr-only">Instagram</span>
            <svg viewBox="0 0 24 24" role="presentation" focusable="false" aria-hidden="true">
              <path
                d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a href="https://www.youtube.com" target="_blank" rel="noreferrer" aria-label="YouTube">
            <span class="sr-only">YouTube</span>
            <svg viewBox="0 0 24 24" role="presentation" focusable="false" aria-hidden="true">
              <path
                d="M23 12s0-3.4-.44-5.03a2.98 2.98 0 0 0-2.1-2.1C18.82 4.43 12 4.43 12 4.43s-6.82 0-8.46.44a2.98 2.98 0 0 0-2.1 2.1A19.9 19.9 0 0 0 1 12c0 1.67.2 3.35.44 5.03a2.98 2.98 0 0 0 2.1 2.1c1.64.44 8.46.44 8.46.44s6.82 0 8.46-.44a2.98 2.98 0 0 0 2.1-2.1C23 15.4 23 12 23 12ZM10 15.5v-7l6 3.5-6 3.5Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Facebook">
            <span class="sr-only">Facebook</span>
            <svg viewBox="0 0 24 24" role="presentation" focusable="false" aria-hidden="true">
              <path
                d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.7V4.9c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3V11H8v3h2.1v8h3.4Z"
                fill="currentColor"
              />
            </svg>
          </a>
        </div>
      </section>
    </div>
  </Teleport>
</template>
