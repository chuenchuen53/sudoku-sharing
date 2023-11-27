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
  <div>
    <div>Table of Contents</div>
    <nav class="mt-2 flex w-80">
      <ul class="menu menu-sm">
        <li v-for="{ id, text, children } in tocLinks" :key="id" class="">
          <span @click="onClick(id)" :class="id === activeTocId && 'font-bold text-primary'">
            {{ text }}
          </span>
          <ul v-if="children" class="">
            <li
              v-for="{ id: childId, text: childText } in children"
              :key="childId"
              class=""
              :class="childId === activeTocId && 'font-bold text-primary'"
              @click="onClick(childId)"
            >
              <span>
                {{ childText }}
              </span>
            </li>
          </ul>
        </li>
      </ul>
    </nav>
  </div>
</template>
