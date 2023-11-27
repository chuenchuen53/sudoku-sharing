<template>
  <div class="max-w-5xl flex flex-col items-center justify-center mx-auto">
    <section class="my-10">
      <div class="hero">
        <div class="hero-content flex-col lg:flex-row lg:items-start gap-9">
          <div class="basis-2/5">
            <h1 class="text-5xl font-bold">A simple web app for Sudoku!</h1>
            <p class="py-6">Enjoy hours of fun and challenge with Sudoku.</p>
            <button class="btn btn-primary">Play Now</button>
          </div>
          <div class="mockup-window border bg-base-300 basis-3/5">
            <div class="flex justify-center">
              <picture>
                <source srcset="/img/landing/play-dark.png" media="(prefers-color-scheme: dark)" />
                <img src="/img/landing/play-light.png" />
              </picture>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="my-10">
      <div class="hero">
        <div class="hero-content flex-col lg:flex-row lg:items-start gap-9">
          <div class="mockup-window border bg-base-300 basis-3/5">
            <div class="flex justify-center">
              <picture>
                <source srcset="/img/landing/solver-dark.png" media="(prefers-color-scheme: dark)" />
                <img src="/img/landing/solver-light.png" />
              </picture>
            </div>
          </div>
          <div class="basis-2/5">
            <h2 class="text-4xl font-bold">Sudoku Solver</h2>
            <p class="py-6">A sudoku solver for solving a sudoku puzzle step-by-step to help you learn how to solve sudoku puzzles.</p>
            <button class="btn btn-primary">Try Solver</button>
          </div>
        </div>
      </div>
    </section>
    <section class="my-10">
      <div class="hero">
        <div class="hero-content flex-col lg:flex-row lg:items-start gap-9">
          <div class="basis-2/5">
            <h2 class="text-4xl font-bold">Master Sudoku with helpful tips</h2>
            <p class="py-6">Learn the strategies used in solving Sudoku puzzles.</p>
            <button class="btn btn-primary">Explore Tips</button>
          </div>
          <div class="basis-2/5 flex-grow">
            <div class="mockup-window border bg-base-300 basis-3/5">
              <div class="pb-6 px-6">
                <div class="text-2xl text-center">Learning Sudoku</div>
                <div class="mt-4 bg-base-100 w-1/3 h-4"></div>
                <div class="mt-4 space-y-4">
                  <div class="bg-base-100 h-4 w-full"></div>
                  <div class="bg-base-100 h-4 w-full"></div>
                  <div class="bg-base-100 h-4 w-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup></script>
