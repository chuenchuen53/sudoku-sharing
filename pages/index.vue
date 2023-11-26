<template>
  <div class="max-w-5xl flex flex-col items-center justify-center mx-auto">
    <section>
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
    <section>
      <div class="flex">
        <div class="mockup-window border bg-base-300 basis-3/5">
          <div class="flex justify-center">
            <picture>
              <source srcset="/img/landing/solver-dark.png" media="(prefers-color-scheme: dark)" />
              <img src="/img/landing/solver-light.png" />
            </picture>
          </div>
        </div>
        <div>
          <div class="text-3xl">Sudoku Solver</div>
          <div>A sudoku solver for solving a sudoku puzzle step-by-step to help you learn how to solve sudoku puzzles.</div>
          <button>Try Solver</button>
        </div>
      </div>
    </section>
    <section>
      <div class="flex">
        <div>
          <div class="text-3xl">Master Sudoku with helpful tips</div>
          <div>Learn the strategies used in solving Sudoku puzzles.</div>
          <button>Explore Tips</button>
        </div>
        <div>
          <div class="mockup-phone">
            <div class="camera"></div>
            <div class="display">
              <div class="artboard artboard-demo phone-1 justify-start bg-base-200">
                <div class="mt-14 text-3xl">Learning Sudoku</div>
                <div class="flex flex-col gap-4 w-52 mt-8">
                  <div class="skeleton h-52 w-full"></div>
                  <div class="skeleton h-4 w-full"></div>
                  <div class="skeleton h-4 w-full"></div>
                  <div class="skeleton h-4 w-full"></div>
                  <div class="skeleton h-4 w-full"></div>
                  <div class="skeleton h-4 w-full"></div>
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
