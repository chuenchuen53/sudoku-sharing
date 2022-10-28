import type { SudokuElement } from "./Sudoku";

// medium
export const testingPuzzle1: (SudokuElement | null)[][] = [
  ["2", null, null, null, null, null, "8", "6", null],
  [null, null, null, null, "4", "2", null, null, null],
  [null, "1", null, null, "6", null, null, "4", "7"],
  ["3", "4", "5", null, "2", null, null, null, "1"],
  ["7", "2", null, null, null, null, "4", null, "9"],
  ["8", null, null, null, null, null, "5", null, "6"],
  [null, null, "2", null, "3", null, null, null, null],
  [null, null, null, "6", "8", null, null, "1", "2"],
  ["5", null, "8", null, null, null, null, null, "4"],
];

// medium
export const testingPuzzle2: (SudokuElement | null)[][] = [
  [null, "3", null, "9", null, null, null, null, null],
  ["6", null, null, "2", null, null, "8", null, null],
  ["8", null, null, "6", "1", null, "5", "4", "9"],
  [null, null, null, null, "3", "2", "1", null, null],
  ["2", null, "8", null, "4", null, null, null, null],
  [null, null, "3", "1", "9", null, null, null, "4"],
  ["9", null, "2", null, null, null, null, null, "5"],
  ["1", null, null, null, null, null, null, "6", null],
  [null, null, "4", null, "6", null, "9", null, "8"],
];

// hard
export const testingPuzzle3: (SudokuElement | null)[][] = [
  [null, null, null, null, null, "1", "6", null, null],
  [null, null, "5", null, null, null, null, null, "3"],
  [null, null, null, null, null, null, "5", "9", "4"],
  [null, "8", null, null, "6", null, null, null, "1"],
  [null, "1", null, null, null, "4", "9", null, "2"],
  ["4", "9", null, "1", "8", null, null, null, null],
  [null, "2", null, "4", null, "6", "1", null, null],
  [null, null, null, null, "5", "3", "2", null, null],
  ["7", null, null, null, null, "8", null, "6", null],
];

// hard
export const testingPuzzle4: (SudokuElement | null)[][] = [
  [null, null, null, null, null, null, null, "6", null],
  [null, null, null, "3", "8", null, "1", "9", null],
  [null, null, "7", "5", null, null, "3", "4", "2"],
  ["8", "9", null, null, null, null, "4", null, null],
  [null, null, "6", null, null, null, "8", null, "1"],
  ["3", "4", null, null, null, null, null, null, null],
  [null, null, null, "4", "6", "7", null, null, null],
  [null, null, null, null, null, "5", null, "3", null],
  [null, "7", null, null, null, "1", null, null, null],
];

// hard
export const testingPuzzle5: (SudokuElement | null)[][] = [
  [null, null, "2", null, "1", null, null, null, null],
  ["1", null, null, null, "8", null, null, "5", "4"],
  [null, "6", null, null, "2", null, "9", "1", "3"],
  ["6", null, "5", null, null, null, "4", null, "9"],
  [null, null, null, null, null, "8", "1", null, null],
  ["2", null, null, "7", null, null, null, null, null],
  ["9", null, null, null, null, null, null, null, "5"],
  [null, null, null, null, "4", null, null, null, "6"],
  ["4", "7", "3", null, null, "6", null, null, "1"],
];

// expert
export const testingPuzzle6: (SudokuElement | null)[][] = [
  [null, "8", null, "5", null, null, null, null, null],
  [null, null, null, null, "3", null, "2", null, null],
  [null, null, "9", null, "2", null, "7", null, null],
  [null, null, "7", null, null, null, null, null, "6"],
  [null, "4", null, null, null, null, null, "5", null],
  ["1", null, null, "2", null, null, null, null, "7"],
  [null, null, "8", null, "6", null, null, null, "3"],
  [null, null, null, "3", null, "1", "6", null, "4"],
  [null, null, "1", null, null, "9", null, null, null],
];

// expert
export const testingPuzzle7: (SudokuElement | null)[][] = [
  ["6", null, null, "1", "7", null, null, null, "5"],
  [null, null, null, null, "4", null, null, "2", null],
  [null, null, null, null, null, null, "8", "9", null],
  [null, "3", "7", "8", null, null, null, null, "2"],
  ["5", null, null, null, null, "1", null, null, "9"],
  [null, null, "2", null, null, null, null, null, null],
  [null, null, "5", null, "2", "4", null, null, null],
  [null, null, null, null, "1", null, "6", null, null],
  ["7", null, null, "3", null, null, null, null, null],
];

// expert
export const testingPuzzle8: (SudokuElement | null)[][] = [
  [null, "7", null, null, null, null, "6", null, "8"],
  [null, "5", null, null, "4", null, null, null, null],
  ["3", null, null, null, null, "6", null, null, null],
  [null, null, "4", null, null, "5", null, "2", null],
  [null, null, null, null, null, null, null, "9", null],
  ["9", null, "2", null, null, null, "3", null, null],
  [null, null, null, "3", null, null, null, null, "1"],
  [null, null, null, "5", null, null, null, "7", "3"],
  [null, null, null, "2", "9", "4", null, null, null],
];

// expert
export const testingPuzzle9: (SudokuElement | null)[][] = [
  [null, "1", "6", null, null, null, null, null, "2"],
  [null, null, null, null, null, null, "6", null, null],
  [null, "5", null, null, "3", null, "1", null, null],
  [null, null, null, null, null, "3", "4", "2", null],
  [null, null, null, null, null, "2", null, "7", null],
  [null, null, null, "6", "5", "1", null, null, null],
  ["3", null, null, "5", null, null, null, null, null],
  [null, null, "2", null, "9", null, null, null, null],
  ["4", null, null, null, null, null, null, "8", "9"],
];
