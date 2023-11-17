import { defineStore } from "pinia";
import Sudoku from "../core/Sudoku/Sudoku";
import type { Position, Grid, SudokuElement } from "../core/Sudoku/type";

export const useSolverStore = defineStore("solver", () => {
  const loading = ref(false);
  const selectedPosition = shallowRef<Position>({ rowIndex: 0, columnIndex: 0 });
  const inputGrid = ref<Grid>(Sudoku.createEmptyGrid());
  const invalidPositions = shallowRef<Position[]>([]);

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const setSelectedPosition = (position: Position) => {
    selectedPosition.value = position;
  };

  const fillSelected = (e: SudokuElement) => {
    const { rowIndex, columnIndex } = selectedPosition.value;
    inputGrid.value[rowIndex][columnIndex].inputValue = e;
    invalidPositions.value = Sudoku.invalidCells(inputGrid.value);
  };

  const clearSelected = () => {
    const { rowIndex, columnIndex } = selectedPosition.value;
    if (inputGrid.value[rowIndex][columnIndex].inputValue) delete inputGrid.value[rowIndex][columnIndex].inputValue;
    invalidPositions.value = Sudoku.invalidCells(inputGrid.value);
  };

  const replaceGrid = (grid: Grid) => {
    inputGrid.value = grid;
    invalidPositions.value = Sudoku.invalidCells(inputGrid.value);
  };

  return { loading, selectedPosition, inputGrid, invalidPositions, setLoading, setSelectedPosition, fillSelected, clearSelected, replaceGrid };
});
