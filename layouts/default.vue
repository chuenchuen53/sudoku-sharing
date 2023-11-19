<template>
  <div id="main-layout-container">
    <header id="main-layout-header" :class="y <= 0 && 'reach-top'">
      <div class="navbar">
        <details ref="detailsRef" class="dropdown">
          <summary class="btn btn-ghost sm:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </summary>
          <ul class="menu dropdown-content z-[1] p-4 shadow bg-base-100 w-[100vw] left-[-10px]">
            <li v-for="x in routes" :key="x.path" class="space-y-6">
              <NuxtLink :to="x.path" @click="closeDetails" class="text-xl">
                {{ x.name }}
              </NuxtLink>
            </li>
          </ul>
        </details>

        <ul class="space-x-2 hidden sm:flex">
          <li v-for="x in routes" :key="x.path">
            <NuxtLink
              class="btn btn-ghost btn-sm text-lg"
              :class="{ 'btn-active': x.path === '/' ? route.path === x.path : route.path.startsWith(x.path) }"
              :to="x.path"
            >
              {{ x.name }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </header>
    <main id="main-layout-main"><slot></slot></main>
    <footer class="footer p-10 bg-neutral text-neutral-content">
      <nav>
        <header class="footer-title">Services</header>
        <a class="link link-hover">Branding</a>
        <a class="link link-hover">Design</a>
        <a class="link link-hover">Marketing</a>
        <a class="link link-hover">Advertisement</a>
      </nav>
      <nav>
        <header class="footer-title">Company</header>
        <a class="link link-hover">About us</a>
        <a class="link link-hover">Contact</a>
        <a class="link link-hover">Jobs</a>
        <a class="link link-hover">Press kit</a>
      </nav>
      <nav>
        <header class="footer-title">Legal</header>
        <a class="link link-hover">Terms of use</a>
        <a class="link link-hover">Privacy policy</a>
        <a class="link link-hover">Cookie policy</a>
      </nav>
    </footer>
  </div>
</template>

<script lang="ts" setup>
const route = useRoute();
const { y } = useWindowScroll();
const detailsRef = ref<HTMLElement | null>(null);

const routes = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Play",
    path: "/play",
  },
  {
    name: "Solver",
    path: "/solver",
  },
  {
    name: "About",
    path: "/about",
  },
];

const closeDetails = () => {
  if (detailsRef.value) {
    detailsRef.value.removeAttribute("open");
  }
};
</script>

<style lang="scss" scoped>
#main-layout-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

#main-layout-header {
  position: fixed;
  z-index: 1000;
  top: 0;
  left: 0;
  right: 0;
  backdrop-filter: blur(8px);
  background-color: rgb(255 255 255 / 60%);
  border-bottom: 1px solid #dfe7ef;

  @media (prefers-color-scheme: dark) {
    background-color: rgb(0 0 0 / 30%);
    border-bottom: 1px solid rgb(255 255 255 / 10%);
  }

  &.reach-top {
    @apply bg-base-100;

    backdrop-filter: none;
    border-bottom: none;
  }
}

#main-layout-main {
  flex: 1 1 auto;
  margin-top: 64px;
  padding: 24px;
}

#main-layout-footer {
  flex: 0 0 auto;
}
</style>
