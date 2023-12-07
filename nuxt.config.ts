// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
    },
  },
  devtools: { enabled: true },
  modules: ["@vueuse/nuxt", "@pinia/nuxt", "nuxt-particles", "@nuxt/content", "nuxt-simple-robots", "nuxt-simple-sitemap"],
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
  sitemap: {
    exclude: ["/solver/solution"],
  },
});
