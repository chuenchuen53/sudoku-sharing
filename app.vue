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
useSeoMeta({
  title: "Sudoku",
  description:
    "A simple, free sudoku web app. You can enhance your sudoku skills and have fun. You can play sudoku puzzles of different levels of difficulty, from easy to expert. You can use the solver to get step-by-step guidance on how to solve any sudoku puzzle. You can visit the tips page to learn the basic rules and strategies of sudoku. Whether you are a beginner or a master, this web app will challenge and entertain you.",
  keywords: "simple, free, web app, sudoku, sudoku solver, step-by-step solution, sudoku tips, sudoku puzzles",
});
</script>
