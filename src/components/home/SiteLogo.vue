<script setup lang="ts">
defineProps<{
  priority?: boolean;
}>();
</script>

<template>
  <img
    src="/images/logo.svg?v=7"
    alt="Patamu logo"
    width="300"
    height="120"
    :fetchpriority="priority ? 'high' : undefined"
    :loading="priority ? 'eager' : 'lazy'"
    decoding="async"
  >
</template>
