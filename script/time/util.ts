import path from "path";
import fs from "fs";
import ArrUtil from "../../src/utils/ArrUtil";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import Backtracking from "../../src/Sudoku/Backtracking";
import type { SolveStats, SudokuElementWithZero } from "../../src/Sudoku/type";

interface Result {
  timeSpent: number;
  solved: boolean;
  clue: string;
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
  record: bigint[];

  constructor() {
    this.record = [];
  }

  add(fn: () => unknown) {
    const start = process.hrtime.bigint();
    fn();
    const end = process.hrtime.bigint();
    const time = end - start;
    this.record.push(time);
  }
}

const Strategy = Object.freeze({
  HUMAN: "human",
  BACKTRACKING: "backtracking",
});

const Difficulty = Object.freeze({
  SIMPLE: "simple",
  EASY: "easy",
  INTERMEDIATE: "intermediate",
  EXPERT: "expert",
});

const sample = {
  [Difficulty.SIMPLE]: readSampleFromJson(Difficulty.SIMPLE),
  [Difficulty.EASY]: readSampleFromJson(Difficulty.EASY),
  [Difficulty.INTERMEDIATE]: readSampleFromJson(Difficulty.INTERMEDIATE),
  [Difficulty.EXPERT]: readSampleFromJson(Difficulty.EXPERT),
};

export default function generateResult(
  strategy: typeof Strategy[keyof typeof Strategy],
  difficulty: typeof Difficulty[keyof typeof Difficulty],
  size: number,
  folder: string
) {
  const result = countTimeForSolvingSample(sample[difficulty], strategy, size);
  const filePath = path.join(__dirname, "result", folder, `${strategy}-${difficulty}.json`);
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) fs.mkdirSync(dirname, { recursive: true });

  const data: Data = {
    strategy,
    difficulty,
    size,
    result,
  };

  fs.writeFileSync(filePath, JSON.stringify(data));
  console.log(`[${new Date().toLocaleString()}] Result for ${strategy} ${difficulty} is saved to ${filePath}`);
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
  if (strategy === Strategy.HUMAN) {
    return humanSolver(puzzles, size);
  } else {
    return backtrackingSolver(puzzles, size);
  }
}

function humanSolver(puzzles: [string, string][], size: number): Result[] {
  const timeCounter = new TimeCounter();
  const solvedArr: boolean[] = [];
  const clueArr: string[] = [];
  const numberOfCluesArr: number[] = [];
  const statsArr: SolveStats[] = [];

  for (let i = 0; i < Math.min(size, puzzles.length); i++) {
    const [clueStr, solutionStr] = puzzles[i];
    const clue = puzzleStrToStringArr(clueStr);
    const solution = puzzleStrToStringArr(solutionStr);

    try {
      numberOfCluesArr.push(clue.reduce((acc, row) => acc + row.filter((cell) => cell !== "0").length, 0));
      const s = new SudokuSolver(clue);
      timeCounter.add(() => s.trySolve());
      const strGrid = s.grid.map((row) => row.map((cell) => cell.clue ?? cell.inputValue ?? "0"));
      const solve = sameSolution(strGrid, solution);
      solvedArr.push(solve);
      clueArr.push(clueStr);
      statsArr.push(s.stats);
    } catch (e) {
      console.log(`Error at ${i}`);
      console.log("puzzles[i]: ", puzzles[i]);
      throw e;
    }
  }

  return timeCounter.record.map((timeSpent, i) => ({
    timeSpent: Number(timeSpent) / 1000000,
    solved: solvedArr[i],
    numberOfClues: numberOfCluesArr[i],
    clue: clueArr[i],
    stats: statsArr[i],
  }));
}

function backtrackingSolver(puzzles: [string, string][], size: number): Result[] {
  const timeCounter = new TimeCounter();
  const solvedArr: boolean[] = [];
  const numberOfCluesArr: number[] = [];
  const clueArr: string[] = [];
  const takeBacksArr: number[] = [];

  for (let i = 0; i < Math.min(size, puzzles.length); i++) {
    const [clueStr, solutionStr] = puzzles[i];
    const clue = puzzleStrToStringArr(clueStr);
    const solution = puzzleStrToStringArr(solutionStr);

    try {
      numberOfCluesArr.push(clue.reduce((acc, row) => acc + row.filter((cell) => cell !== "0").length, 0));
      const backtracking = new Backtracking(clue);
      timeCounter.add(() => backtracking.solveSudoku());
      const strGrid = backtracking.grid.map((row) => row.map((cell) => cell.toString())) as SudokuElementWithZero[][];
      const solve = sameSolution(strGrid, solution);
      solvedArr.push(solve);
      clueArr.push(clueStr);
      takeBacksArr.push(backtracking.takeBacks);
    } catch (e) {
      console.log(`Error at ${i}`);
      console.log("puzzles[i]: ", puzzles[i]);
      throw e;
    }
  }

  return timeCounter.record.map((timeSpent, i) => ({
    timeSpent: Number(timeSpent) / 1000000,
    solved: solvedArr[i],
    clue: clueArr[i],
    numberOfClues: numberOfCluesArr[i],
    takeBacks: takeBacksArr[i],
  }));
}

function puzzleStrToStringArr(puzzleStr: string): SudokuElementWithZero[][] {
  const arrTemplate: SudokuElementWithZero[][] = ArrUtil.create2DArray(9, 9, () => "0");

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const strIndex = i * 9 + j;
      const char = puzzleStr[strIndex];
      switch (char) {
        case ".":
          break;
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          arrTemplate[i][j] = char;
          break;
        default:
          throw new Error(`Invalid char ${char} at ${strIndex} for ${puzzleStr}`);
      }
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
