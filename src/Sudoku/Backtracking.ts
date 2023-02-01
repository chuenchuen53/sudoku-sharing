import ArrUtil from "../utils/ArrUtil";

export default class Backtracking {
  grid: number[][];
  takeBacks: number;

  constructor(grid: number[][] | string[][]) {
    this.takeBacks = 0;
    this.grid = ArrUtil.create2DArray(9, 9, 0);
    grid.forEach((row, i) => {
      row.forEach((value, j) => {
        this.grid[i][j] = typeof value === "string" ? parseInt(value) : value;
      });
    });
  }

  private static isValid(grid: number[][], row: number, col: number, num: number) {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num || grid[i][col] === num) return false;
    }

    const rowStart = Math.floor(row / 3) * 3;
    const colStart = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[rowStart + i][colStart + j] === num) return false;
      }
    }

    return true;
  }

  solveSudoku() {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (this.grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (Backtracking.isValid(this.grid, row, col, num)) {
              this.grid[row][col] = num;
              if (this.solveSudoku()) {
                return true;
              } else {
                this.grid[row][col] = 0;
                this.takeBacks++;
              }
            }
          }
          return false;
        }
      }
    }
    return true;
  }
}
