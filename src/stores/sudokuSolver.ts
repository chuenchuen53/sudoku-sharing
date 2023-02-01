import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import {
  type InputClues,
  type SudokuElementWithZero,
  type CellWithIndex,
  type InputValueData,
  VirtualLineType,
} from "@/Sudoku/type";
import SudokuSolver from "@/Sudoku/SudokuSolver";
import Sudoku from "@/Sudoku/Sudoku";

export interface Highlight {
  element: SudokuElementWithZero;
  cell: CellWithIndex[];
  candidate: InputValueData[];
  invalid: CellWithIndex[];
}

const dummyClues: InputClues = [
  ["0", "9", "0", "4", "6", "7", "5", "0", "8"],
  ["7", "0", "0", "0", "0", "0", "0", "0", "0"],
  ["0", "0", "8", "0", "0", "0", "4", "0", "9"],
  ["9", "6", "2", "1", "0", "0", "0", "4", "0"],
  ["8", "1", "0", "0", "0", "3", "0", "2", "0"],
  ["0", "3", "7", "6", "5", "0", "8", "0", "1"],
  ["5", "8", "0", "7", "0", "4", "9", "1", "3"],
  ["1", "0", "0", "3", "0", "0", "0", "0", "0"],
  ["0", "2", "4", "0", "0", "9", "6", "0", "0"],
];

export const useSudokuSolverStore = defineStore("sudokuSolver", () => {
  const sudokuSolver = ref<SudokuSolver>(new SudokuSolver(dummyClues));

  const highlight = reactive<Highlight>({
    element: "0",
    cell: [],
    candidate: [],
    invalid: [],
  });

  const removalOfCandidates = ref<InputValueData[]>([]);

  const clearAllCandidates = () => {
    sudokuSolver.value.clearAllCandidates();
  };

  const setInputValue = (data: InputValueData) => {
    if (sudokuSolver.value.grid[data.rowIndex][data.columnIndex].clue) return;
    sudokuSolver.value.setInputValue(data, true);
    updateInvalidHighlight();
  };

  const removeInputValue = (data: CellWithIndex) => {
    if (sudokuSolver.value.grid[data.rowIndex][data.columnIndex].clue) return;
    sudokuSolver.value.removeInputValue(data, true);
    updateInvalidHighlight();
  };

  const getBasicCandidates = () => sudokuSolver.value.setBasicCandidates();

  const getUniqueMissing = () => {
    const result = sudokuSolver.value.getUniqueMissing();
    const cells = result.map((x) => x.cell);
    highlight.cell = cells;
  };

  const getNakedSingles = () => {
    highlight.candidate = sudokuSolver.value.getNakedSingles();
  };

  const getHiddenSingles = () => {
    highlight.candidate = sudokuSolver.value.getHiddenSingles();
  };

  const getRemovalDueToLockedCandidates = () => {
    removalOfCandidates.value = sudokuSolver.value.getRemovalDueToLockedCandidates();
  };

  const getRemovalDueToNakedPairs = () => {
    removalOfCandidates.value = sudokuSolver.value.getRemovalDueToNakedPairs();
  };

  const getRemovalDueToNakedTriplets = () => {
    removalOfCandidates.value = sudokuSolver.value.getRemovalDueToNakedTriplets();
  };

  const getRemovalDueToNakedQuads = () => {
    removalOfCandidates.value = sudokuSolver.value.getRemovalDueToNakedQuads();
  };

  const getRemovalDueToHiddenPairs = () => {
    removalOfCandidates.value = sudokuSolver.value.getRemovalDueToHiddenPairs();
  };

  const getRemovalDueToHiddenTriplets = () => {
    removalOfCandidates.value = sudokuSolver.value.getRemovalDueToHiddenTriplets();
  };

  const getRemovalDueToHiddenQuads = () => {
    removalOfCandidates.value = sudokuSolver.value.getRemovalDueToHiddenQuads();
  };

  const getRemovalDueToXWing = () => (removalOfCandidates.value = sudokuSolver.value.getRemovalDueToXWing());

  const getRemovalDueToYWing = () => (removalOfCandidates.value = sudokuSolver.value.getRemovalDueToYWing());

  const removeCandidatesDueToLockedCandidates = () => sudokuSolver.value.removeCandidatesDueToLockedCandidates();

  const removeCandidatesDueToNakedPairs = () => sudokuSolver.value.removeCandidatesDueToNakedPairs();

  const removeCandidatesDueToNakedTriplets = () => sudokuSolver.value.removeCandidatesDueToNakedTriplets();

  const removeCandidatesDueToNakedQuads = () => sudokuSolver.value.removeCandidatesDueToNakedQuads();

  const removeCandidatesDueToHiddenPairs = () => sudokuSolver.value.removeCandidatesDueToHiddenPairs();

  const removeCandidatesDueToHiddenTriplets = () => sudokuSolver.value.removeCandidatesDueToHiddenTriplets();

  const removeCandidatesDueToHiddenQuads = () => sudokuSolver.value.removeCandidatesDueToHiddenQuads();

  const removeCandidatesDueToXWing = () => sudokuSolver.value.removeCandidatesDueToXWing();

  const removeCandidatesDueToYWing = () => sudokuSolver.value.removeCandidatesDueToYWing();

  const setElementHighlight = (value: SudokuElementWithZero) => {
    if (highlight.element === value) {
      highlight.element = "0";
    } else {
      highlight.element = value;
    }
  };

  const setCellCandidatesCountHighlight = (count: number) => {
    if (count === 0) {
      highlight.cell = [];
    } else {
      const allCells = sudokuSolver.value.getAllRows().flat(1);
      const cells = allCells.filter((x) => x.candidates && Sudoku.candidatesCount(x.candidates) < count);
      highlight.cell = cells;
    }
  };

  const removeAllHighlight = () => {
    highlight.element = "0";
    highlight.cell = [];
    highlight.candidate = [];
  };

  const updateInvalidHighlight = () => {
    const arr = [
      ...sudokuSolver.value.validateDetail[VirtualLineType.ROW],
      ...sudokuSolver.value.validateDetail[VirtualLineType.COLUMN],
      ...sudokuSolver.value.validateDetail[VirtualLineType.BOX],
    ];
    const result = arr
      .map((x) => x.duplicatedCells)
      .filter((x) => x.length)
      .flat(1);
    highlight.invalid = result;
  };

  const removeAllRemovalIndication = () => {
    removalOfCandidates.value = [];
  };

  return {
    sudokuSolver,
    highlight,
    removalOfCandidates,
    setInputValue,
    removeInputValue,
    clearAllCandidates,
    getBasicCandidates,
    getUniqueMissing,
    getNakedSingles,
    getHiddenSingles,
    getRemovalDueToLockedCandidates,
    getRemovalDueToNakedPairs,
    getRemovalDueToNakedTriplets,
    getRemovalDueToNakedQuads,
    getRemovalDueToHiddenPairs,
    getRemovalDueToHiddenTriplets,
    getRemovalDueToHiddenQuads,
    getRemovalDueToXWing,
    getRemovalDueToYWing,
    removeCandidatesDueToLockedCandidates,
    removeCandidatesDueToNakedPairs,
    removeCandidatesDueToNakedTriplets,
    removeCandidatesDueToNakedQuads,
    removeCandidatesDueToHiddenPairs,
    removeCandidatesDueToHiddenTriplets,
    removeCandidatesDueToHiddenQuads,
    removeCandidatesDueToXWing,
    removeCandidatesDueToYWing,
    setElementHighlight,
    setCellCandidatesCountHighlight,
    removeAllHighlight,
    removeAllRemovalIndication,
  };
});
