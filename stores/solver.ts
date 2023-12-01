import { defineStore } from "pinia";
import Sudoku from "../core/Sudoku/Sudoku";
import type { Position, Grid, SudokuElement } from "../core/Sudoku/type";

export const useSolverStore = defineStore("solver", () => {
  const loading = ref(false);
  const selectedPosition = shallowRef<Position>({ rowIndex: 0, columnIndex: 0 });
  const inputGrid = ref<Grid>(Sudoku.createEmptyGrid());
  const invalidPositions = shallowRef<Position[]>([]);
  let sudoku = Sudoku.sudokuFromGrid(Sudoku.createEmptyGrid());

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const setSelectedPosition = (position: Position) => {
    selectedPosition.value = position;
  };

  const fillSelected = (value: SudokuElement) => {
    const { rowIndex, columnIndex } = selectedPosition.value;
    inputGrid.value[rowIndex][columnIndex].inputValue = value;
    sudoku.setInputValue({ rowIndex, columnIndex, value }, true);
    invalidPositions.value = [...sudoku.invalidCells];
  };

  const clearSelected = () => {
    const { rowIndex, columnIndex } = selectedPosition.value;
    if (inputGrid.value[rowIndex][columnIndex].inputValue) delete inputGrid.value[rowIndex][columnIndex].inputValue;
    sudoku.removeInputValue({ rowIndex, columnIndex }, true);
    invalidPositions.value = [...sudoku.invalidCells];
  };

  const clearGrid = () => {
    const emptyGrid = Sudoku.createEmptyGrid();
    inputGrid.value = emptyGrid;
    sudoku = Sudoku.sudokuFromGrid(emptyGrid);
    invalidPositions.value = [];
  };

  const replaceGrid = (grid: Grid) => {
    inputGrid.value = grid;
    sudoku = Sudoku.sudokuFromGrid(grid);
    invalidPositions.value = [...sudoku.invalidCells];
  };

  return {
    loading,
    selectedPosition,
    inputGrid,
    invalidPositions,
    setLoading,
    setSelectedPosition,
    fillSelected,
    clearSelected,
    clearGrid,
    replaceGrid,
  };
});
