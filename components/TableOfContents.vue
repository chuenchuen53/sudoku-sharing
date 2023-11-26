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
    <nav class="flex mt-2 w-80">
      <ul class="menu menu-sm">
        <li v-for="{ id, text, children } in tocLinks" :key="id" class="">
          <span @click="onClick(id)" :class="id === activeTocId && 'text-primary font-bold'">
            {{ text }}
          </span>
          <ul v-if="children" class="">
            <li
              v-for="{ id: childId, text: childText } in children"
              :key="childId"
              class=""
              :class="childId === activeTocId && 'text-primary font-bold'"
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
