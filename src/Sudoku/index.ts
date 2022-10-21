import ArrayUtils from "@/utils/ArrayUtil";

type SudokuIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type SudokuElement = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type Candidates = {
  [key in SudokuElement]: boolean;
};

interface Cell {
  clue?: SudokuElement;
  inputValue?: SudokuElement;
  candidates?: Candidates;
}
type SudokuRow = Cell[];
type Puzzle = SudokuRow[];

interface InputValueData {
  rowIndex: number;
  columnIndex: number;
  value: SudokuElement;
}

interface CellWithIndex extends Cell {
  rowIndex: number;
  columnIndex: number;
}

type VirtualLine = CellWithIndex[];

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

const candidatesTemplate = (defaultValue: boolean) => ({
  "1": defaultValue,
  "2": defaultValue,
  "3": defaultValue,
  "4": defaultValue,
  "5": defaultValue,
  "6": defaultValue,
  "7": defaultValue,
  "8": defaultValue,
  "9": defaultValue,
});

const testingCandidates: { [key in SudokuElement]: boolean } = {
  "1": false,
  "2": false,
  "3": false,
  "4": false,
  "5": true,
  "6": true,
  "7": true,
  "8": true,
  "9": true,
};

export default class Sudoku {
  public puzzle: Puzzle;
  public isValid: boolean;

  constructor() {
    this.puzzle = this.createPuzzle(testingPuzzle);
    this.isValid = this.validatePuzzle().clueValid;
  }

  createPuzzle(clues?: (SudokuElement | null)[][]): Puzzle {
    const puzzle: Puzzle = ArrayUtils.create2DArray(9, 9, {});
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

  getRow(rowIndex: number): VirtualLine {
    return this.puzzle[rowIndex].map((x, columnIndex) => ({
      ...x,
      rowIndex,
      columnIndex,
    }));
  }

  getColumn(columnIndex: number): VirtualLine {
    return this.puzzle.map((row, rowIndex) => ({
      ...row[columnIndex],
      rowIndex,
      columnIndex,
    }));
  }

  getBox(rowIndex: number, columnIndex: number): VirtualLine {
    const box: VirtualLine = [];
    const boxRowIndex = this.boxFirstRowOrColumnIndex(rowIndex);
    const boxColumnIndex = this.boxFirstRowOrColumnIndex(columnIndex);
    for (let i = boxRowIndex; i < boxRowIndex + 3; i++) {
      for (let j = boxColumnIndex; j < boxColumnIndex + 3; j++) {
        box.push({
          ...this.puzzle[i][j],
          rowIndex: i,
          columnIndex: j,
        });
      }
    }
    return box;
  }

  getAllRows(): VirtualLine[] {
    return this.puzzle.map((_, rowIndex) => this.getRow(rowIndex));
  }

  getAllColumns(): VirtualLine[] {
    return this.puzzle[0].map((_, columnIndex) => this.getColumn(columnIndex));
  }

  getAllBoxes(): VirtualLine[] {
    const boxes: VirtualLine[] = [];
    for (let i = 0; i < 9; i += 3) {
      for (let j = 0; j < 9; j += 3) {
        boxes.push(this.getBox(i, j));
      }
    }
    return boxes;
  }

  boxFirstRowOrColumnIndex(index: number) {
    return Math.floor(index / 3) * 3;
  }

  getAllCellsInRelatedVirtualLines(rowIndex: number, columnIndex: number): { rowIndex: number; columnIndex: number }[] {
    const row = this.getRow(rowIndex);
    const column = this.getColumn(columnIndex);
    const box = this.getBox(rowIndex, columnIndex);
    const allCellsInRelatedVirtualLines = [...row, ...column, ...box]
      .filter(
        (value, index, self) =>
          index === self.findIndex((c) => c.rowIndex === value.rowIndex && c.columnIndex === value.columnIndex)
      )
      .map(({ rowIndex, columnIndex }) => ({ rowIndex, columnIndex }));
    return allCellsInRelatedVirtualLines;
  }

  getBoxIndex(rowIndex: number, columnIndex: number) {
    return Math.floor(rowIndex / 3) * 3 + Math.floor(columnIndex / 3);
  }

  setCandidates(rowIndex: number, columnIndex: number, candidates: Candidates) {
    this.puzzle[rowIndex][columnIndex].candidates = { ...candidates };
  }

  setInputValue(data: InputValueData[]) {
    data.forEach(({ rowIndex, columnIndex, value }) => {
      this.puzzle[rowIndex][columnIndex].inputValue = value;
      const { inputValueValid } = this.validatePuzzle();
      this.isValid = inputValueValid;
    });
  }

  clearAllCandidates() {
    for (let i = 0; i < this.puzzle.length; i++) {
      for (let j = 0; j < this.puzzle[i].length; j++) {
        this.puzzle[i][j].candidates = undefined;
      }
    }
  }

  missingInVirtualLine(virtualLine: VirtualLine) {
    const missing = candidatesTemplate(true);
    virtualLine.forEach((cell) => {
      if (cell.clue) {
        missing[cell.clue] = false;
      } else if (cell.inputValue) {
        missing[cell.inputValue] = false;
      }
    });
    return missing;
  }

  validatePuzzle() {
    function checkVirtualLineDuplicate(
      virtualLine: VirtualLine,
      key: Extract<keyof CellWithIndex, "clue" | "inputValue">
    ) {
      const arr = key === "clue" ? virtualLine.map((x) => x.clue) : virtualLine.map((x) => x.clue ?? x.inputValue);
      const { haveDuplicate } = ArrayUtils.checkDuplicates(arr);
      return haveDuplicate;
    }

    const allRows = this.getAllRows();
    const allColumns = this.getAllColumns();
    const allBoxes = this.getAllBoxes();

    const rowClueValid = allRows.every((row) => !checkVirtualLineDuplicate(row, "clue"));
    const columnClueValid = allColumns.every((column) => !checkVirtualLineDuplicate(column, "clue"));
    const boxClueValid = allBoxes.every((box) => !checkVirtualLineDuplicate(box, "clue"));
    const clueValid = rowClueValid && columnClueValid && boxClueValid;

    const rowInputValueValid = allRows.every((row) => !checkVirtualLineDuplicate(row, "inputValue"));
    const columnInputValueValid = allColumns.every((column) => !checkVirtualLineDuplicate(column, "inputValue"));
    const boxInputValueValid = allBoxes.every((box) => !checkVirtualLineDuplicate(box, "inputValue"));
    const inputValueValid = rowInputValueValid && columnInputValueValid && boxInputValueValid;

    return { clueValid, inputValueValid };
  }

  getMissing() {
    const allRows = this.getAllRows();
    const allColumns = this.getAllColumns();
    const allBoxes = this.getAllBoxes();

    const missingInRows = allRows.map((x) => this.missingInVirtualLine(x));
    const missingInColumns = allColumns.map((x) => this.missingInVirtualLine(x));
    const missingInBoxes = allBoxes.map((x) => this.missingInVirtualLine(x));

    for (let i = 0; i < this.puzzle.length; i++) {
      for (let j = 0; j < this.puzzle[i].length; j++) {
        const boxIndex = this.getBoxIndex(i, j);
        const missingRow = missingInRows[i];
        const missingColumn = missingInColumns[j];
        const missingBox = missingInBoxes[boxIndex];
        const candidates = candidatesTemplate(false);

        for (const key in candidates) {
          const typedKey = key as SudokuElement;
          if (missingRow[typedKey] && missingColumn[typedKey] && missingBox[typedKey]) {
            candidates[typedKey] = true;
          }
        }

        this.setCandidates(i, j, candidates);
      }
    }
  }

  getNakedSingles() {
    if (!this.isValid) return [];

    const arr: InputValueData[] = [];

    for (let i = 0; i < this.puzzle.length; i++) {
      for (let j = 0; j < this.puzzle[i].length; j++) {
        const cell = this.puzzle[i][j];
        if (cell.clue || cell.inputValue || !cell.candidates) {
          continue;
        }
        const candidates = cell.candidates;
        const entries = Object.entries(candidates) as [SudokuElement, boolean][];
        const candidatesArr = entries.filter(([_, value]) => value);
        if (candidatesArr.length === 1) {
          arr.push({ rowIndex: i, columnIndex: j, value: candidatesArr[0][0] });
        }
      }
    }

    return arr;
  }

  setUniqueMissingCandidateToInputValue() {
    const arr = this.getNakedSingles();
    this.setInputValue(arr);
  }
}
