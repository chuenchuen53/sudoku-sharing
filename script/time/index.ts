import generateResult from "./util";

const SIZE = 10000;
const TRY_TIMES = 10;

console.log(`[${new Date().toLocaleString()}] program start`);

for (let i = 0; i < TRY_TIMES; i++) {
  console.log(`[${new Date().toLocaleString()}] try ${i + 1} times start`);
  const start = new Date().getTime();

  const folder = getFolderName(i);
  generateResult("human", "simple", SIZE, folder);
  generateResult("human", "easy", SIZE, folder);
  generateResult("human", "intermediate", SIZE, folder);
  generateResult("human", "expert", SIZE, folder);

  generateResult("backtracking", "simple", SIZE, folder);
  generateResult("backtracking", "easy", SIZE, folder);
  generateResult("backtracking", "intermediate", SIZE, folder);
  generateResult("backtracking", "expert", SIZE, folder);

  console.log(`[${new Date().toLocaleString()}] try ${i + 1} times end`);
  console.log(`[${new Date().toLocaleString()}] spent time: ${(new Date().getTime() - start) / 1000}s`);
}

function getFolderName(index: number) {
  return `result-${index}`;
}
