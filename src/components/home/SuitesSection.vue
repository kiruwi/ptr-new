<script setup lang="ts">
defineProps<{
  items: Array<{
    imageClass: string;
  }>;
}>();
</script>

<template>
  <section class="suite-cards suite-cards-scroll reveal">
    <div class="suite-track">
      <article
        v-for="item in items"
        :key="item.imageClass"
        :class="`suite-card ${item.imageClass}`"
        aria-hidden="true"
      />
    </div>
  </section>
</template>
