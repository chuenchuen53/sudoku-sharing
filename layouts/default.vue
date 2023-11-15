<template>
  <div id="main-layout-container">
    <header id="main-layout-header">
      <div class="navbar bg-base-100 space-x-4">
        <NuxtLink v-for="x in routes" :key="x.path" class="btn btn-ghost text-xl" :class="{ 'btn-active': route.path === x.path }" :to="x.path">
          {{ x.name }}
        </NuxtLink>
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
</script>

<style scoped>
#main-layout-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

#main-layout-header {
  flex: 0 0 auto;
}

#main-layout-main {
  flex: 1 1 auto;
  padding: 24px;
}

#main-layout-footer {
  flex: 0 0 auto;
}
</style>
