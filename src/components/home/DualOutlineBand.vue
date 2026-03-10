<script setup lang="ts">
withDefaults(
  defineProps<{
    topText: string;
    bottomText: string;
    alt?: boolean;
  }>(),
  {
    alt: false,
  },
);
</script>

<template>
  <section :class="`outline-band outline-band-dual reveal${alt ? ' alt' : ''}`" aria-hidden="true">
    <p class="outline-line outline-top">{{ topText }}</p>
    <p class="outline-line outline-bottom">{{ bottomText }}</p>
  </section>
</template>
