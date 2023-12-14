// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  nitro: {
    static: true,
  },
  app: {
    head: {
      htmlAttrs: {
        lang: "en",
      },
      charset: "utf-8",
      viewport: "width=device-width, initial-scale=1",
      meta: [
        {
          name: "theme-color",
          content: "#1d232a",
          media: "(prefers-color-scheme: dark)",
        },
      ],
      link: [
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
        {
          rel: "apple-touch-icon",
          sizes: "180x180",
          href: "/apple-touch-icon-180x180.png",
          type: "image/png",
        },
        {
          rel: "mask-icon",
          href: "/maskable-icon-512x512.png",
        },
      ],
    },
  },
  devtools: { enabled: true },
  modules: ["@vueuse/nuxt", "@pinia/nuxt", "nuxt-particles", "@nuxt/content", "nuxt-simple-robots", "nuxt-simple-sitemap", "@vite-pwa/nuxt"],
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
  $production: {
    pwa: {
      strategies: "generateSW",
      injectRegister: "auto",
      registerType: "prompt",
      workbox: {
        clientsClaim: true,
        globPatterns: ["**/*.{js,css,html,ico,jpg,png,svg,json,xml,txt,xsl}", "*.{js,css,html,ico,jpg,png,svg,json,xml,txt,xsl}"],
      },
      manifest: {
        name: "Sudoku",
        short_name: "Sudoku",
        start_url: "/play",
        display: "standalone",
        description: "A simple, free sudoku web app. You can enhance your sudoku skills and have fun.",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "apple-touch-icon-180x180.png",
            sizes: "180x180",
            type: "image/png",
          },
        ],
      },
      client: {
        installPrompt: true,
      },
    },
  },
});
