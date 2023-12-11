<template>
  <div class="mx-auto flex max-w-6xl flex-col items-center gap-10 lg:pt-4">
    <section class="w-full p-4 md:p-6">
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr] lg:grid-rows-[auto_minmax(0,_1fr)]">
        <div>
          <h1 class="text-4xl font-bold md:text-5xl">A simple web app for Sudoku!</h1>
          <p class="mt-4">Enjoy hours of fun and challenge with Sudoku.</p>
        </div>
        <div class="mockup-window border bg-base-300 lg:row-span-2">
          <picture class="block sm:hidden">
            <source srcset="/img/landing/play-mobile-dark.png" media="(prefers-color-scheme: dark)" width="750" height="1200" />
            <img src="/img/landing/play-mobile-light.png" width="750" height="1200" alt="play-ui" />
          </picture>
          <picture class="hidden sm:block">
            <source srcset="/img/landing/play-dark.png" media="(prefers-color-scheme: dark)" width="2860" height="1700" />
            <img src="/img/landing/play-light.png" width="2860" height="1700" alt="play-ui" />
          </picture>
        </div>
        <NuxtLink to="/play" class="btn btn-primary btn-block sm:w-fit">Play Now</NuxtLink>
      </div>
    </section>
    <section class="w-full p-4 md:p-6">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-[2fr_3fr] md:grid-rows-[auto_minmax(0,_1fr)]">
        <div>
          <h2 class="text-3xl font-bold md:text-4xl">Sudoku Solver</h2>
          <p class="mt-4">A sudoku solver for solving a sudoku puzzle step-by-step to help you learn how to solve sudoku puzzles.</p>
        </div>
        <div class="mockup-window border bg-base-300 md:-order-1 md:row-span-2">
          <div class="px-6 pb-6 pt-2">
            <div class="text-xl">Step 6</div>
            <div class="my-3 h-4 w-3/4 bg-base-100"></div>
            <div class="my-3 h-4 w-full bg-base-100"></div>
            <div class="text-xl">Step 7</div>
            <div class="my-3 h-4 w-3/4 bg-base-100"></div>
            <div class="my-3 h-4 w-full bg-base-100"></div>
          </div>
        </div>
        <NuxtLink to="/solver" class="btn btn-primary btn-block sm:w-fit">Try Solver</NuxtLink>
      </div>
    </section>

    <section class="w-full p-4 md:p-6">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-[2fr_3fr] md:grid-rows-[auto_minmax(0,_1fr)]">
        <div>
          <h2 class="text-3xl font-bold md:text-4xl">Master Sudoku with helpful tips</h2>
          <p class="mt-4">Learn the strategies used in solving Sudoku puzzles.</p>
        </div>
        <div class="mockup-window border bg-base-300 md:row-span-2">
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
        <NuxtLink to="/strategies" class="btn btn-primary btn-block sm:w-fit">Explore Tips</NuxtLink>
      </div>
    </section>

    <section class="w-full p-4 md:p-6">
      <h2 class="text-3xl font-bold md:text-4xl">Play offline</h2>
      <p class="my-4">Install the web app as PWA and play offline.</p>
      <ClientOnly>
        <button v-if="$pwa" class="btn btn-primary" @click="$pwa.install()">Install</button>
      </ClientOnly>
    </section>
  </div>
</template>

<style scoped>
.custom-box-shadow {
  --tw-shadow-colored: 0 0px 6px -1px var(--tw-shadow-color), 0 2px 4px -2px var(--tw-shadow-color);
}
</style>
