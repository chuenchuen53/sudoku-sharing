<template>
  <div for="hint-drawer-toggle" class="btn btn-sm fixed right-7 top-4 z-[1001]" @click="setIsOpen(true)">
    Hint
    <IconLightBulb class="text-xl text-warning" />
  </div>
  <Transition name="fade">
    <div
      v-if="isOpen && !isLargeScreen"
      @click="setIsOpen(false)"
      class="fixed inset-0 z-[1001] overflow-hidden overscroll-none bg-black bg-opacity-40"
    ></div>
  </Transition>
  <Transition :name="isLargeScreen ? 'fade' : 'slide'">
    <div
      class="fixed bottom-0 right-0 top-0 z-[1002] flex w-[350px] flex-col overscroll-none bg-base-100 lg:artboard lg:artboard-demo sm:w-96 lg:relative lg:z-10 lg:h-[600px] lg:dark:bg-neutral"
      v-if="isOpen"
    >
      <div class="w-full flex-shrink-0 flex-grow-0 basis-16 overscroll-none px-4 pt-16">
        <div class="absolute left-6 right-6 top-6 flex flex-row-reverse justify-between">
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

      <div class="relative w-full flex-grow basis-auto overflow-auto p-4">
        <div class="flex gap-2">
          <div class="flex flex-grow basis-1/2 flex-col gap-2">
            <button @click="handleFillBasicCandidates" class="btn btn-sm mb-4 whitespace-nowrap">
              Help Fill Notes
              <IconPencil class="text-xl" />
            </button>
            <button
              v-for="(x, index) in SudokuSolver.fillStrategiesOrder"
              :key="index"
              @click="() => handleFillStrategyHintClick(x)"
              class="btn btn-sm btn-block whitespace-nowrap"
            >
              {{ FillStrategy.strategyName(x) }}
            </button>
          </div>
          <div class="flex flex-grow basis-1/2 flex-col gap-2">
            <button @click="solveBySolver" class="btn btn-sm mb-4 whitespace-nowrap">Solve</button>
            <button
              v-for="(x, index) in SudokuSolver.eliminationStrategiesOrder"
              :key="index"
              @click="() => handleEliminateStrategyHintClick(x)"
              class="btn btn-sm btn-block whitespace-nowrap"
            >
              {{ EliminationStrategy.strategyName(x) }}
            </button>
          </div>
        </div>

        <Transition name="fade">
          <div
            class="absolute inset-0 w-full overflow-y-auto overscroll-none bg-base-100 px-4 pb-16 lg:rounded-2xl lg:bg-base-300 lg:dark:bg-neutral"
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
import FillStrategy from "../core/Sudoku/FillStrategy/FillStrategy";
import EliminationStrategy from "../core/Sudoku/EliminationStrategy/EliminationStrategy";
import { usePlayStore } from "../stores/play";
import { useSolverSolutionStore } from "../stores/solverSolution";
import type { EliminationData, EliminationStrategyType } from "../core/Sudoku/EliminationStrategy/EliminationStrategy";
import type { FillInputValueData, FillStrategyType } from "../core/Sudoku/FillStrategy/FillStrategy";
import type { Grid } from "~/core/Sudoku/type";
import IconPencil from "~/components/Icons/IconPencil.vue";
import IconLightBulb from "~/components/Icons/IconLightBulb.vue";
import IconCross from "~/components/Icons/IconCross.vue";
import IconArrowLeft from "~/components/Icons/IconArrowLeft.vue";
import Sudoku from "~/core/Sudoku/Sudoku";
import SudokuSolver from "~/core/Sudoku/SudokuSolver";

const isLargeScreen = useMediaQuery("(min-width: 1024px)");

const playStore = usePlayStore();
const { inputGrid, fillInputValueData, eliminateData, currentFillStrategy, currentEliminationStrategy } = storeToRefs(playStore);
const {
  fillBasicCandidates,
  computeFillInputValueData,
  setCanFillData,
  computeEliminateData,
  setCanEliminateData,
  clearFillInputValueDataAndEliminateData,
} = playStore;

const solverSolutionStore = useSolverSolutionStore();

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

const solveBySolver = () => {
  const grid: Grid = inputGrid.value.map((row) =>
    row.map((x) => ({ rowIndex: x.rowIndex, columnIndex: x.columnIndex, clue: x.clue, value: x.inputValue })),
  );
  const sudoku = Sudoku.sudokuFromGrid(grid);
  const sudokuSolver = new SudokuSolver(sudoku);
  sudokuSolver.trySolve();
  solverSolutionStore.setData({
    puzzle: grid,
    steps: sudokuSolver.getSteps(),
    stats: sudokuSolver.getStats(),
  });
  navigateTo("/solver/solution");
};

onUnmounted(() => {
  document.body.style.removeProperty("overflow");
});
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
