<template>
  <div class="drawer drawer-end">
    <input id="hint-drawer-toggle" type="checkbox" class="drawer-toggle" v-model="isOpen" />
    <div class="drawer-content">
      <label for="hint-drawer-toggle" class="drawer-button btn btn-sm fixed top-6 right-7 z-[1001]">
        Hint
        <IconLightBulb class="text-xl text-warning" />
      </label>
    </div>
    <div class="drawer-side z-[1001]">
      <label for="hint-drawer-toggle" aria-label="close sidebar" class="drawer-overlay"></label>
      <div class="bg-base-100 min-h-full pt-16 px-4 w-80 max-w-[95vw] overscroll-none">
        <div class="absolute top-6 left-6 right-6 flex justify-between flex-row-reverse">
          <button @click="() => (isOpen = false)" class="btn btn-circle btn-sm">
            <IconCross />
          </button>
          <button
            v-if="currentFillStrategy || currentEliminationStrategy"
            @click="clearFillInputValueDataAndEliminateData"
            class="btn btn-circle btn-sm"
          >
            <IconArrowLeft />
          </button>
        </div>

        <button @click="handleFillBasicCandidates" class="btn btn-sm">
          Help Fill Notes
          <IconPencil class="text-xl" />
        </button>

        <div class="divider"></div>

        <div class="flex gap-2">
          <div class="flex flex-col gap-2 flex-grow basis-1/2">
            <button
              v-for="(x, index) in SudokuSolver.enabledFillStrategies"
              :key="index"
              @click="() => handleFillStrategyHintClick(x)"
              class="btn btn-sm whitespace-nowrap btn-block"
            >
              {{ FillStrategy.strategyName(x) }}
            </button>
          </div>
          <div class="flex flex-col gap-2 flex-grow basis-1/2">
            <button
              v-for="(x, index) in SudokuSolver.enabledEliminationStrategies"
              :key="index"
              @click="() => handleEliminateStrategyHintClick(x)"
              class="btn btn-sm whitespace-nowrap btn-block"
            >
              {{ EliminationStrategy.strategyName(x) }}
            </button>
          </div>
        </div>

        <div
          class="chat-container bg-base-100 absolute overflow-y-auto pb-16 px-4 overscroll-none"
          v-if="currentFillStrategy || currentEliminationStrategy"
        >
          <HintResponse
            :fill-strategy="currentFillStrategy"
            :fill-input-value-data="fillInputValueData"
            :on-fill-data-click="handleFillDataClick"
            :elimination-strategy="currentEliminationStrategy"
            :elimination-data="eliminateData"
            :on-elimination-data-click="handleEliminateDataClick"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import SudokuSolver from "../core/Sudoku/SudokuSolver";
import FillStrategy from "../core/Sudoku/FillStrategy/FillStrategy";
import EliminationStrategy from "../core/Sudoku/EliminationStrategy/EliminationStrategy";
import { usePlayStore } from "../stores/play";
import type { EliminationData, EliminationStrategyType } from "../core/Sudoku/EliminationStrategy/EliminationStrategy";
import type { FillInputValueData, FillStrategyType } from "../core/Sudoku/FillStrategy/FillStrategy";
import IconPencil from "~/components/Icons/IconPencil.vue";
import IconLightBulb from "~/components/Icons/IconLightBulb.vue";
import IconCross from "~/components/Icons/IconCross.vue";
import IconArrowLeft from "~/components/Icons/IconArrowLeft.vue";

const playStore = usePlayStore();
const { fillInputValueData, eliminateData, currentFillStrategy, currentEliminationStrategy } = storeToRefs(playStore);
const {
  fillBasicCandidates,
  computeFillInputValueData,
  setCanFillData,
  computeEliminateData,
  setCanEliminateData,
  clearFillInputValueDataAndEliminateData,
} = playStore;

const isOpen = ref(false);

watch(isOpen, () => {
  if (isOpen.value) {
    document.body.classList.add("overflow-hidden");
  } else {
    document.body.classList.remove("overflow-hidden");
  }
});

const handleFillBasicCandidates = () => {
  fillBasicCandidates();
  isOpen.value = false;
};

const handleFillStrategyHintClick = (x: FillStrategyType) => {
  computeFillInputValueData(x);
};

const handleEliminateStrategyHintClick = (x: EliminationStrategyType) => {
  computeEliminateData(x);
};

const handleFillDataClick = (data: FillInputValueData) => {
  setCanFillData(data);
  isOpen.value = false;
};

const handleEliminateDataClick = (data: EliminationData) => {
  setCanEliminateData(data);
  isOpen.value = false;
};
</script>

<style lang="scss" scoped>
.chat-container {
  inset: 64px 0 0;
  animation: fade-in 0.3s ease-in-out;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}
</style>
