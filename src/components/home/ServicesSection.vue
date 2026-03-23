<script setup lang="ts">
defineProps<{
  items: string[];
}>();
</script>

<template>
  <section class="menu-split reveal">
    <article class="menu-list-wrap">
      <p class="section-label">Our Services</p>
      <ul>
        <li v-for="item in items" :key="item">{{ item }}</li>
      </ul>
    </article>

    <article class="menu-photo image-bar" aria-hidden="true">
      <img
        src="https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1000&q=80"
        alt=""
        loading="lazy"
        decoding="async"
        class="media-fill"
      >
    </article>
  </section>
</template>
