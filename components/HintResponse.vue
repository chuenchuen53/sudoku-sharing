<template>
  <div>
    <div v-if="fillStrategy">
      <div class="chat chat-end">
        <div class="chat-bubble chat-bubble-primary">
          Any
          <span>{{ FillStrategy.strategyName(fillStrategy) }}</span>
          that can be found?
        </div>
      </div>
      <div v-if="fillInputValueData.length > 0" class="delay-appear">
        <div class="chat chat-start">
          <div class="chat-bubble chat-bubble-accent">
            The following {{ fillInputValueData.length > 1 ? "cell" : "cells" }} can be filled by
            <span>{{ FillStrategy.strategyName(fillStrategy) }}</span>
          </div>
        </div>
        <div v-for="(x, index) in fillInputValueData" :key="index">
          <div class="chat chat-start">
            <div class="chat-bubble cursor-pointer chat-bubble-accent">
              <button @click="() => onFillDataClick(x.data)" class="btn-link text-left text-accent-content">
                {{ x.description }}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="chat chat-start delay-appear">
        <div class="chat-bubble chat-bubble-accent">
          No cell can be filled with
          <span>{{ FillStrategy.strategyName(fillStrategy) }}</span>
        </div>
      </div>
    </div>

    <div v-if="eliminationStrategy">
      <div class="chat chat-end">
        <div class="chat-bubble chat-bubble-primary">
          Any
          <span>{{ EliminationStrategy.strategyName(eliminationStrategy) }}</span>
          that can be found?
        </div>
      </div>
      <div v-if="eliminationData.length > 0" class="delay-appear">
        <div class="chat chat-start">
          <div class="chat-bubble chat-bubble-accent">
            The following pattern are
            <span>{{ EliminationStrategy.strategyName(eliminationStrategy) }}</span>
          </div>
        </div>
        <div v-for="(x, index) in eliminationData" :key="index" class="chat chat-start">
          <div class="chat-bubble chat-bubble-accent">
            <button @click="() => onEliminationDataClick(x.data)" class="btn-link text-left text-accent-content">
              {{ x.description }}
            </button>
          </div>
        </div>
      </div>
      <div v-else class="chat chat-start delay-appear">
        <div class="chat-bubble chat-bubble-accent">
          No pattern can be found by
          <span>{{ EliminationStrategy.strategyName(eliminationStrategy) }}</span>
          <br />
          <div>
            <span>
              You can try
              <span>Help Fill Note</span>
              and then ask again
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { EliminationData, EliminationStrategyType } from "~/core/Sudoku/EliminationStrategy/EliminationStrategy";
import type { FillInputValueData, FillStrategyType } from "~/core/Sudoku/FillStrategy/FillStrategy";
import EliminationStrategy from "~/core/Sudoku/EliminationStrategy/EliminationStrategy";
import FillStrategy from "~/core/Sudoku/FillStrategy/FillStrategy";

defineProps<{
  fillStrategy: FillStrategyType | null;
  fillInputValueData: { description: string; data: FillInputValueData }[];
  eliminationStrategy: EliminationStrategyType | null;
  eliminationData: { description: string; data: EliminationData }[];
  onFillDataClick: (data: FillInputValueData) => void;
  onEliminationDataClick: (data: EliminationData) => void;
}>();
</script>

<style scoped>
.delay-appear {
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
