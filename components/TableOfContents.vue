<script setup lang="ts">
const props = defineProps<{ activeTocId: string; path: string }>();

const { data } = await useAsyncData(`blogToc`, () => queryContent(props.path).findOne());
const tocLinks = computed(() => data.value?.body?.toc?.links ?? []);

const onClick = (id: string) => {
  const el = document.getElementById(id);
  if (el) {
    const headerOffset = 85;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};
</script>

<template>
  <div class="max-h-82 overflow-auto">
    <div>Table of Contents</div>
    <nav class="flex mt-2">
      <ul class="pl-2 space-y-2">
        <li v-for="{ id, text, children } in tocLinks" :key="id" class="cursor-pointer text-sm">
          <span @click="onClick(id)" :class="id === activeTocId && 'text-primary font-bold'">
            {{ text }}
          </span>
          <ul v-if="children" class="ml-4 mt-2 mb-3 space-y-2">
            <li
              v-for="{ id: childId, text: childText } in children"
              :key="childId"
              class="cursor-pointer text-xs"
              :class="childId === activeTocId && 'text-primary font-bold'"
              @click="onClick(childId)"
            >
              {{ childText }}
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</template>
