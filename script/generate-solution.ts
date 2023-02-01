import samplePuzzle from "../src/samplePuzzle";
import SudokuSolver from "../src/Sudoku/SudokuSolver";
import ArrUtil from "../src/utils/ArrUtil";
import type { InputClues } from "../src/Sudoku/type";

const inputCluesTemplate: () => InputClues = () => ArrUtil.create2DArray(9, 9, "0");

let str = "";

let objStr = "";

for (const key in samplePuzzle) {
  const solution = inputCluesTemplate();

  const s = new SudokuSolver(samplePuzzle[key]);
  s.trySolve();

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      solution[i][j] = s.grid[i][j].clue ?? s.grid[i][j].inputValue ?? "0";
    }
  }

  str += `const ${key} = ${JSON.stringify(solution)};\n\n`;
  objStr += `${key},\n`;
}

const appendStr = `\
const samplePuzzlesSolution = {
${objStr}
};

export default samplePuzzlesSolution;
`;

str += appendStr;

console.log(str);
