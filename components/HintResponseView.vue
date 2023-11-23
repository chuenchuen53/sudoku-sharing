<template>
  <div>
    <div class="chat chat-end">
      <div class="chat-bubble chat-bubble-primary">
        {{ prompt }}
      </div>
    </div>
    <Transition>
      <template v-if="foundItems !== null">
        <div v-if="foundItems.length > 0">
          <div class="chat chat-start">
            <div class="chat-bubble chat-bubble-accent">
              {{ firstFoundResponse }}
            </div>
          </div>
          <div v-for="(x, index) in foundItems" :key="index" class="chat chat-start">
            <div class="chat-bubble chat-bubble-accent">
              <button @click="onFoundItemClick(index)" class="btn-link text-left text-accent-content">
                {{ x }}
              </button>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="chat chat-start delay-appear">
            <div class="chat-bubble chat-bubble-accent whitespace-pre-wrap">
              {{ notFoundResponse }}
            </div>
          </div>
        </div>
      </template>
    </Transition>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  prompt: string;
  firstFoundResponse: string;
  notFoundResponse: string;
  foundItems: string[] | null;
  onFoundItemClick: (index: number) => void;
}>();
</script>

<style scoped>
.v-enter-active {
  animation: chat-bubble-animation 1s ease-in;
}

@keyframes chat-bubble-animation {
  0% {
    opacity: 0;
  }

  25% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
