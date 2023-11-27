<template>
  <div class="max-w-6xl flex flex-col items-center justify-center mx-auto gap-4">
    <section class="w-full">
      <div class="p-4 flex-col lg:flex-row lg:items-start gap-9">
        <div class="basis-full lg:basis-2/5">
          <h1 class="text-4xl font-bold">A simple web app for Sudoku!</h1>
          <p class="my-6">Enjoy hours of fun and challenge with Sudoku.</p>
          <div class="mockup-window border bg-base-300 basis-full lg:basis-3/5 mb-5">
            <picture class="block lg:hidden">
              <source srcset="/img/landing/play-mobile-dark.png" media="(prefers-color-scheme: dark)" />
              <img src="/img/landing/play-mobile-light.png" />
            </picture>
            <picture class="hidden lg:block">
              <source srcset="/img/landing/play-dark.png" media="(prefers-color-scheme: dark)" />
              <img src="/img/landing/play-light.png" />
            </picture>
          </div>
          <button class="btn-block btn btn-primary">Play Now</button>
        </div>
      </div>
    </section>
    <section class="w-full">
      <div class="p-4 flex-col lg:flex-row lg:items-start gap-9">
        <div class="basis-2/5">
          <h2 class="text-4xl font-bold">Sudoku Solver</h2>
          <p class="py-6">A sudoku solver for solving a sudoku puzzle step-by-step to help you learn how to solve sudoku puzzles.</p>
          <div class="mockup-window border bg-base-300 basis-full lg:basis-3/5 mb-5">
            <div class="pt-2 px-6 pb-6">
              <div class="text-xl">Step 6</div>
              <div class="my-3 w-3/4 h-4 bg-base-100"></div>
              <div class="my-3 w-full h-4 bg-base-100"></div>
              <div class="text-xl">Step 7</div>
              <div class="my-3 w-3/4 h-4 bg-base-100"></div>
              <div class="my-3 w-full h-4 bg-base-100"></div>
            </div>
          </div>
          <button class="btn btn-block btn-primary">Try Solver</button>
        </div>
      </div>
    </section>
    <section class="w-full">
      <div class="p-4 flex-col lg:flex-row lg:items-start gap-9 w-full">
        <div class="basis-full lg:basis-2/5">
          <h2 class="text-4xl font-bold">Master Sudoku with helpful tips</h2>
          <p class="py-6">Learn the strategies used in solving Sudoku puzzles.</p>
          <div class="basis-2/5 flex-grow">
            <div class="mockup-window border bg-base-300 basis-3/5 mb-4">
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
          <button class="btn btn-block btn-primary">Explore Tips</button>
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
