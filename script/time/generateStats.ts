import path from "path";
import fs, { readFileSync } from "fs";

interface Data {
  strategy: string;
  difficulty: string;
  size: number;
  result: { timeSpent: number; solved: boolean }[];
}

const directory = path.join(__dirname, "result");

main();

function main() {
  const allData = getAllData(directory);
  const stats = allData.map(getBasicStats);
  stats.sort(sortArr);
  console.table(stats);
}

function getAllData(directory: string) {
  const allResult: Data[] = [];
  const files = fs.readdirSync(directory);
  files.forEach((filename) => {
    const str = readFileSync(path.join(directory, filename), "utf8");
    const data = JSON.parse(str);
    allResult.push(data);
  });
  return allResult;
}

function getBasicStats(data: Data) {
  const to3Decimal = (n: number) => Math.round(n * 1000) / 1000;

  const strategy = data.strategy;
  const difficulty = data.difficulty;
  const totalNumberOfPuzzles = data.size;
  const totalTimeSpent = to3Decimal(data.result.reduce((acc, r) => acc + r.timeSpent, 0));
  const averageTimeSpent = to3Decimal(totalTimeSpent / totalNumberOfPuzzles);
  const numberOfSolvedPuzzles = data.result.filter((r) => r.solved).length;
  const totalTimeSpentForSolvedPuzzles = to3Decimal(
    data.result.reduce((acc, r) => (r.solved ? acc + r.timeSpent : acc), 0)
  );
  const averageTimeSpentForSolvedPuzzles = to3Decimal(totalTimeSpentForSolvedPuzzles / numberOfSolvedPuzzles);

  return {
    strategy,
    difficulty,
    totalNumberOfPuzzles,
    totalTimeSpent,
    averageTimeSpent,
    numberOfSolvedPuzzles,
    totalTimeSpentForSolvedPuzzles,
    averageTimeSpentForSolvedPuzzles,
  };
}

function sortArr(a: { strategy: string; difficulty: string }, b: { strategy: string; difficulty: string }): number {
  const strategyMap = {
    human: 0,
    backtracking: 1,
  };

  const difficulty = {
    simple: 0,
    easy: 1,
    intermediate: 2,
    expert: 3,
  };

  if (a.strategy !== b.strategy) {
    return strategyMap[a.strategy] - strategyMap[b.strategy];
  } else {
    return difficulty[a.difficulty] - difficulty[b.difficulty];
  }
}
