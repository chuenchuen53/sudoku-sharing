<template>
  <div id="app">
    <NuxtPwaManifest />
    <NuxtLoadingIndicator />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <ClientOnly>
      <div v-if="showUpdate && $pwa?.needRefresh" class="toast toast-center toast-top top-20">
        <div class="alert flex flex-col items-end bg-base-200 bg-opacity-50 backdrop-blur-sm">
          <button @click="showUpdate = false" class="btn btn-circle btn-ghost btn-sm">
            <IconCross class="text-lg" />
          </button>
          <div class="my-4 min-w-[250px]">New content available.</div>
          <button class="btn btn-primary" @click="$pwa.updateServiceWorker()">Reload</button>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { useDark } from "@vueuse/core";
import IconCross from "./components/Icons/IconCross.vue";

useDark();
useSeoMeta({
  title: "Sudoku",
  description:
    "A simple, free sudoku web app. You can enhance your sudoku skills and have fun. You can play sudoku puzzles of different levels of difficulty, from easy to expert. You can use the solver to get step-by-step guidance on how to solve any sudoku puzzle. You can visit the tips page to learn the basic rules and strategies of sudoku. Whether you are a beginner or a master, this web app will challenge and entertain you.",
  keywords: "simple, free, web app, sudoku, sudoku solver, step-by-step solution, sudoku tips, sudoku puzzles, pwa, offline",
});

const showUpdate = ref(true);
</script>
