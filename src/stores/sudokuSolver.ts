import { ref, reactive } from "vue";
import { defineStore } from "pinia";
import { type InputClues, type SudokuElementWithZero, type Cell, type InputValueData, VirtualLineType } from "@/Sudoku/type";
import SudokuSolver from "@/Sudoku/SudokuSolver";
import Sudoku from "@/Sudoku/Sudoku";

export interface Highlight {
  element: SudokuElementWithZero;
  cell: Cell[];
  candidate: InputValueData[];
  invalid: Cell[];
}

const dummyClues: InputClues = [
  ["2", "0", "0", "0", "0", "0", "8", "6", "0"],
  ["0", "0", "0", "0", "4", "2", "0", "0", "0"],
  ["0", "1", "0", "0", "6", "0", "0", "4", "7"],
  ["3", "4", "5", "0", "2", "0", "0", "0", "1"],
  ["7", "2", "0", "0", "0", "0", "4", "0", "9"],
  ["8", "0", "0", "0", "0", "0", "5", "0", "6"],
  ["0", "0", "2", "0", "3", "0", "0", "0", "0"],
  ["0", "0", "0", "6", "8", "0", "0", "1", "2"],
  ["5", "0", "8", "0", "0", "0", "0", "0", "4"],
];

export const useSudokuSolverStore = defineStore("sudokuSolver", () => {
  const sudokuSolver = ref<SudokuSolver>(new SudokuSolver(new Sudoku(dummyClues)));

  const highlight = reactive<Highlight>({
    element: "0",
    cell: [],
    candidate: [],
    invalid: [],
  });

  const removalOfCandidates = ref<InputValueData[]>([]);

  const newSudoku = (clues: InputClues) => {
    sudokuSolver.value = new SudokuSolver(new Sudoku(clues));
    highlight.element = "0";
    highlight.cell = [];
    highlight.candidate = [];
    highlight.invalid = [];
    removalOfCandidates.value = [];
  };

  const clearAllCandidates = () => {
    sudokuSolver.value.sudoku.clearAllCandidates();
  };

  const setInputValue = (data: InputValueData) => {
    if (sudokuSolver.value.sudoku.grid[data.rowIndex][data.columnIndex].clue) return;
    sudokuSolver.value.sudoku.setInputValue(data, true);
    updateInvalidHighlight();
  };

  const removeInputValue = (data: Cell) => {
    if (sudokuSolver.value.sudoku.grid[data.rowIndex][data.columnIndex].clue) return;
    sudokuSolver.value.sudoku.removeInputValue(data, true);
    updateInvalidHighlight();
  };

  const getBasicCandidates = () => sudokuSolver.value.setBasicCandidates();

  const getUniqueMissing = () => {
    const result = sudokuSolver.value.uniqueMissing.canFill(sudokuSolver.value.sudoku as Sudoku);
    const cells = result.map((x) => sudokuSolver.value.sudoku.grid[x.rowIndex][x.columnIndex]);
    highlight.cell = cells;
  };

  const getNakedSingles = () => {
    highlight.candidate = sudokuSolver.value.hiddenSingle.canFill(sudokuSolver.value.sudoku as Sudoku);
  };

  const getHiddenSingles = () => {
    highlight.candidate = sudokuSolver.value.hiddenSingle.canFill(sudokuSolver.value.sudoku as Sudoku);
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
      const allCells = sudokuSolver.value.sudoku.getAllRows().flat(1);
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
      ...sudokuSolver.value.sudoku.validateDetail[VirtualLineType.ROW],
      ...sudokuSolver.value.sudoku.validateDetail[VirtualLineType.COLUMN],
      ...sudokuSolver.value.sudoku.validateDetail[VirtualLineType.BOX],
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
    newSudoku,
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
