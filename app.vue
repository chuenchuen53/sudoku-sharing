<template>
  <div id="app">
    <NuxtLayout>
      <div>
        <NuxtLoadingIndicator />
        <NuxtPage />
      </div>
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { useDark } from "@vueuse/core";
useDark();
</script>
