import ArrUtil from "../utils/ArrUtil";
import { VirtualLineType } from "./type";
import type {
  SudokuElement,
  Candidates,
  Cell,
  InputValueData,
  Grid,
  VirtualLine,
  InputClues,
  RowColumn,
  CheckVirtualLineDuplicateResult,
  ValidateDetail,
  Position,
} from "./type";

export default class Sudoku {
  public grid: Grid;
  public numberOfClues: number;
  public isValid: boolean;
  public validateDetail: ValidateDetail;
  private rows: readonly VirtualLine[];
  private columns: readonly VirtualLine[];
  private boxes: readonly VirtualLine[];

  constructor(clues: InputClues) {
    this.grid = Sudoku.createGrid(clues);
    this.numberOfClues = this.grid.reduce((acc, row) => acc + row.reduce((acc, cell) => (cell.clue ? acc + 1 : acc), 0), 0);
    const nineLenArr = new Array(9).fill(true);
    this.rows = Object.freeze(this.grid.map((row) => row));
    this.columns = Object.freeze(nineLenArr.map((_, i) => this.grid.map((row) => row[i])));
    this.boxes = Object.freeze(
      nineLenArr.map((_, i) => {
        const firstRowIndex = Sudoku.boxFirstLineIndex(i, VirtualLineType.ROW);
        const firstColumnIndex = Sudoku.boxFirstLineIndex(i, VirtualLineType.COLUMN);
        return nineLenArr.map((_, j) => this.grid[firstRowIndex + Math.floor(j / 3)][firstColumnIndex + (j % 3)]);
      })
    );

    const { isValid, validateDetail } = this.validatePuzzle("clue");
    this.isValid = isValid;
    this.validateDetail = validateDetail;
  }

  get solved(): boolean {
    const { isValid, validateDetail } = this.validatePuzzle("inputValue");
    this.isValid = isValid;
    this.validateDetail = validateDetail;
    return this.isValid && this.grid.every((row) => row.every((cell) => cell.clue || cell.inputValue));
  }

  static boxFirstLineIndex(boxIndex: number, type: RowColumn): number {
    switch (type) {
      case VirtualLineType.ROW:
        return Math.floor(boxIndex / 3) * 3;
      case VirtualLineType.COLUMN:
        return (boxIndex % 3) * 3;
    }
  }

  static getBoxIndex(rowIndex: number, columnIndex: number): number {
    return Math.floor(rowIndex / 3) * 3 + Math.floor(columnIndex / 3);
  }

  static getRowColumnIndexFromBoxIndexAndCellIndex(boxIndex: number, cellIndex: number): { rowIndex: number; columnIndex: number } {
    return {
      rowIndex: Math.floor(boxIndex / 3) * 3 + Math.floor(cellIndex / 3),
      columnIndex: (boxIndex % 3) * 3 + (cellIndex % 3),
    };
  }

  static isSamePos(p1: Position, p2: Position): boolean {
    return p1.rowIndex === p2.rowIndex && p1.columnIndex === p2.columnIndex;
  }

  static virtualLinesIntersections(line1: VirtualLine, line2: VirtualLine): Cell[] {
    return line1.filter((x) => line2.some((y) => Sudoku.isSamePos(x, y)));
  }

  static missingValuesInVirtualLine(virtualLine: VirtualLine): Candidates {
    const missing = Sudoku.candidatesFactory(true);
    virtualLine.forEach((cell) => {
      if (cell.clue) {
        missing[cell.clue] = false;
      } else if (cell.inputValue) {
        missing[cell.inputValue] = false;
      }
    });
    return missing;
  }

  static removeDuplicatedInputValueData(data: InputValueData[]): InputValueData[] {
    return data.filter(
      (cur, index, self) => index === self.findIndex((x) => x.rowIndex === cur.rowIndex && x.columnIndex === cur.columnIndex && x.value === cur.value)
    );
  }

  static candidatesFactory(defaultValue: boolean, elements?: SudokuElement[]): Candidates {
    if (!elements) {
      return {
        "1": defaultValue,
        "2": defaultValue,
        "3": defaultValue,
        "4": defaultValue,
        "5": defaultValue,
        "6": defaultValue,
        "7": defaultValue,
        "8": defaultValue,
        "9": defaultValue,
      };
    } else {
      const candidates: Candidates = {
        "1": !defaultValue,
        "2": !defaultValue,
        "3": !defaultValue,
        "4": !defaultValue,
        "5": !defaultValue,
        "6": !defaultValue,
        "7": !defaultValue,
        "8": !defaultValue,
        "9": !defaultValue,
      };
      for (const element of elements) {
        candidates[element] = defaultValue;
      }
      return candidates;
    }
  }

  static candidatesCount(candidates: Candidates): number {
    return Object.values(candidates).reduce((acc, cur) => (cur ? acc + 1 : acc), 0);
  }

  static checkVirtualLineHaveDuplicateValue(
    virtualLine: VirtualLine,
    key: Extract<keyof Cell, "clue" | "inputValue">
  ): CheckVirtualLineDuplicateResult {
    const duplicatedCells: Cell[] = [];
    const values = key === "clue" ? virtualLine.map((x) => x.clue) : virtualLine.map((x) => x.clue ?? x.inputValue);
    values.forEach((x, ix, arr) => x && arr.some((y, iy) => ix !== iy && x === y && duplicatedCells.push(virtualLine[ix])));
    const haveDuplicate = duplicatedCells.length > 0;
    return { haveDuplicate, duplicatedCells };
  }

  static allElements(): SudokuElement[] {
    return ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  }

  private static createGrid(clues: InputClues): Grid {
    if (clues.length !== 9 || clues.some((x) => x.length !== 9)) throw new Error("Invalid input clues");
    const grid: Grid = ArrUtil.create2DArray<Cell>(9, 9, (rowIndex, columnIndex) => ({ rowIndex, columnIndex }));
    clues.forEach((row, i) =>
      row.forEach((clue, j) => {
        if (clue !== "0") grid[i][j].clue = clue;
      })
    );

    return grid;
  }

  getRow(rowIndex: number): VirtualLine {
    return this.rows[rowIndex];
  }

  getColumn(columnIndex: number): VirtualLine {
    return this.columns[columnIndex];
  }

  getBoxFromRowColumnIndex(rowIndex: number, columnIndex: number): VirtualLine {
    return this.boxes[Sudoku.getBoxIndex(rowIndex, columnIndex)];
  }

  getBoxFromBoxIndex(boxIndex: number): VirtualLine {
    const rowIndex = Sudoku.boxFirstLineIndex(boxIndex, VirtualLineType.ROW);
    const columnIndex = Sudoku.boxFirstLineIndex(boxIndex, VirtualLineType.COLUMN);
    return this.getBoxFromRowColumnIndex(rowIndex, columnIndex);
  }

  getAllRows(): VirtualLine[] {
    return this.rows.slice();
  }

  getAllColumns(): VirtualLine[] {
    return this.columns.slice();
  }

  getAllBoxes(): VirtualLine[] {
    return this.boxes.slice();
  }

  getAllVirtualLines(type: VirtualLineType): VirtualLine[] {
    switch (type) {
      case VirtualLineType.ROW:
        return this.getAllRows();
      case VirtualLineType.COLUMN:
        return this.getAllColumns();
      case VirtualLineType.BOX:
        return this.getAllBoxes();
    }
  }

  getAllRelatedBoxesInRowOrColumn(lineType: RowColumn, lineIndex: number): VirtualLine[] {
    switch (lineType) {
      case VirtualLineType.ROW:
        return [
          this.getBoxFromRowColumnIndex(lineIndex, 0),
          this.getBoxFromRowColumnIndex(lineIndex, 3),
          this.getBoxFromRowColumnIndex(lineIndex, 6),
        ];
      case VirtualLineType.COLUMN:
        return [
          this.getBoxFromRowColumnIndex(0, lineIndex),
          this.getBoxFromRowColumnIndex(3, lineIndex),
          this.getBoxFromRowColumnIndex(6, lineIndex),
        ];
    }
  }

  getAllRelatedRowsOrColumnsInBox(lineType: RowColumn, boxIndex: number): VirtualLine[] {
    const firstIndex = Sudoku.boxFirstLineIndex(boxIndex, lineType);
    switch (lineType) {
      case VirtualLineType.ROW:
        return [this.getRow(firstIndex), this.getRow(firstIndex + 1), this.getRow(firstIndex + 2)];
      case VirtualLineType.COLUMN:
        return [this.getColumn(firstIndex), this.getColumn(firstIndex + 1), this.getColumn(firstIndex + 2)];
    }
  }

  getAllRelatedCells(cell: Cell): Cell[] {
    const row = this.getRow(cell.rowIndex);
    const column = this.getColumn(cell.columnIndex);
    const box = this.getBoxFromRowColumnIndex(cell.rowIndex, cell.columnIndex);
    return [...row, ...column, ...box].filter(
      (x, index, arr) => !Sudoku.isSamePos(x, cell) && arr.findIndex((y) => Sudoku.isSamePos(x, y)) === index
    );
  }

  setCandidates(rowIndex: number, columnIndex: number, candidates: Candidates): void {
    const cell = this.grid[rowIndex][columnIndex];
    if (!cell.candidates) {
      this.grid[rowIndex][columnIndex].candidates = { ...candidates };
    } else {
      for (const element of Sudoku.allElements()) {
        cell.candidates[element] = candidates[element];
      }
    }
  }

  setInputValue({ rowIndex, columnIndex, value }: InputValueData, updateValidateInfo: boolean): boolean {
    const cell = this.grid[rowIndex][columnIndex];
    if (cell.clue) return false;

    cell.inputValue = value;
    if (cell.candidates) delete cell.candidates;

    if (updateValidateInfo) {
      const { isValid, validateDetail } = this.validatePuzzle("inputValue");
      this.isValid = isValid;
      this.validateDetail = validateDetail;
    }

    return true;
  }

  setInputValues(data: InputValueData[]): void {
    const haveChanged: boolean[] = data.map((x) => this.setInputValue(x, false));
    if (haveChanged.filter((x) => x).length) {
      const { isValid, validateDetail } = this.validatePuzzle("inputValue");
      this.isValid = isValid;
      this.validateDetail = validateDetail;
    }
  }

  removeInputValue({ rowIndex, columnIndex }: { rowIndex: number; columnIndex: number }, update: boolean): void {
    if (this.grid[rowIndex][columnIndex].inputValue) {
      delete this.grid[rowIndex][columnIndex].inputValue;
    }

    if (update) {
      const { isValid, validateDetail } = this.validatePuzzle("inputValue");
      this.isValid = isValid;
      this.validateDetail = validateDetail;
    }
  }

  addElementInCandidates(inputValueDataArr: InputValueData[]): number {
    let count = 0;

    inputValueDataArr.forEach(({ rowIndex, columnIndex, value }) => {
      const cell = this.grid[rowIndex][columnIndex];

      if (cell.candidates) {
        if (!cell.candidates[value]) {
          cell.candidates[value] = true;
          count++;
        }
      } else {
        cell.candidates = Sudoku.candidatesFactory(true, [value]);
        count++;
      }
    });

    return count;
  }

  removeElementInCandidates(inputValueDataArr: InputValueData[]): number {
    let count = 0;

    inputValueDataArr.forEach(({ rowIndex, columnIndex, value }) => {
      const cell = this.grid[rowIndex][columnIndex];
      if (cell.candidates?.[value]) {
        cell.candidates[value] = false;
        count++;
      }
    });

    return count;
  }

  clearAllCandidates(): void {
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        if (this.grid[i][j].candidates) delete this.grid[i][j].candidates;
      }
    }
  }

  validatePuzzle(type: Extract<keyof Cell, "clue" | "inputValue">): {
    isValid: boolean;
    validateDetail: ValidateDetail;
  } {
    const rowDetail = this.rows.map((x) => Sudoku.checkVirtualLineHaveDuplicateValue(x, type));
    const columnDetail = this.columns.map((x) => Sudoku.checkVirtualLineHaveDuplicateValue(x, type));
    const boxDetail = this.boxes.map((x) => Sudoku.checkVirtualLineHaveDuplicateValue(x, type));
    const validateDetail: ValidateDetail = {
      [VirtualLineType.ROW]: rowDetail,
      [VirtualLineType.COLUMN]: columnDetail,
      [VirtualLineType.BOX]: boxDetail,
    };
    const isValid = !rowDetail.some((x) => x.haveDuplicate) && !columnDetail.some((x) => x.haveDuplicate) && !boxDetail.some((x) => x.haveDuplicate);

    return { isValid, validateDetail };
  }
}
