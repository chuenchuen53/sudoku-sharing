export default class Backtracking {
  static solveSudoku(grid: number[][]) {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (Backtracking.isSafe(grid, row, col, num)) {
              grid[row][col] = num;
              if (Backtracking.solveSudoku(grid)) {
                return true;
              } else {
                grid[row][col] = 0;
              }
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  static isSafe(grid: number[][], row: number, col: number, num: number) {
    for (let i = 0; i < 9; i++) {
      if (grid[row][i] === num || grid[i][col] === num) {
        return false;
      }
    }
    const rowStart = Math.floor(row / 3) * 3;
    const colStart = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (grid[rowStart + i][colStart + j] === num) {
          return false;
        }
      }
    }
    return true;
  }
}
