<script setup lang="ts">
import SiteLogo from "~/components/home/SiteLogo.vue";
import { siteInfo } from "~/data/site";
</script>

<template>
  <footer class="gem-footer reveal" id="contact">
    <div>
      <NuxtLink to="/menu">Menu</NuxtLink>
      <NuxtLink to="/rooms">Rooms</NuxtLink>
      <NuxtLink to="/#welcome">Story</NuxtLink>
    </div>

    <div class="footer-center">
      <SiteLogo class="footer-logo" />
      <div aria-hidden="true">
        <span>◌</span>
        <span>◌</span>
        <span>◌</span>
      </div>
    </div>

    <div>
      <a :href="`tel:${siteInfo.telephone}`">+255 620 600 100</a>
      <a :href="`tel:${siteInfo.alternateTelephone}`">+255 762 413 810</a>
      <a href="https://maps.google.com/?q=Karatu+Town+Tanzania" target="_blank" rel="noreferrer">
        Karatu Town, Tanzania
      </a>
      <a :href="`mailto:${siteInfo.reservationsEmail}`">{{ siteInfo.reservationsEmail }}</a>
      <a :href="`mailto:${siteInfo.salesEmail}`">{{ siteInfo.salesEmail }}</a>
    </div>
  </footer>
</template>
