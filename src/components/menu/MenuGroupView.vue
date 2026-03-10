<script setup lang="ts">
import type { MenuGroup } from "~/data/menu";

defineProps<{
  group: MenuGroup;
}>();
</script>

<template>
  <div class="restaurant-menu-group">
    <h3>{{ group.title }}</h3>

    <ul v-if="group.layout === 'lines'" class="restaurant-menu-lines">
      <li v-for="item in group.items" :key="item.name">
        <span>{{ item.name }}</span>
        <span>TSH {{ item.price }}</span>
      </li>
    </ul>

    <table v-else class="restaurant-menu-table">
      <thead>
        <tr>
          <th scope="col">Item</th>
          <th scope="col">Price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in group.items" :key="item.name">
          <td>{{ item.name }}</td>
          <td>TSH {{ item.price }}</td>
        </tr>
      </tbody>
    </table>

    <p v-if="group.note" class="restaurant-menu-note">{{ group.note }}</p>
  </div>
</template>
