<template>
  <div id="main-layout-container">
    <header id="main-layout-header" :class="{ 'reach-top': y <= 0, 'mobile-menu-opened': isMobileMenuOpened }">
      <div class="navbar flex-col items-start sm:flex-row">
        <button @click="isMobileMenuOpened = !isMobileMenuOpened" class="btn btn-square btn-ghost sm:hidden">
          <IconMenu class="h-5 w-5 sm:hidden" />
        </button>

        <Transition>
          <nav v-if="showHorizontally || isMobileMenuOpened" class="pt-1 pb-3 px-3 fixed top-16 bg-base-100 left-0 right-0 sm:static">
            <ul class="space-y-2 sm:space-y-0 sm:space-x-2 flex flex-col sm:flex-row">
              <li v-for="x in routes" :key="x.path">
                <NuxtLink
                  class="btn btn-ghost btn-sm"
                  :class="{ 'text-primary': x.path === '/' ? route.path === x.path : route.path.startsWith(x.path) }"
                  :to="x.path"
                  @click="isMobileMenuOpened && (isMobileMenuOpened = false)"
                >
                  {{ x.name }}
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </Transition>
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
import IconMenu from "~/components/Icons/IconMenu.vue";

const route = useRoute();
const { y } = useWindowScroll();

const showHorizontally = useMediaQuery("(min-width: 640px)");
const isMobileMenuOpened = ref(false);

const routes = [
  {
    name: "Play",
    path: "/play",
  },
  {
    name: "Solver",
    path: "/solver",
  },
  {
    name: "Strategies",
    path: "/strategies",
  },
];
</script>

<style lang="scss" scoped>
#main-layout-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  min-height: 100dvh;
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

  &.reach-top,
  &.mobile-menu-opened {
    @apply bg-base-100;

    backdrop-filter: none;
    border-bottom: none;
  }
}

#main-layout-main {
  flex: 1 0 auto;
  margin-top: 64px;
  padding: 24px;
}

#main-layout-footer {
  flex: 0 0 auto;
}

.v-enter-active {
  animation: menu-animation 0.2s ease-in-out;
}

.v-leave-active {
  animation: menu-animation 0.2s ease-in-out reverse;
}

@keyframes menu-animation {
  0% {
    clip-path: inset(0 0 150px 0);
  }

  100% {
    clip-path: inset(0 0 0 0);
  }
}
</style>
