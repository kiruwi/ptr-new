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

    <article class="menu-photo image-bar" aria-hidden="true" />
  </section>
</template>
