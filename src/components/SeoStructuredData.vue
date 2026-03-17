<script setup lang="ts">
import { serializeStructuredData, type StructuredDataValue } from "~/utils/structuredData";

const props = defineProps<{
  data: StructuredDataValue;
  id?: string;
}>();

useHead(() => ({
  script: [
    {
      key: props.id ?? "structured-data",
      type: "application/ld+json",
      innerHTML: serializeStructuredData(props.data),
    },
  ],
}));
</script>

<template></template>
