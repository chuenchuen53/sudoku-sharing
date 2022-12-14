import ArrayUtils from "../utils/ArrayUtil";
import { VirtualLineType } from "./type";
import type {
  SudokuElement,
  Candidates,
  CellWithIndex,
  InputValueData,
  Grid,
  VirtualLine,
  InputClues,
  RowColumn,
  CheckVirtualLineDuplicateResult,
  ValidateDetail,
} from "./type";

export const candidatesFactory = (defaultValue: boolean, elements?: SudokuElement[]) => {
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
    return {
      "1": elements.includes("1") ? defaultValue : !defaultValue,
      "2": elements.includes("2") ? defaultValue : !defaultValue,
      "3": elements.includes("3") ? defaultValue : !defaultValue,
      "4": elements.includes("4") ? defaultValue : !defaultValue,
      "5": elements.includes("5") ? defaultValue : !defaultValue,
      "6": elements.includes("6") ? defaultValue : !defaultValue,
      "7": elements.includes("7") ? defaultValue : !defaultValue,
      "8": elements.includes("8") ? defaultValue : !defaultValue,
      "9": elements.includes("9") ? defaultValue : !defaultValue,
    };
  }
};

export default class Sudoku {
  public grid: Grid;
  public numberOfClues: number;
  public isValid: boolean;
  public validateDetail: ValidateDetail;

  constructor(clues: InputClues) {
    this.grid = this.createPuzzle(clues);
    this.numberOfClues = this.getNumberOfClues();
    const { isValid, validateDetail } = this.validatePuzzle("clue");
    this.isValid = isValid;
    this.validateDetail = validateDetail;
  }

  private getNumberOfClues() {
    return this.grid.reduce((acc, row) => acc + row.reduce((acc, cell) => (cell.clue ? acc + 1 : acc), 0), 0);
  }

  createPuzzle(clues: InputClues): Grid {
    if (clues.length !== 9 || clues.some((x) => x.length !== 9)) throw new Error("Invalid input clues");
    const grid: Grid = ArrayUtils.create2DArray(9, 9, {});
    clues.forEach((row, i) =>
      row.forEach((clue, j) => {
        if (clue !== "0") grid[i][j].clue = clue;
      })
    );

    return grid;
  }

  getRow(rowIndex: number): VirtualLine {
    return this.grid[rowIndex].map((x, columnIndex) => ({
      ...x,
      rowIndex,
      columnIndex,
    }));
  }

  getColumn(columnIndex: number): VirtualLine {
    return this.grid.map((row, rowIndex) => ({
      ...row[columnIndex],
      rowIndex,
      columnIndex,
    }));
  }

  getBoxFromRowColumnIndex(rowIndex: number, columnIndex: number): VirtualLine {
    const box: VirtualLine = [];
    const firstRowIndex = rowIndex - (rowIndex % 3);
    const firstColumnIndex = columnIndex - (columnIndex % 3);
    for (let i = firstRowIndex; i < firstRowIndex + 3; i++) {
      for (let j = firstColumnIndex; j < firstColumnIndex + 3; j++) {
        box.push({
          ...this.grid[i][j],
          rowIndex: i,
          columnIndex: j,
        });
      }
    }
    return box;
  }

  getBoxFromBoxIndex(boxIndex: number) {
    const rowIndex = this.boxFirstLineIndex(boxIndex, VirtualLineType.ROW);
    const columnIndex = this.boxFirstLineIndex(boxIndex, VirtualLineType.COLUMN);
    return this.getBoxFromRowColumnIndex(rowIndex, columnIndex);
  }

  getAllRows(): VirtualLine[] {
    return this.grid.map((_, rowIndex) => this.getRow(rowIndex));
  }

  getAllColumns(): VirtualLine[] {
    return this.grid[0].map((_, columnIndex) => this.getColumn(columnIndex));
  }

  getAllBoxes(): VirtualLine[] {
    return Array.from({ length: 9 }, (_, i) => this.getBoxFromBoxIndex(i));
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

  getAllRelatedBoxesInLine(lineType: RowColumn, lineIndex: number): VirtualLine[] {
    const boxes: VirtualLine[] = [];
    for (let i = 0; i < 9; i += 3) {
      lineType === VirtualLineType.ROW
        ? boxes.push(this.getBoxFromRowColumnIndex(lineIndex, i))
        : boxes.push(this.getBoxFromRowColumnIndex(i, lineIndex));
    }
    return boxes;
  }

  getAllRelatedLinesInBox(lineType: RowColumn, boxIndex: number): VirtualLine[] {
    const firstIndex = this.boxFirstLineIndex(boxIndex, lineType);
    const getLine = lineType === VirtualLineType.ROW ? this.getRow.bind(this) : this.getColumn.bind(this);
    return [getLine(firstIndex), getLine(firstIndex + 1), getLine(firstIndex + 2)];
  }

  static isSamePos(c1: CellWithIndex, c2: CellWithIndex): boolean {
    return c1.rowIndex === c2.rowIndex && c1.columnIndex === c2.columnIndex;
  }

  getVirtualLinesIntersections(line1: VirtualLine, line2: VirtualLine): CellWithIndex[] {
    return line1.filter((cell) =>
      line2.some((x) => x.rowIndex === cell.rowIndex && x.columnIndex === cell.columnIndex)
    );
  }

  getAllRelatedCells(cell: CellWithIndex): CellWithIndex[] {
    const row = this.getRow(cell.rowIndex);
    const column = this.getColumn(cell.columnIndex);
    const box = this.getBoxFromRowColumnIndex(cell.rowIndex, cell.columnIndex);
    return [...row, ...column, ...box].filter(
      (x, index, arr) => !Sudoku.isSamePos(x, cell) && arr.findIndex((y) => Sudoku.isSamePos(x, y)) === index
    );
  }

  boxFirstLineIndex(boxIndex: number, type: RowColumn) {
    switch (type) {
      case VirtualLineType.ROW:
        return Math.floor(boxIndex / 3) * 3;
      case VirtualLineType.COLUMN:
        return (boxIndex % 3) * 3;
    }
  }

  getBoxIndex(rowIndex: number, columnIndex: number) {
    return Math.floor(rowIndex / 3) * 3 + Math.floor(columnIndex / 3);
  }

  setCandidates(rowIndex: number, columnIndex: number, candidates: Candidates) {
    this.grid[rowIndex][columnIndex].candidates = { ...candidates };
  }

  setInputValue({ rowIndex, columnIndex, value }: InputValueData, update: boolean) {
    if (this.grid[rowIndex][columnIndex].clue) {
      console.error("Cannot set input value to a cell with a clue");
      return;
    }

    this.grid[rowIndex][columnIndex].inputValue = value;
    delete this.grid[rowIndex][columnIndex].candidates;

    if (update) {
      const { isValid, validateDetail } = this.validatePuzzle("inputValue");
      this.isValid = isValid;
      this.validateDetail = validateDetail;
    }
  }

  setInputValues(data: InputValueData[]) {
    data.forEach((x) => this.setInputValue(x, false));

    const { isValid, validateDetail } = this.validatePuzzle("inputValue");
    this.isValid = isValid;
    this.validateDetail = validateDetail;
  }

  removeInputValue({ rowIndex, columnIndex }: { rowIndex: number; columnIndex: number }, update: boolean) {
    if (this.grid[rowIndex][columnIndex].clue) {
      console.error("Cannot set input value to a cell with a clue");
      return;
    }

    delete this.grid[rowIndex][columnIndex].inputValue;

    if (update) {
      const { isValid, validateDetail } = this.validatePuzzle("inputValue");
      this.isValid = isValid;
      this.validateDetail = validateDetail;
    }
  }

  clearAllCandidates() {
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        delete this.grid[i][j].candidates;
      }
    }
  }

  missingInVirtualLine(virtualLine: VirtualLine): Candidates {
    const missing = candidatesFactory(true);
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
  ): CheckVirtualLineDuplicateResult {
    const duplicatedCells: CellWithIndex[] = [];
    const values = key === "clue" ? virtualLine.map((x) => x.clue) : virtualLine.map((x) => x.clue ?? x.inputValue);
    values.forEach(
      (x, ix, arr) => x && arr.some((y, iy) => ix !== iy && x === y && duplicatedCells.push(virtualLine[ix]))
    );
    const haveDuplicate = duplicatedCells.length > 0;
    return { haveDuplicate, duplicatedCells };
  }

  static removeDuplicatesInputValueData(data: InputValueData[]) {
    return data.filter(
      (cur, index, self) =>
        index ===
        self.findIndex((x) => x.rowIndex === cur.rowIndex && x.columnIndex === cur.columnIndex && x.value === cur.value)
    );
  }

  validatePuzzle(type: Extract<keyof CellWithIndex, "clue" | "inputValue">): {
    isValid: boolean;
    validateDetail: ValidateDetail;
  } {
    const allRows = this.getAllRows();
    const allColumns = this.getAllColumns();
    const allBoxes = this.getAllBoxes();

    const rowDetail = allRows.map((x) => this.checkVirtualLineDuplicate(x, type));
    const columnDetail = allColumns.map((x) => this.checkVirtualLineDuplicate(x, type));
    const boxDetail = allBoxes.map((x) => this.checkVirtualLineDuplicate(x, type));
    const validateDetail = {
      [VirtualLineType.ROW]: rowDetail,
      [VirtualLineType.COLUMN]: columnDetail,
      [VirtualLineType.BOX]: boxDetail,
    };
    const isValid =
      !rowDetail.some((x) => x.haveDuplicate) &&
      !columnDetail.some((x) => x.haveDuplicate) &&
      !boxDetail.some((x) => x.haveDuplicate);

    return { isValid, validateDetail };
  }

  get solved(): boolean {
    const { isValid, validateDetail } = this.validatePuzzle("inputValue");
    this.isValid = isValid;
    this.validateDetail = validateDetail;
    return this.isValid && this.grid.every((row) => row.every((cell) => cell.clue || cell.inputValue));
  }
}
