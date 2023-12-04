import { defineStore } from "pinia";
import { getSudoku } from "sudoku-gen";
import Sudoku from "../core/Sudoku/Sudoku";
import SudokuSolver from "../core/Sudoku/SudokuSolver";
import type { Position, Grid, SudokuElement, SudokuElementWithZero } from "../core/Sudoku/type";
import type { Difficulty } from "sudoku-gen/dist/types/difficulty.type";
import type { FillInputValueData, FillStrategyType } from "~/core/Sudoku/FillStrategy/type";
import type { EliminationData, EliminationStrategyType } from "~/core/Sudoku/EliminationStrategy/type";
import ArrUtil from "~/core/utils/ArrUtil";

interface TempCandidate {
  position: Position;
  element: SudokuElement;
}

// use for ssr
const initialGrid: Grid = Sudoku.createEmptyGrid();

export const usePlayStore = defineStore("play", () => {
  const isFinishInitData = ref(false);
  const solved = ref(false);
  const showSolvedUi = ref(false);
  const selectedPosition = shallowRef<Position>({ rowIndex: 0, columnIndex: 0 });
  const inputGrid = ref<Grid>(initialGrid);
  const invalidPositions = shallowRef<Position[]>([]);
  const candidatesMode = ref(false);
  const currentFillStrategy = ref<FillStrategyType | null>(null);
  const fillInputValueData = shallowRef<{ data: FillInputValueData; description: string }[] | null>(null);
  const canFillData = shallowRef<FillInputValueData | null>(null);
  const tempCandidate = shallowRef<TempCandidate | null>(null);
  const currentEliminationStrategy = ref<EliminationStrategyType | null>(null);
  const eliminateData = shallowRef<{ data: EliminationData; description: string }[] | null>(null);
  const canEliminateData = shallowRef<EliminationData | null>(null);
  const haveUndo = ref(false);

  let sudoku: Sudoku = Sudoku.sudokuFromGrid(inputGrid.value);
  let sudokuSolver: SudokuSolver = new SudokuSolver(sudoku);
  let undo = new Undo(sudoku);

  const _updateHaveUndo = () => {
    haveUndo.value = undo.haveUndo;
  };

  const setSelectedPosition = (position: Position) => {
    selectedPosition.value = position;
  };

  const fillSelected = (value: SudokuElement) => {
    clearFillInputValueDataAndEliminateData();

    if (solved.value) return;
    const { rowIndex, columnIndex } = selectedPosition.value;
    if (inputGrid.value[rowIndex][columnIndex].clue) return;
    undo.fill(rowIndex, columnIndex);
    _updateHaveUndo();
    inputGrid.value[rowIndex][columnIndex].inputValue = value;
    sudoku.setInputValue({ rowIndex, columnIndex, value }, true);
    inputGrid.value[rowIndex][columnIndex].candidates = sudoku.grid[rowIndex][columnIndex].candidates;
    invalidPositions.value = sudoku.invalidCells;
    solved.value = sudoku.solved;
    if (solved.value) {
      showSolvedUi.value = true;
      setTimeout(() => {
        showSolvedUi.value = false;
      }, 5000);
    }
  };

  const clearSelected = () => {
    clearFillInputValueDataAndEliminateData();

    if (solved.value) return;
    const { rowIndex, columnIndex } = selectedPosition.value;

    if (inputGrid.value[rowIndex][columnIndex].inputValue) {
      undo.clear(rowIndex, columnIndex);
      _updateHaveUndo();
      delete inputGrid.value[rowIndex][columnIndex].inputValue;
      sudoku.removeInputValue({ rowIndex, columnIndex }, true);
      invalidPositions.value = sudoku.invalidCells;
    }
  };

  const replaceGrid = (grid: Grid) => {
    clearFillInputValueDataAndEliminateData();

    inputGrid.value = grid;
    sudoku = Sudoku.sudokuFromGrid(inputGrid.value);
    sudokuSolver = new SudokuSolver(sudoku);
    undo = new Undo(sudoku);
    _updateHaveUndo();
    invalidPositions.value = sudoku.invalidCells;
  };

  const addCandidateCell = (rowIndex: number, columnIndex: number, value: SudokuElement) => {
    const reactiveCell = inputGrid.value[rowIndex][columnIndex];
    if (reactiveCell.clue || reactiveCell.inputValue) return;
    undo.addCandidate(rowIndex, columnIndex, value);
    _updateHaveUndo();
    const added = sudoku.addElementInCandidates(rowIndex, columnIndex, value);
    if (added) reactiveCell.candidates = { ...sudoku.grid[rowIndex][columnIndex].candidates! };
    invalidPositions.value = sudoku.invalidCells;
  };

  const removeCandidateCell = (rowIndex: number, columnIndex: number, value: SudokuElement) => {
    const reactiveCell = inputGrid.value[rowIndex][columnIndex];
    if (reactiveCell.clue || reactiveCell.inputValue) return;
    undo.removeCandidate(rowIndex, columnIndex, value);
    _updateHaveUndo();
    const removed = sudoku.removeElementInCandidates(rowIndex, columnIndex, value);
    if (removed) reactiveCell.candidates = { ...sudoku.grid[rowIndex][columnIndex].candidates! };
    invalidPositions.value = sudoku.invalidCells;
  };

  const toggleCandidateInSelectedCell = (value: SudokuElement) => {
    clearFillInputValueDataAndEliminateData();

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

  const fillBasicCandidates = () => {
    clearFillInputValueDataAndEliminateData();

    undo.overwriteAllCandidates();
    _updateHaveUndo();
    sudokuSolver.setBasicCandidates();
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (sudoku.grid[i][j].candidates) {
          inputGrid.value[i][j].candidates = { ...sudoku.grid[i][j].candidates! };
        }
      }
    }
  };

  const computeFillInputValueData = (strategy: FillStrategyType) => {
    clearFillInputValueDataAndEliminateData();
    currentFillStrategy.value = strategy;

    // setTimeout for animation
    setTimeout(() => {
      fillInputValueData.value = sudokuSolver.computeCanFillAndDescription(strategy);
    }, 0);
  };

  const setCanFillData = (data: FillInputValueData | null) => {
    canFillData.value = data;
    canEliminateData.value = null;

    if (!data) return;
    const { rowIndex, columnIndex, value } = data;
    if (!inputGrid.value[rowIndex][columnIndex].candidates?.[value]) {
      tempCandidate.value = { position: { rowIndex, columnIndex }, element: value };
    }
  };

  const computeEliminateData = (strategy: EliminationStrategyType) => {
    clearFillInputValueDataAndEliminateData();
    currentEliminationStrategy.value = strategy;

    // setTimeout for animation
    setTimeout(() => {
      eliminateData.value = sudokuSolver.computeCanEliminateAndDescription(strategy);
    }, 0);
  };

  const setCanEliminateData = (data: EliminationData | null) => {
    canFillData.value = null;
    canEliminateData.value = data;
  };

  const clearFillInputValueDataAndEliminateData = () => {
    currentFillStrategy.value = null;
    fillInputValueData.value = null;
    canFillData.value = null;
    tempCandidate.value = null;
    currentEliminationStrategy.value = null;
    eliminateData.value = null;
    canEliminateData.value = null;
  };

  const initGridInFirstRender = () => {
    if (!isFinishInitData.value) {
      const gridStr = "800000000059100200103295080306910700000607300200358904605071029048502070700000500";
      // const gridStr = getSudoku("easy").puzzle.replaceAll("-", "0");
      const initialGrid: Grid = (ArrUtil.create2DArray(9, 9, (i, j) => gridStr[i * 9 + j]) as SudokuElementWithZero[][]).map((row, rowIndex) =>
        row.map((clue, columnIndex) => (clue !== "0" ? { rowIndex, columnIndex, clue } : { rowIndex, columnIndex })),
      );
      replaceGrid(initialGrid);
      isFinishInitData.value = true;
    }
  };

  const newGame = (difficulty: Difficulty) => {
    const gridStr = getSudoku(difficulty).puzzle.replaceAll("-", "0") as unknown as SudokuElementWithZero[];
    const initialGrid: Grid = ArrUtil.create2DArray(9, 9, (i, j) => gridStr[i * 9 + j]).map((row, rowIndex) =>
      row.map((clue, columnIndex) => (clue !== "0" ? { rowIndex, columnIndex, clue } : { rowIndex, columnIndex })),
    );
    replaceGrid(initialGrid);
  };

  const undoActionFn = () => {
    if (solved.value) return;

    const lastUndo = undo.lastUndo;
    _updateHaveUndo();
    if (!lastUndo) return;
    undoAction(inputGrid, sudoku, lastUndo);
    invalidPositions.value = [...sudoku.invalidCells];
  };

  return {
    solved,
    showSolvedUi,
    selectedPosition,
    inputGrid,
    invalidPositions,
    candidatesMode,
    fillInputValueData,
    canFillData,
    eliminateData,
    canEliminateData,
    currentFillStrategy,
    currentEliminationStrategy,
    haveUndo,
    tempCandidate,
    setSelectedPosition,
    fillSelected,
    clearSelected,
    replaceGrid,
    toggleCandidateInSelectedCell,
    toggleCandidatesMode,
    fillBasicCandidates,
    computeFillInputValueData,
    setCanFillData,
    computeEliminateData,
    setCanEliminateData,
    clearFillInputValueDataAndEliminateData,
    initGridInFirstRender,
    newGame,
    undoActionFn,
  };
});
