<template>
  <div>
    <ContentDoc path="/_strategies">
      <template v-slot="{ doc }">
        <article ref="containerRef" id="strategies-article" class="prose mx-auto max-w-[80ch]">
          <ContentRenderer :value="doc"></ContentRenderer>
        </article>
      </template>
      <template #not-found>
        <div>Connect to the internet to view this page.</div>
      </template>
    </ContentDoc>

    <button @click="openMobileToc = !openMobileToc" class="btn btn-square btn-ghost fixed right-2 top-2 z-[1001] xl:hidden">
      <IconTableOfContents class="h-6 w-6" />
    </button>

    <div
      id="strategies-toc"
      class="fixed right-0 top-16 hidden h-[460px] w-60 bg-base-100 bg-opacity-50 px-6 pt-4 backdrop-blur-sm xl:block xl:bg-transparent"
      :class="openMobileToc && '!block'"
    >
      <TableOfContents :activeTocId="activeTocId" path="/_strategies" :closeMobileToc="() => (openMobileToc = false)" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import IconTableOfContents from "~/components/Icons/IconTableOfContents.vue";

const containerRef = ref<HTMLElement | null>(null);
const activeTocId = ref("");
const observer = ref<IntersectionObserver | null>(null);
const openMobileToc = ref(false);

onMounted(() => {
  observer.value = new IntersectionObserver(
    (entries) => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id") ?? "";
          activeTocId.value = id;
          break;
        }
      }
    },
    { threshold: 1, rootMargin: "-60px" },
  );

  containerRef.value?.querySelectorAll("h2[id], h3[id]").forEach((section) => {
    observer.value?.observe(section);
  });
});

onUnmounted(() => {
  observer.value?.disconnect();
});
</script>

<style lang="scss">
#strategies-article {
  @media screen and (width >= 514px) {
    img {
      margin-left: auto;
      margin-right: auto;
      width: 466px;
    }
  }

  img[alt$="light"] {
    display: block;

    @media (prefers-color-scheme: dark) {
      display: none;
    }
  }

  img[alt$="dark"] {
    display: none;

    @media (prefers-color-scheme: dark) {
      display: block;
    }
  }
}

#strategies-toc {
  animation: toc-animation 0.2s ease-in-out;
}

@keyframes toc-animation {
  0% {
    clip-path: inset(0 0 475px 0);
  }

  100% {
    clip-path: inset(0 0 0 0);
  }
}
</style>
