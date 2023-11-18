import { defineStore } from "pinia";
import Sudoku from "../core/Sudoku/Sudoku";
import SudokuSolver from "../core/Sudoku/SudokuSolver";
import type { Position, Grid, SudokuElement } from "../core/Sudoku/type";

const tempGrid: Grid = (
  [
    ["0", "9", "0", "4", "6", "7", "5", "0", "8"],
    ["7", "0", "0", "0", "0", "0", "0", "0", "0"],
    ["0", "0", "8", "0", "0", "0", "4", "0", "9"],
    ["9", "6", "2", "1", "0", "0", "0", "4", "0"],
    ["8", "1", "0", "0", "0", "3", "0", "2", "0"],
    ["0", "3", "7", "6", "5", "0", "8", "0", "1"],
    ["5", "8", "0", "7", "0", "4", "9", "1", "3"],
    ["1", "0", "0", "3", "0", "0", "0", "0", "0"],
    ["0", "2", "4", "0", "0", "9", "6", "0", "0"],
  ] as const
).map((row, rowIndex) => row.map((clue, columnIndex) => (clue !== "0" ? { rowIndex, columnIndex, clue } : { rowIndex, columnIndex })));

export const usePlayStore = defineStore("play", () => {
  const loading = ref(false);
  const selectedPosition = shallowRef<Position>({ rowIndex: 0, columnIndex: 0 });
  const inputGrid = ref<Grid>(tempGrid);
  const invalidPositions = shallowRef<Position[]>([]);
  const candidatesMode = ref(false);

  let sudoku: Sudoku = Sudoku.sudokuFromGrid(inputGrid.value);
  let sudokuSolver: SudokuSolver = new SudokuSolver(sudoku);

  const setLoading = (value: boolean) => {
    loading.value = value;
  };

  const setSelectedPosition = (position: Position) => {
    selectedPosition.value = position;
  };

  const fillSelected = (value: SudokuElement) => {
    const { rowIndex, columnIndex } = selectedPosition.value;
    if (inputGrid.value[rowIndex][columnIndex].clue) return;
    inputGrid.value[rowIndex][columnIndex].inputValue = value;
    sudoku.setInputValue({ rowIndex, columnIndex, value }, true);
    inputGrid.value[rowIndex][columnIndex].candidates = sudoku.grid[rowIndex][columnIndex].candidates;
    invalidPositions.value = sudoku.invalidCells;
  };

  const clearSelected = () => {
    const { rowIndex, columnIndex } = selectedPosition.value;
    if (inputGrid.value[rowIndex][columnIndex].inputValue) delete inputGrid.value[rowIndex][columnIndex].inputValue;
    sudoku.removeInputValue({ rowIndex, columnIndex }, true);
    invalidPositions.value = sudoku.invalidCells;
  };

  const replaceGrid = (grid: Grid) => {
    inputGrid.value = grid;
    sudoku = Sudoku.sudokuFromGrid(inputGrid.value);
    sudokuSolver = new SudokuSolver(sudoku);
    invalidPositions.value = sudoku.invalidCells;
  };

  const addCandidateCell = (rowIndex: number, columnIndex: number, value: SudokuElement) => {
    const reactiveCell = inputGrid.value[rowIndex][columnIndex];
    if (reactiveCell.clue || reactiveCell.inputValue) return;
    const added = sudoku.addElementInCandidates(rowIndex, columnIndex, value);
    if (added) reactiveCell.candidates = { ...sudoku.grid[rowIndex][columnIndex].candidates! };
    invalidPositions.value = sudoku.invalidCells;
  };

  const removeCandidateCell = (rowIndex: number, columnIndex: number, value: SudokuElement) => {
    const reactiveCell = inputGrid.value[rowIndex][columnIndex];
    if (reactiveCell.clue || reactiveCell.inputValue) return;
    const removed = sudoku.removeElementInCandidates(rowIndex, columnIndex, value);
    if (removed) reactiveCell.candidates = { ...sudoku.grid[rowIndex][columnIndex].candidates! };
    invalidPositions.value = sudoku.invalidCells;
  };

  const toggleCandidateInSelectedCell = (value: SudokuElement) => {
    const reactiveCell = inputGrid.value[selectedPosition.value.rowIndex][selectedPosition.value.columnIndex];
    if (reactiveCell.clue || reactiveCell.inputValue) return;
    const rowIndex = selectedPosition.value.rowIndex;
    const columnIndex = selectedPosition.value.columnIndex;
    if (reactiveCell.candidates?.[value]) {
      removeCandidateCell(rowIndex, columnIndex, value);
    } else {
      addCandidateCell(rowIndex, columnIndex, value);
    }
  };

  const toggleCandidatesMode = () => {
    candidatesMode.value = !candidatesMode.value;
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
    replaceGrid,
    toggleCandidateInSelectedCell,
    toggleCandidatesMode,
  };
});
