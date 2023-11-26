<template>
  <div></div>
</template>

<script lang="ts" setup>
definePageMeta({
  middleware: (_to, _from) => {
    return navigateTo("/play");
  },
});
</script>
