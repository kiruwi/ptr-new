<script setup lang="ts">
import { siteInfo } from "~/data/site";

const socialImages = [
  {
    className: "image-social-two",
    imageSrc: "/images/insta1.webp",
    label: "Visit Patamu Lodge on Instagram (image 1)",
  },
  {
    className: "image-social-three",
    imageSrc: "/images/insta2.webp",
    label: "Visit Patamu Lodge on Instagram (image 2)",
  },
  {
    className: "image-social-four",
    imageSrc: "/images/insta3.webp",
    label: "Visit Patamu Lodge on Instagram (image 3)",
  },
];
</script>

<template>
  <section class="social-row reveal">
    <article class="social-title">
      <h2>
        Follow
        <br>
        Us On
        <br>
        Instagram
      </h2>
    </article>

    <article class="social-grid">
      <a
        v-for="item in socialImages"
        :key="item.className"
        :class="`social-link ${item.className}`"
        :href="siteInfo.instagramUrl"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="item.label"
      >
        <img :src="item.imageSrc" alt="" loading="lazy" decoding="async" class="media-fill">
        <span class="social-link__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="presentation" focusable="false">
            <path
              d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
              fill="currentColor"
            />
          </svg>
        </span>
      </a>
    </article>
  </section>
</template>
