import path from "path";
import fs from "fs";
import ArrUtil from "../../src/utils/ArrUtil";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import Backtracking from "../../src/Sudoku/Backtracking";
import type { SudokuElement, SudokuElementWithZero } from "../../src/Sudoku/type";

class TimeCounter {
  totalTime: number;
  record: number[] = [];

  constructor() {
    this.totalTime = 0;
  }

  add(fn: () => unknown) {
    const start = new Date();
    fn();
    const end = new Date();
    const time = end.getTime() - start.getTime();
    this.totalTime += time;
    this.record.push(time);
  }
}

const Difficulty = {
  SIMPLE: "simple",
  EASY: "easy",
  INTERMEDIATE: "intermediate",
  EXPERT: "expert",
} as const;

const simple = readSampleFromJson(Difficulty.SIMPLE);
const easy = readSampleFromJson(Difficulty.EASY);
const intermediate = readSampleFromJson(Difficulty.INTERMEDIATE);
const expert = readSampleFromJson(Difficulty.EXPERT);

const humanLikedSolverResult = [
  countTimeForSolvingAllSample(simple, humanLikedSolver),
  countTimeForSolvingAllSample(easy, humanLikedSolver),
  countTimeForSolvingAllSample(intermediate, humanLikedSolver),
  countTimeForSolvingAllSample(expert, humanLikedSolver),
];

console.log("Human like Solver Result:");
console.table(humanLikedSolverResult.map(({ allResult: _, ...rest }) => rest));

const backtrackingResult = [
  countTimeForSolvingAllSample(simple, backtrackingSolver),
  countTimeForSolvingAllSample(easy, backtrackingSolver),
  countTimeForSolvingAllSample(intermediate, backtrackingSolver),
  countTimeForSolvingAllSample(expert, backtrackingSolver),
];

console.log("Backtracking Result:");
console.table(backtrackingResult.map(({ allResult: _, ...rest }) => rest));

function readSampleFromJson(difficulty: typeof Difficulty[keyof typeof Difficulty]): [string, string][] {
  const filePath = path.join(__dirname, "sample", `${difficulty}.json`);
  const content = fs.readFileSync(filePath, "utf-8");
  const obj = JSON.parse(content);
  const puzzles: [string, string][] = obj.puzzles;
  return puzzles;
}

function countTimeForSolvingAllSample(
  puzzles: [string, string][],
  fn: (puzzles: [string, string][], timeCounter: TimeCounter, solved: boolean[]) => void
): {
  allResult: { timeSpent: number; solved: boolean }[];
  totalNumberOfPuzzles: number;
  averageTimeSpent: number;
  totalTimeSpent: number;
  numberOfSolved: number;
  averageTimeSpentForSolved: number;
  totalTimeSpentForSolved: number;
} {
  const timeCounter = new TimeCounter();
  const solved: boolean[] = [];
  const totalNumberOfPuzzles = puzzles.length;

  fn(puzzles, timeCounter, solved);

  const allResult = timeCounter.record.map((timeSpent, i) => ({ timeSpent, solved: solved[i] }));
  const averageTimeSpent = timeCounter.totalTime / timeCounter.record.length;
  const totalTimeSpent = timeCounter.totalTime;

  const resultWithSolved = allResult.filter((result) => result.solved);
  const numberOfSolved = resultWithSolved.length;
  const averageTimeSpentForSolved =
    resultWithSolved.reduce((acc, result) => acc + result.timeSpent, 0) / resultWithSolved.length;
  const totalTimeSpentForSolved = resultWithSolved.reduce((acc, result) => acc + result.timeSpent, 0);

  return {
    allResult,
    totalNumberOfPuzzles,
    averageTimeSpent,
    totalTimeSpent,
    numberOfSolved,
    averageTimeSpentForSolved,
    totalTimeSpentForSolved,
  };
}

function humanLikedSolver(puzzles: [string, string][], timeCounter: TimeCounter, solved: boolean[]) {
  for (let i = 0; i < puzzles.length; i++) {
    const [clueStr, solutionStr] = puzzles[i];
    const clue = puzzleStrToStringArr(clueStr);
    const solution = puzzleStrToStringArr(solutionStr);

    const s = new SudokuSolver(clue);
    timeCounter.add(() => s.trySolve());
    const strGrid = s.grid.map((row) => row.map((cell) => cell.clue ?? cell.inputValue ?? "0"));
    const solve = sameSolution(strGrid, solution);
    solved.push(solve);
  }
}

function backtrackingSolver(puzzles: [string, string][], timeCounter: TimeCounter, solved: boolean[]) {
  for (let i = 0; i < puzzles.length; i++) {
    const [clueStr, solutionStr] = puzzles[i];
    const clue = puzzleStrToStringArr(clueStr);
    const solution = puzzleStrToStringArr(solutionStr);

    const grid = toNumberGrid(clue);
    timeCounter.add(() => Backtracking.solveSudoku(grid));
    const strGrid = grid.map((row) => row.map((cell) => cell.toString())) as SudokuElementWithZero[][];

    const solve = sameSolution(strGrid, solution);
    solved.push(solve);
  }
}

function puzzleStrToStringArr(puzzleStr: string): SudokuElementWithZero[][] {
  const arrTemplate: SudokuElementWithZero[][] = ArrUtil.create2DArray(9, 9, "0");

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const strIndex = i * 9 + j;
      const char = puzzleStr[strIndex];
      if (char !== ".") arrTemplate[i][j] = char as SudokuElement;
    }
  }

  return arrTemplate;
}

function sameSolution(s1: SudokuElementWithZero[][], s2: SudokuElementWithZero[][]): boolean {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (s1[i][j] !== s2[i][j]) return false;
    }
  }

  return true;
}

function toNumberGrid(clue: string[][]): number[][] {
  return clue.map((row) => row.map((cell) => parseInt(cell)));
}
