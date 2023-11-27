<template>
  <div class="mx-auto flex max-w-6xl flex-col items-center justify-center gap-4">
    <section class="w-full">
      <div class="flex-col gap-9 p-4 lg:flex-row lg:items-start">
        <div class="basis-full lg:basis-2/5">
          <h1 class="text-4xl font-bold">A simple web app for Sudoku!</h1>
          <p class="my-6">Enjoy hours of fun and challenge with Sudoku.</p>
          <div class="mockup-window mb-5 basis-full border bg-base-300 lg:basis-3/5">
            <picture class="block lg:hidden">
              <source srcset="/img/landing/play-mobile-dark.png" media="(prefers-color-scheme: dark)" />
              <img src="/img/landing/play-mobile-light.png" />
            </picture>
            <picture class="hidden lg:block">
              <source srcset="/img/landing/play-dark.png" media="(prefers-color-scheme: dark)" />
              <img src="/img/landing/play-light.png" />
            </picture>
          </div>
          <button class="btn btn-primary btn-block">Play Now</button>
        </div>
      </div>
    </section>
    <section class="w-full">
      <div class="flex-col gap-9 p-4 lg:flex-row lg:items-start">
        <div class="basis-2/5">
          <h2 class="text-4xl font-bold">Sudoku Solver</h2>
          <p class="py-6">A sudoku solver for solving a sudoku puzzle step-by-step to help you learn how to solve sudoku puzzles.</p>
          <div class="mockup-window mb-5 basis-full border bg-base-300 lg:basis-3/5">
            <div class="px-6 pb-6 pt-2">
              <div class="text-xl">Step 6</div>
              <div class="my-3 h-4 w-3/4 bg-base-100"></div>
              <div class="my-3 h-4 w-full bg-base-100"></div>
              <div class="text-xl">Step 7</div>
              <div class="my-3 h-4 w-3/4 bg-base-100"></div>
              <div class="my-3 h-4 w-full bg-base-100"></div>
            </div>
          </div>
          <button class="btn btn-primary btn-block">Try Solver</button>
        </div>
      </div>
    </section>
    <section class="w-full">
      <div class="w-full flex-col gap-9 p-4 lg:flex-row lg:items-start">
        <div class="basis-full lg:basis-2/5">
          <h2 class="text-4xl font-bold">Master Sudoku with helpful tips</h2>
          <p class="py-6">Learn the strategies used in solving Sudoku puzzles.</p>
          <div class="flex-grow basis-2/5">
            <div class="mockup-window mb-4 basis-3/5 border bg-base-300">
              <div class="px-6 pb-6">
                <div class="text-center text-2xl">Learning Sudoku</div>
                <div class="mt-4 h-4 w-1/3 bg-base-100"></div>
                <div class="mt-4 space-y-4">
                  <div class="h-4 w-full bg-base-100"></div>
                  <div class="h-4 w-full bg-base-100"></div>
                  <div class="h-4 w-full bg-base-100"></div>
                </div>
              </div>
            </div>
          </div>
          <button class="btn btn-primary btn-block">Explore Tips</button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.custom-box-shadow {
  --tw-shadow-colored: 0 0px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
}
</style>
```
