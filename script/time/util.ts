import path from "path";
import fs from "fs";
import ArrUtil from "../../src/utils/ArrUtil";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import Backtracking from "../../src/Sudoku/Backtracking";
import type { SolveStats, SudokuElement, SudokuElementWithZero } from "../../src/Sudoku/type";

interface Result {
  timeSpent: number;
  solved: boolean;
  numberOfClues: number;
  stats?: SolveStats;
  takeBacks?: number;
}

interface Data {
  strategy: string;
  difficulty: string;
  size: number;
  result: Result[];
}

class TimeCounter {
  totalTime: bigint;
  record: bigint[] = [];

  constructor() {
    this.totalTime = BigInt(0);
  }

  add(fn: () => unknown) {
    const start = process.hrtime.bigint();
    fn();
    const end = process.hrtime.bigint();
    const time = end - start;
    this.totalTime += time;
    this.record.push(time);
  }
}

const Strategy = {
  HUMAN: "human",
  BACKTRACKING: "backtracking",
};

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

const sample = {
  [Difficulty.SIMPLE]: simple,
  [Difficulty.EASY]: easy,
  [Difficulty.INTERMEDIATE]: intermediate,
  [Difficulty.EXPERT]: expert,
};

export default function generateResult(
  strategy: typeof Strategy[keyof typeof Strategy],
  difficulty: typeof Difficulty[keyof typeof Difficulty],
  size: number
) {
  const result = countTimeForSolvingSample(sample[difficulty], strategy, size);
  const filePath = path.join(__dirname, "result", `${strategy}-${difficulty}.json`);
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }

  const data: Data = {
    strategy,
    difficulty,
    size,
    result,
  };

  fs.writeFileSync(filePath, JSON.stringify(data));
}

function readSampleFromJson(difficulty: typeof Difficulty[keyof typeof Difficulty]): [string, string][] {
  const filePath = path.join(__dirname, "sample", `${difficulty}.json`);
  const content = fs.readFileSync(filePath, "utf-8");
  const obj = JSON.parse(content);
  const puzzles: [string, string][] = obj.puzzles;
  return puzzles;
}

function countTimeForSolvingSample(
  puzzles: [string, string][],
  strategy: typeof Strategy[keyof typeof Strategy],
  size: number
): Result[] {
  const timeCounter = new TimeCounter();
  const solved: boolean[] = [];
  const numberOfClues: number[] = [];

  if (strategy === Strategy.HUMAN) {
    const stats: SolveStats[] = [];
    humanSolver(puzzles, timeCounter, solved, numberOfClues, stats, size);
    return timeCounter.record.map((timeSpent, i) => ({
      timeSpent: Number(timeSpent) / 1000000,
      solved: solved[i],
      numberOfClues: numberOfClues[i],
      stats: stats[i],
    }));
  } else {
    const takeBacks = [];
    backtrackingSolver(puzzles, timeCounter, solved, numberOfClues, takeBacks, size);
    return timeCounter.record.map((timeSpent, i) => ({
      timeSpent: Number(timeSpent) / 1000000,
      solved: solved[i],
      numberOfClues: numberOfClues[i],
      takeBacks: takeBacks[i],
    }));
  }
}

function humanSolver(
  puzzles: [string, string][],
  timeCounter: TimeCounter,
  solved: boolean[],
  numberOfClues: number[],
  stats: SolveStats[],
  size: number
) {
  for (let i = 0; i < Math.min(size, puzzles.length); i++) {
    const [clueStr, solutionStr] = puzzles[i];
    const clue = puzzleStrToStringArr(clueStr);
    const solution = puzzleStrToStringArr(solutionStr);

    numberOfClues.push(clue.reduce((acc, row) => acc + row.filter((cell) => cell !== "0").length, 0));
    const s = new SudokuSolver(clue);
    timeCounter.add(() => s.trySolve());
    const strGrid = s.grid.map((row) => row.map((cell) => cell.clue ?? cell.inputValue ?? "0"));
    const solve = sameSolution(strGrid, solution);
    solved.push(solve);
    stats.push(s.stats);
  }
}

function backtrackingSolver(
  puzzles: [string, string][],
  timeCounter: TimeCounter,
  solved: boolean[],
  numberOfClues: number[],
  takeBacks: number[],
  size: number
) {
  for (let i = 0; i < Math.min(size, puzzles.length); i++) {
    const [clueStr, solutionStr] = puzzles[i];
    const clue = puzzleStrToStringArr(clueStr);
    const solution = puzzleStrToStringArr(solutionStr);

    numberOfClues.push(clue.reduce((acc, row) => acc + row.filter((cell) => cell !== "0").length, 0));
    const backtracking = new Backtracking(clue);
    timeCounter.add(() => backtracking.solveSudoku());
    const strGrid = backtracking.grid.map((row) => row.map((cell) => cell.toString())) as SudokuElementWithZero[][];

    const solve = sameSolution(strGrid, solution);
    solved.push(solve);

    takeBacks.push(backtracking.takeBacks);
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
