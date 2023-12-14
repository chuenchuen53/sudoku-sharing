<template>
  <div id="main-layout-container">
    <header id="main-layout-header" :class="{ 'reach-top': y <= 0, 'mobile-menu-opened': isMobileMenuOpened }">
      <div class="navbar flex-col items-start sm:flex-row sm:items-center">
        <button @click="toggleMenuOpen" class="btn btn-square btn-ghost sm:hidden" aria-label="nav-toggle">
          <IconMenu class="h-5 w-5 sm:hidden" />
        </button>
        <nav
          :class="{ hidden: !isMobileMenuOpened, 'menu-opening': menuOpening, 'menu-closing': menuClosing }"
          class="fixed left-0 right-0 top-16 bg-base-100 px-3 pb-3 pt-1 sm:static sm:!block sm:bg-transparent sm:py-0"
        >
          <ul class="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <li v-for="x in routes" :key="x.path">
              <NuxtLink
                active-class="text-primary"
                class="btn btn-ghost btn-sm"
                :class="x.path === '/solver' && $route.path === '/solver/solution' && 'text-primary'"
                :to="x.path"
                @click="isMobileMenuOpened && (isMobileMenuOpened = false)"
              >
                {{ x.name }}
              </NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
    <main id="main-layout-main"><slot></slot></main>
  </div>
</template>

<script lang="ts" setup>
import IconMenu from "~/components/Icons/IconMenu.vue";

const { y } = useWindowScroll();

const menuOpening = ref(false);
const menuClosing = ref(false);
const isMobileMenuOpened = ref(false);

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
    name: "Strategies",
    path: "/strategies",
  },
];

const toggleMenuOpen = () => {
  if (menuOpening.value || menuClosing.value) return;
  if (isMobileMenuOpened.value) {
    menuClosing.value = true;
    setTimeout(() => {
      isMobileMenuOpened.value = false;
      menuClosing.value = false;
    }, 200);
  } else {
    menuOpening.value = true;
    isMobileMenuOpened.value = true;
    setTimeout(() => {
      menuOpening.value = false;
    }, 200);
  }
};
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

.menu-opening {
  animation: menu-animation 0.2s ease-in-out;
}

.menu-closing {
  animation: menu-animation 0.2s ease-in-out reverse;
}

@keyframes menu-animation {
  0% {
    clip-path: inset(0 0 170px 0);
  }

  100% {
    clip-path: inset(0 0 0 0);
  }
}
</style>
