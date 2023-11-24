<template>
  <div for="hint-drawer-toggle" class="btn btn-sm fixed top-4 right-7 z-[1001]" @click="setIsOpen(true)">
    Hint
    <IconLightBulb class="text-xl text-warning" />
  </div>
  <Transition name="fade">
    <div
      v-if="isOpen && !isLargeScreen"
      @click="setIsOpen(false)"
      class="bg-blachttps://sudoku.com/k bg-opacity-40 fixed inset-0 z-[1001] overscroll-none overflow-hidden"
    ></div>
  </Transition>
  <Transition :name="isLargeScreen ? 'fade' : 'slide'">
    <div
      class="fixed top-0 bottom-0 right-0 z-[1002] overscroll-none flex flex-col bg-base-100 w-80 sm:w-96 lg:relative lg:artboard lg:artboard-demo lg:h-[600px]"
      v-if="isOpen"
    >
      <div class="pt-16 px-4 w-full overscroll-none flex-grow-0 flex-shrink-0 basis-16">
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
      </div>

      <div class="overflow-auto flex-grow basis-auto p-4 relative w-full">
        <button @click="handleFillBasicCandidates" class="btn btn-sm sm:w-[172px]">
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

        <Transition name="fade">
          <div
            class="bg-base-100 absolute overflow-y-auto pb-16 px-4 overscroll-none inset-0 lg:bg-base-300 w-full lg:rounded-2xl"
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
        </Transition>
      </div>
    </div>
  </Transition>
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

const isLargeScreen = useMediaQuery("(min-width: 1024px)");

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
const setIsOpen = (value: boolean) => {
  isOpen.value = value;
};

watch(isOpen, () => {
  if (isOpen.value) {
    if (!isLargeScreen.value) document.body.style.overflow = "hidden";
  } else {
    document.body.style.removeProperty("overflow");
  }
});

const handleFillBasicCandidates = () => {
  fillBasicCandidates();
  if (!isLargeScreen.value) isOpen.value = false;
};

const handleFillStrategyHintClick = (x: FillStrategyType) => {
  computeFillInputValueData(x);
};

const handleEliminateStrategyHintClick = (x: EliminationStrategyType) => {
  computeEliminateData(x);
};

const handleFillDataClick = (data: FillInputValueData) => {
  setCanFillData(data);
  if (!isLargeScreen.value) isOpen.value = false;
};

const handleEliminateDataClick = (data: EliminationData) => {
  setCanEliminateData(data);
  if (!isLargeScreen.value) isOpen.value = false;
};
</script>

<style lang="scss" scoped>
$animation-duration: 0.3s;

.fade-enter-active {
  animation: fade-in $animation-duration ease-in-out;
}

.fade-leave-active {
  animation: fade-in $animation-duration ease-in-out reverse;
}

.slide-enter-active {
  animation: slide-in $animation-duration ease-in-out;
}

.slide-leave-active {
  animation: slide-in $animation-duration ease-in-out reverse;
}

@keyframes fade-in {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes slide-in {
  0% {
    transform: translateX(100%);
  }

  100% {
    transform: translateX(0);
  }
}
</style>
