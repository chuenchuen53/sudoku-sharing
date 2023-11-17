<template>
  <div class="space-y-8">
    <SudokuView
      :grid="inputGrid"
      :can-fill-data-arr="[]"
      :elimination-data-arr="[]"
      :invalid-positions="invalidPositions"
      :selected="selectedPosition"
      :on-cell-click="handleCellClick"
    />
    <SudokuInputButtons :on-element-btn-click="fillInGrid" :on-clear-btn-click="clearInGrid" />
    <SudokuGridTextInput :on-input="onTextInput" />
    <button @click="handleSolve" class="btn btn-primary w-full">Solve</button>
  </div>
</template>

<script lang="ts" setup>
import SudokuSolver from "../../core/Sudoku/SudokuSolver";
import Sudoku from "../../core/Sudoku/Sudoku";
import SudokuView from "../../components/SudokuView.vue";
import SudokuInputButtons from "../../components/SudokuInputButtons.vue";
import SudokuGridTextInput from "../../components/SudokuGridTextInput.vue";
import { useSolverState } from "../../composables/useSolverState";
import { useSolverSolutionState } from "../../composables/solverSolutionState";
import type { Grid, Position, SudokuElement } from "../../core/Sudoku/type";

const selectedPosition = ref<Position>({ rowIndex: 0, columnIndex: 0 });
const inputGrid = ref<Grid>(Sudoku.createEmptyGrid());
const invalidPositions = ref<Position[]>([]);

const router = useRouter();
const solutionPageState = useSolverSolutionState();

const handleCellClick = (position: Position) => {
  selectedPosition.value = position;
};

const fillInGrid = (e: SudokuElement) => {
  const { rowIndex, columnIndex } = selectedPosition.value;
  inputGrid.value[rowIndex][columnIndex].inputValue = e;
  invalidPositions.value = Sudoku.invalidCells(inputGrid.value);
};

const clearInGrid = () => {
  const { rowIndex, columnIndex } = selectedPosition.value;
  delete inputGrid.value[rowIndex][columnIndex].inputValue;
  invalidPositions.value = Sudoku.invalidCells(inputGrid.value);
};

const onTextInput = (grid: Grid) => {
  inputGrid.value = grid;
  invalidPositions.value = Sudoku.invalidCells(inputGrid.value);
};

const handleSolve = () => {
  const isValidate = Sudoku.invalidCells(inputGrid.value).length === 0;
  if (!isValidate) {
    alert("Invalid puzzle");
    return;
  }
  const sudoku = Sudoku.sudokuFromGrid(inputGrid.value);
  const sudokuSolver = new SudokuSolver(sudoku);
  sudokuSolver.trySolve();
  solutionPageState.value = {
    puzzle: sudokuSolver.sudoku.grid,
    steps: sudokuSolver.getSteps(),
  };
  router.push("solver/solution");
};
</script>
