<template>
  <div>
    <ContentDoc v-slot="{ doc }">
      <article ref="containerRef" id="strategies-article" class="prose mx-auto max-w-[80ch]">
        <ContentRenderer :value="doc" />
      </article>
    </ContentDoc>

    <div class="fixed right-4 top-24 hidden h-full w-52 px-4 xl:block">
      <TableOfContents :activeTocId="activeTocId" :path="$route.path" />
    </div>
  </div>
</template>

<script lang="ts" setup>
const containerRef = ref<HTMLElement | null>(null);
const activeTocId = ref("");
const observer = ref<IntersectionObserver | null>(null);

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
</style>
