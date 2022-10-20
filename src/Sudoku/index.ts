export type SudokuIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type SudokuElement = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Cell = {
  clue?: SudokuElement;
  value?: SudokuElement;
  candidates?: SudokuElement[];
};
type SudokuRow = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];
type SudokuColumn = [Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell, Cell];
type SudokuBox = [[Cell, Cell, Cell], [Cell, Cell, Cell], [Cell, Cell, Cell]];
type Puzzle = [
  SudokuRow,
  SudokuRow,
  SudokuRow,
  SudokuRow,
  SudokuRow,
  SudokuRow,
  SudokuRow,
  SudokuRow,
  SudokuRow
];

const testingPuzzle: (SudokuElement | null)[][] = [
  ["2", null, null, null, null, null, "8", "6", null],
  [null, null, null, null, "4", "2", null, null, null],
  [null, "1", null, null, "6", null, null, "4", "7"],
  ["3", "4", "5", null, "2", null, null, null, "1"],
  ["7", "2", null, null, null, null, "4", null, "9"],
  ["8", null, null, null, null, null, "5", null, "6"],
  [null, null, "2", null, "3", null, null, null, null],
  [null, null, null, "6", "8", null, null, "1", "2"],
  ["5", null, "8", null, null, null, null, null, "4"],
];

export default class Sudoku {
  public puzzle: Puzzle;
  constructor() {
    this.puzzle = this.createPuzzle(testingPuzzle);
  }

  createPuzzle(clues?: (SudokuElement | null)[][]): Puzzle {
    const puzzle: Puzzle = [
      [{}, {}, {}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}, {}, {}],
      [{}, {}, {}, {}, {}, {}, {}, {}, {}],
    ];

    if (!clues) return puzzle;

    for (let i = 0; i < clues.length; i++) {
      for (let j = 0; j < clues[i].length; j++) {
        const clue = clues[i][j];
        if (clue) {
          puzzle[i][j].clue = clue;
        }
      }
    }

    return puzzle;
  }

  getRow(row: SudokuIndex): SudokuRow {
    return this.puzzle[row];
  }

  getColumn(column: SudokuIndex): SudokuColumn {
    const columnArray: SudokuColumn = [{}, {}, {}, {}, {}, {}, {}, {}, {}];
    for (let i = 0; i < this.puzzle.length; i++) {
      columnArray[i] = this.puzzle[i][column];
    }
    return columnArray;
  }

  getBox(row: SudokuIndex, column: SudokuIndex): SudokuBox {
    const box: SudokuBox = [
      [{}, {}, {}],
      [{}, {}, {}],
      [{}, {}, {}],
    ];
    const boxRow = Math.floor(row / 3);
    const boxColumn = Math.floor(column / 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        box[i][j] = this.puzzle[boxRow * 3 + i][boxColumn * 3 + j];
      }
    }
    return box;
  }
}
