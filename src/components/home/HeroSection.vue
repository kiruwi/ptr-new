<script setup lang="ts">
import SiteLogo from "~/components/home/SiteLogo.vue";
import TopMiniNav from "~/components/home/TopMiniNav.vue";
import { siteInfo } from "~/data/site";
</script>

<template>
  <header class="hero-wrap" id="home">
    <a
      class="hero-global-rating"
      :href="siteInfo.googleReviewsUrl"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="View Patamu Restaurant, Lodge & Safaris Google rating of 4.3 from 95 reviews"
    >
      <span class="hero-global-rating__google" aria-hidden="true">
        <svg viewBox="0 0 533.5 544.3" role="presentation" focusable="false">
          <path
            fill="currentColor"
            d="M533.5 278.4c0-18.5-1.5-37-4.7-55.2H272v104.5h147.1c-6.1 33.1-24.9 61.1-53 79.8v66h85.8c50.2-46.2 81.6-114.4 81.6-195.1Z"
          />
          <path
            fill="currentColor"
            d="M272 544.3c73.6 0 135.6-24.4 180.8-66.1l-85.8-66c-23.9 16.3-54.4 25.9-95 25.9-72.9 0-134.7-49.2-156.8-115.3H26.6v68.1c46.2 91.9 141.3 153.4 245.4 153.4Z"
          />
          <path
            fill="currentColor"
            d="M115.2 322.8c-10.4-30.9-10.4-64.5 0-95.4V159.3H26.6c-38.6 76.9-38.6 167.9 0 244.8l88.6-68.1Z"
          />
          <path
            fill="currentColor"
            d="M272 107.7c42 0 79.7 14.5 109.4 42.9l81.8-81.8C407.5 24.4 345.6 0 272 0 167.9 0 72.8 61.5 26.6 159.3l88.6 68.1C137.3 156.9 199.1 107.7 272 107.7Z"
          />
        </svg>
      </span>
      <span class="hero-global-rating__text">
        <strong>4.3</strong> on Google from <strong>95 reviews</strong>
      </span>
      <span class="hero-global-rating__stars" aria-hidden="true">
        ★★★★☆
      </span>
    </a>

    <a class="site-logo site-logo--hero" href="#home" aria-label="Patamu home">
      <SiteLogo class="site-logo__image" :priority="true" />
    </a>

    <article class="hero-image image-arch" aria-hidden="true">
      <img
        :src="siteInfo.image"
        alt=""
        fetchpriority="high"
        loading="eager"
        decoding="async"
        class="media-fill"
      >
    </article>

    <article class="hero-content">
      <TopMiniNav />

      <h1>
        Patamu
        <span>Restaurant, Lodge &</span>
        <span> Safaris</span>
      </h1>

      <p>
        Celebrated for its facilities, atmosphere and service, Patamu Restaurant &amp; Bar offers a
        tranquil setting for business and leisure guests in Karatu, Tanzania.
      </p>

      <p class="hero-symbols">✤ ✤</p>
    </article>
  </header>
</template>
