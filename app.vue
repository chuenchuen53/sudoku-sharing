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

// useHead({
//   htmlAttrs: {
//     "data-theme": isDark.value ? "sunset" : "light",
//   },
// });
</script>

<style>
/* stylelint-disable-next-line selector-id-pattern */
html,
body,
#__nuxt,
#app {
  height: 100%;
}

body {
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}
</style>
