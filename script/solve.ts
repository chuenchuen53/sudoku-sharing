import fs from "fs";
import SudokuSolver from "../src/Sudoku/SudokuSolver";

interface PuzzleResult {
  clues: string;
  solved: boolean;
  stats: InstanceType<typeof SudokuSolver>["stats"];
}

interface AllPuzzleResult {
  [key: string]: PuzzleResult[];
}

interface OverallResult {
  total: number;
  solved: number;
  solvedPercent: number;
  stats: InstanceType<typeof SudokuSolver>["stats"];
}

interface AllOverallResult {
  [key: string]: OverallResult;
}

function getPuzzle(input: string) {
  const arr = input.split("");
  const newArr: unknown[] = [];
  while (arr.length) newArr.push(arr.splice(0, 9));
  return newArr;
}

const allPuzzleResult: AllPuzzleResult = {};
const allOverallResult: AllOverallResult = {};

const filename = "robatron";
const sample = JSON.parse(fs.readFileSync(`./sample/${filename}.json`).toString());

for (const key in sample) {
  allPuzzleResult[key] = [];
  allOverallResult[key] = {
    total: 0,
    solved: 0,
    solvedPercent: 0,
    stats: {
      uniqueMissing: 0,
      nakedSingle: 0,
      hiddenSingle: 0,
    },
  };

  const cluesArr = sample[key];
  for (const cluesStr of cluesArr) {
    const puzzle = getPuzzle(cluesStr) as any;
    const s = new SudokuSolver(puzzle);
    s.trySolve();
    allPuzzleResult[key].push({
      clues: cluesStr,
      solved: s.solved,
      stats: s.stats,
    });
  }

  for (const puzzleResult of allPuzzleResult[key]) {
    allOverallResult[key].total++;
    if (puzzleResult.solved) {
      allOverallResult[key].solved++;
      allOverallResult[key].stats.uniqueMissing += puzzleResult.stats.uniqueMissing;
      allOverallResult[key].stats.nakedSingle += puzzleResult.stats.nakedSingle;
      allOverallResult[key].stats.hiddenSingle += puzzleResult.stats.hiddenSingle;
    }
  }

  allOverallResult[key].solvedPercent = parseFloat(
    ((allOverallResult[key].solved / allOverallResult[key].total) * 100).toFixed(2)
  );
}

console.log("done");

fs.writeFileSync(`./result/${filename}-puzzle-result.json`, JSON.stringify(allPuzzleResult));
fs.writeFileSync(`./result/${filename}-overall-result.json`, JSON.stringify(allOverallResult));
