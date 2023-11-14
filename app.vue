<template>
  <div id="app">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script>
import { useDark } from "@vueuse/core";
import "normalize.css";
import "element-plus/theme-chalk/dark/css-vars.css";
useDark();
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
  background-color: var(--el-bg-color);
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
}
</style>
