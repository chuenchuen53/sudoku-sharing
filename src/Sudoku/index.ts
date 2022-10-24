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

interface ElementMissing {
  rows: Candidates[];
  columns: Candidates[];
  boxes: Candidates[];
}

interface Stats {
  rowUniqueMissing: number;
  columnUniqueMissing: number;
  boxUniqueMissing: number;
  nakedSingles: number;
  hiddenSingles: number;
}

const statsTemplate: () => Stats = () => ({
  rowUniqueMissing: 0,
  columnUniqueMissing: 0,
  boxUniqueMissing: 0,
  nakedSingles: 0,
  hiddenSingles: 0,
});

// medium
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

// medium
const testingPuzzle2: (SudokuElement | null)[][] = [
  [null, "3", null, "9", null, null, null, null, null],
  ["6", null, null, "2", null, null, "8", null, null],
  ["8", null, null, "6", "1", null, "5", "4", "9"],
  [null, null, null, null, "3", "2", "1", null, null],
  ["2", null, "8", null, "4", null, null, null, null],
  [null, null, "3", "1", "9", null, null, null, "4"],
  ["9", null, "2", null, null, null, null, null, "5"],
  ["1", null, null, null, null, null, null, "6", null],
  [null, null, "4", null, "6", null, "9", null, "8"],
];

// hard
const testingPuzzle3: (SudokuElement | null)[][] = [
  [null, null, null, null, null, "1", "6", null, null],
  [null, null, "5", null, null, null, null, null, "3"],
  [null, null, null, null, null, null, "5", "9", "4"],
  [null, "8", null, null, "6", null, null, null, "1"],
  [null, "1", null, null, null, "4", "9", null, "2"],
  ["4", "9", null, "1", "8", null, null, null, null],
  [null, "2", null, "4", null, "6", "1", null, null],
  [null, null, null, null, "5", "3", "2", null, null],
  ["7", null, null, null, null, "8", null, "6", null],
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

const hiddenCandidatesTemplate = () => ({
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5": 0,
  "6": 0,
  "7": 0,
  "8": 0,
  "9": 0,
});

export default class Sudoku {
  public puzzle: Puzzle;
  public isValid: boolean;
  public stats: Stats;
  public numberOfClues: number;

  private elementMissing: ElementMissing;

  constructor() {
    this.puzzle = this.createPuzzle(testingPuzzle3);
    this.isValid = this.validatePuzzle().clueValid;
    this.stats = statsTemplate();
    this.elementMissing = this.updateElementMissing();
    this.numberOfClues = this.getNumberOfClues();
  }

  private getNumberOfClues() {
    return this.puzzle.reduce((acc, row) => acc + row.reduce((acc, cell) => (cell.clue ? acc + 1 : acc), 0), 0);
  }

  private updateElementMissing() {
    const rows = this.getAllRows().map((x) => this.missingInVirtualLine(x));
    const columns = this.getAllColumns().map((x) => this.missingInVirtualLine(x));
    const boxes = this.getAllBoxes().map((x) => this.missingInVirtualLine(x));

    this.elementMissing = {
      rows,
      columns,
      boxes,
    };

    return this.elementMissing;
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

  getAllRelatedBoxesInRow(rowIndex: number): VirtualLine[] {
    const boxes: VirtualLine[] = [];
    for (let i = 0; i < 9; i += 3) {
      boxes.push(this.getBox(rowIndex, i));
    }
    return boxes;
  }

  getAllRelatedBoxesInColumn(columnIndex: number): VirtualLine[] {
    const boxes: VirtualLine[] = [];
    for (let i = 0; i < 9; i += 3) {
      boxes.push(this.getBox(i, columnIndex));
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
    if (!data.length) return;

    data.forEach(({ rowIndex, columnIndex, value }) => {
      if (this.puzzle[rowIndex][columnIndex].clue) {
        console.error("Cannot set input value to a cell with a clue");
        return;
      }

      this.puzzle[rowIndex][columnIndex].inputValue = value;
      this.puzzle[rowIndex][columnIndex].candidates = undefined;
      const { inputValueValid } = this.validatePuzzle();
      this.isValid = inputValueValid;
    });
    this.updateElementMissing();
    this.getCombinedMissing();
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

  private checkVirtualLineDuplicate(
    virtualLine: VirtualLine,
    key: Extract<keyof CellWithIndex, "clue" | "inputValue">
  ) {
    const arr = key === "clue" ? virtualLine.map((x) => x.clue) : virtualLine.map((x) => x.clue ?? x.inputValue);
    const { haveDuplicate } = ArrayUtils.checkDuplicates(arr);
    return haveDuplicate;
  }

  private removeDuplicatesInputValueData(data: InputValueData[]) {
    return data.filter(
      (cur, index, self) =>
        index ===
        self.findIndex((x) => x.rowIndex === cur.rowIndex && x.columnIndex === cur.columnIndex && x.value === cur.value)
    );
  }

  validatePuzzle() {
    const allRows = this.getAllRows();
    const allColumns = this.getAllColumns();
    const allBoxes = this.getAllBoxes();

    const rowClueValid = allRows.every((row) => !this.checkVirtualLineDuplicate(row, "clue"));
    const columnClueValid = allColumns.every((column) => !this.checkVirtualLineDuplicate(column, "clue"));
    const boxClueValid = allBoxes.every((box) => !this.checkVirtualLineDuplicate(box, "clue"));
    const clueValid = rowClueValid && columnClueValid && boxClueValid;

    const rowInputValueValid = allRows.every((row) => !this.checkVirtualLineDuplicate(row, "inputValue"));
    const columnInputValueValid = allColumns.every((column) => !this.checkVirtualLineDuplicate(column, "inputValue"));
    const boxInputValueValid = allBoxes.every((box) => !this.checkVirtualLineDuplicate(box, "inputValue"));
    const inputValueValid = rowInputValueValid && columnInputValueValid && boxInputValueValid;

    return { clueValid, inputValueValid };
  }

  getCombinedMissing() {
    const missingInRows = this.elementMissing.rows;
    const missingInColumns = this.elementMissing.columns;
    const missingInBoxes = this.elementMissing.boxes;

    for (let i = 0; i < this.puzzle.length; i++) {
      for (let j = 0; j < this.puzzle[i].length; j++) {
        if (this.puzzle[i][j].clue || this.puzzle[i][j].inputValue) continue;

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

  lockedCandidatesHelper(rowIndex: number) {
    const missing = this.elementMissing.rows[rowIndex];
    const relatedBoxes = this.getAllRelatedBoxesInRow(rowIndex);

    for (const key in missing) {
      const sudokuElement = key as SudokuElement;
      if (!missing[sudokuElement]) continue;

      const boxContained = relatedBoxes.map((box) =>
        box.some(
          (cell) =>
            cell.rowIndex === rowIndex &&
            !cell.clue &&
            !cell.inputValue &&
            cell.candidates &&
            cell.candidates[sudokuElement]
        )
      );

      const numberOfBoxContained = boxContained.reduce((acc, cur) => acc + (cur ? 1 : 0), 0);
      if (numberOfBoxContained === 1) {
        const boxIndex = boxContained.indexOf(true);
        // const box = relatedBoxes[boxIndex];
        // const cell = box.find(
        //   (cell) =>
        //     cell.rowIndex === rowIndex &&
        //     !cell.clue &&
        //     !cell.inputValue &&
        //     cell.candidates &&
        //     cell.candidates[sudokuElement]
        // )!;
        // this.setInputValue([{ rowIndex: cell.rowIndex, columnIndex: cell.columnIndex, value: sudokuElement }]);
      }
    }
  }

  removeCandidatesDueToLockedCandidates(): InputValueData[] {
    // row lock
  }

  getUniqueCandidate(candidates: Candidates): SudokuElement | null {
    const entries = Object.entries(candidates) as [SudokuElement, boolean][];
    const candidatesArr = entries.filter(([_, value]) => value);
    if (candidatesArr.length === 1) {
      return candidatesArr[0][0];
    } else {
      return null;
    }
  }

  getUniqueMissing(type: "row" | "column" | "box") {
    const allVirtualLines =
      type === "row" ? this.getAllRows() : type === "column" ? this.getAllColumns() : this.getAllBoxes();
    const missingArr =
      type === "row"
        ? this.elementMissing.rows
        : type === "column"
        ? this.elementMissing.columns
        : this.elementMissing.boxes;

    const result = [];

    for (let i = 0; i < allVirtualLines.length; i++) {
      const virtualLine = allVirtualLines[i];
      const missing = missingArr[i];
      const uniqueMissing = this.getUniqueCandidate(missing);

      if (uniqueMissing) {
        const cell = virtualLine.find((x) => !x.clue && !x.inputValue);
        if (cell) {
          const rowIndex = cell.rowIndex;
          const columnIndex = cell.columnIndex;
          result.push({ rowIndex, columnIndex, value: uniqueMissing });
        }
      }
    }
    return result;
  }

  getNakedSingles(): InputValueData[] {
    if (!this.isValid) return [];

    this.getCombinedMissing();
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

  getHiddenSinglesHelper(virtualLines: VirtualLine[]): InputValueData[] {
    const arr: InputValueData[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const candidatesCount = hiddenCandidatesTemplate();
      for (let j = 0; j < virtualLine.length; j++) {
        const cell = virtualLine[j];
        if (cell.clue || cell.inputValue || !cell.candidates) {
          continue;
        }
        const candidates = cell.candidates;
        for (const key in candidates) {
          const sudokuElement = key as SudokuElement;
          if (candidates[sudokuElement]) {
            candidatesCount[sudokuElement]++;
          }
        }
      }

      for (const key in candidatesCount) {
        const sudokuElement = key as SudokuElement;
        if (candidatesCount[sudokuElement] === 1) {
          const cell = virtualLine.find((x) => x.candidates && x.candidates[sudokuElement]);
          if (cell) {
            arr.push({ rowIndex: cell.rowIndex, columnIndex: cell.columnIndex, value: sudokuElement });
            break;
          }
        }
      }
    }

    return arr;
  }

  getHiddenSingles(): InputValueData[] {
    if (!this.isValid) return [];

    this.getCombinedMissing();

    const rowResult = this.getHiddenSinglesHelper(this.getAllRows());
    const columnResult = this.getHiddenSinglesHelper(this.getAllColumns());
    const boxResult = this.getHiddenSinglesHelper(this.getAllBoxes());

    const arr: InputValueData[] = this.removeDuplicatesInputValueData([...rowResult, ...columnResult, ...boxResult]);

    return arr;
  }

  setRowUniqueMissing(): boolean {
    const uniqueMissing = this.getUniqueMissing("row");
    if (uniqueMissing.length) {
      this.setInputValue(uniqueMissing);
      this.stats.rowUniqueMissing += uniqueMissing.length;
      return true;
    } else {
      return false;
    }
  }

  setColumnUniqueMissing(): boolean {
    const uniqueMissing = this.getUniqueMissing("column");
    if (uniqueMissing.length) {
      this.setInputValue(uniqueMissing);
      this.stats.columnUniqueMissing += uniqueMissing.length;
      return true;
    } else {
      return false;
    }
  }

  setBoxUniqueMissing(): boolean {
    const uniqueMissing = this.getUniqueMissing("box");
    if (uniqueMissing.length) {
      this.setInputValue(uniqueMissing);
      this.stats.boxUniqueMissing += uniqueMissing.length;
      return true;
    } else {
      return false;
    }
  }

  setNakedSingles(): boolean {
    const nakedSingles = this.getNakedSingles();
    if (nakedSingles.length) {
      this.setInputValue(nakedSingles);
      this.stats.nakedSingles += nakedSingles.length;
      return true;
    } else {
      return false;
    }
  }

  setHiddenSingles(): boolean {
    const hiddenSingles = this.getHiddenSingles();
    console.log("turbo ~ file: index.ts ~ line 490 ~ Sudoku ~ setHiddenSingles ~ hiddenSingles", hiddenSingles);

    if (hiddenSingles.length) {
      this.setInputValue(hiddenSingles);
      this.stats.hiddenSingles += hiddenSingles.length;
      return true;
    } else {
      return false;
    }
  }

  trySolve(): void {
    if (this.isValid) {
      if (this.setRowUniqueMissing()) return this.trySolve();
      if (this.setColumnUniqueMissing()) return this.trySolve();
      if (this.setBoxUniqueMissing()) return this.trySolve();
      if (this.setNakedSingles()) return this.trySolve();
      if (this.setHiddenSingles()) return this.trySolve();

      return;
    }
  }
}
