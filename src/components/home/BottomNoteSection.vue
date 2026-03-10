<script setup lang="ts">
import { siteInfo } from "~/data/site";

const currentYear = new Date().getFullYear();
</script>

<template>
  <section class="bottom-note">
    <p>
      Copyright © {{ currentYear }} Patamu Restaurants | Design and development by
      <a :href="siteInfo.designerUrl" target="_blank" rel="noreferrer"> Ian K Cheruiyot</a>
    </p>
  </section>
</template>
