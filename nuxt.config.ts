// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      title: "Sudoku",
    },
  },
  devtools: { enabled: true },
  modules: ["@vueuse/nuxt", "@pinia/nuxt", "nuxt-particles", "@nuxt/content"],
  css: ["~/assets/css/main.css"],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  content: {
    markdown: { anchorLinks: false },
  },
});
