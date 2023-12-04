import { defineStore } from "pinia";
import Sudoku from "../core/Sudoku/Sudoku";
import { Undo, undoAction } from "../utils/Undo";
import type { Position, Grid, SudokuElement } from "../core/Sudoku/type";

export const useSolverStore = defineStore("solver", () => {
  const loading = ref(false);
  const selectedPosition = shallowRef<Position>({ rowIndex: 0, columnIndex: 0 });
  const inputGrid = ref<Grid>(Sudoku.createEmptyGrid());
  const invalidPositions = shallowRef<Position[]>([]);
  const haveUndo = ref(false);
  const sudoku = Sudoku.sudokuFromGrid(Sudoku.createEmptyGrid());
  const undo = new Undo(sudoku);

  const _updateHaveUndo = () => {
    haveUndo.value = undo.haveUndo;
  };

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const setSelectedPosition = (position: Position) => {
    selectedPosition.value = position;
  };

  const fillSelected = (value: SudokuElement) => {
    const { rowIndex, columnIndex } = selectedPosition.value;
    undo.fill(rowIndex, columnIndex);
    _updateHaveUndo();
    inputGrid.value[rowIndex][columnIndex].inputValue = value;
    sudoku.setInputValue({ rowIndex, columnIndex, value }, true);
    invalidPositions.value = [...sudoku.getInvalidCells()];
  };

  const clearSelected = () => {
    const { rowIndex, columnIndex } = selectedPosition.value;
    if (inputGrid.value[rowIndex][columnIndex].inputValue) {
      undo.clear(rowIndex, columnIndex);
      _updateHaveUndo();
      delete inputGrid.value[rowIndex][columnIndex].inputValue;
      sudoku.removeInputValue({ rowIndex, columnIndex }, true);
      invalidPositions.value = [...sudoku.getInvalidCells()];
    }
  };

  const clearGrid = () => {
    if (inputGrid.value.every((row) => row.every((cell) => !cell.inputValue))) return;
    undo.replaceAllInputValues();
    _updateHaveUndo();
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (inputGrid.value[i][j].inputValue) {
          delete inputGrid.value[i][j].inputValue;
          sudoku.removeInputValue({ rowIndex: i, columnIndex: j }, false);
        }
      }
    }
    sudoku.validatePuzzle();
    invalidPositions.value = [];
  };

  const replaceGrid = (grid: Grid) => {
    undo.replaceAllInputValues();
    _updateHaveUndo();
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (inputGrid.value[i][j].inputValue) {
          delete inputGrid.value[i][j].inputValue;
          sudoku.removeInputValue({ rowIndex: i, columnIndex: j }, false);
        }
        if (grid[i][j].inputValue) {
          inputGrid.value[i][j].inputValue = grid[i][j].inputValue;
          sudoku.setInputValue({ rowIndex: i, columnIndex: j, value: grid[i][j].inputValue! }, false);
        }
      }
    }
    sudoku.validatePuzzle();
    invalidPositions.value = [...sudoku.getInvalidCells()];
  };

  const undoActionFn = () => {
    const lastUndo = undo.lastUndo;
    _updateHaveUndo();
    if (!lastUndo) return;
    undoAction(inputGrid, sudoku, lastUndo);
    invalidPositions.value = [...sudoku.getInvalidCells()];
  };

  return {
    loading,
    selectedPosition,
    inputGrid,
    invalidPositions,
    haveUndo,
    setLoading,
    setSelectedPosition,
    fillSelected,
    clearSelected,
    clearGrid,
    replaceGrid,
    undoActionFn,
  };
});
