<script setup lang="ts">
const props = defineProps<{
  data: Record<string, unknown> | Array<Record<string, unknown>>;
  id?: string;
}>();

const json = computed(() => JSON.stringify(props.data).replace(/</g, "\\u003c"));

useHead(() => ({
  script: [
    {
      key: props.id ?? "structured-data",
      type: "application/ld+json",
      innerHTML: json.value,
    },
  ],
}));
</script>

<template></template>
