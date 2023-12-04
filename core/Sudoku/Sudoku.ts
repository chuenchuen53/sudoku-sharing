import ArrUtil from "../utils/ArrUtil";
import { VirtualLineType } from "./type";
import type { Candidates, Cell, Grid, InputClues, Position, PositionAndValue, RowColumn, SudokuElement, VirtualLine } from "./type";

export default class Sudoku {
  public readonly numOfClues: number;
  private invalidCells: Cell[];
  private readonly grid: Grid;
  private readonly rows: readonly VirtualLine[];
  private readonly columns: readonly VirtualLine[];
  private readonly boxes: readonly VirtualLine[];

  constructor(clues: InputClues) {
    this.grid = Sudoku.createGrid(clues);
    this.numOfClues = this.grid.reduce((acc, row) => acc + row.reduce((acc, cell) => (cell.clue ? acc + 1 : acc), 0), 0);
    this.rows = Object.freeze(Sudoku.rowsFromGrid(this.grid));
    this.columns = Object.freeze(Sudoku.columnsFromGrid(this.grid));
    this.boxes = Object.freeze(Sudoku.boxesFromGrid(this.grid));
    this.invalidCells = Sudoku.invalidCells(this.grid);
  }

  get isValid(): boolean {
    return this.invalidCells.length === 0;
  }

  get solved(): boolean {
    this.invalidCells = Sudoku.invalidCells(this.grid);
    return this.isValid && this.grid.every((row) => row.every((cell) => cell.clue || cell.inputValue));
  }

  public static sudokuFromGrid(grid: Grid): Sudoku {
    const clues: InputClues = grid.map((row) => row.map((cell) => cell.clue ?? "0"));
    const sudoku = new Sudoku(clues);
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        const { inputValue, candidates } = grid[i][j];
        if (inputValue) {
          sudoku.setInputValue({ rowIndex: i, columnIndex: j, value: inputValue }, false);
        } else if (candidates) {
          sudoku.setCandidates(i, j, { ...candidates });
        }
      }
    }
    sudoku.validatePuzzle();
    return sudoku;
  }

  public static rowsFromGrid(grid: Grid): VirtualLine[] {
    return ArrUtil.create2DArray(9, 9, (rowIndex, cellIndex) => grid[rowIndex][cellIndex]);
  }

  public static columnsFromGrid(grid: Grid): VirtualLine[] {
    return ArrUtil.create2DArray(9, 9, (columnIndex, cellIndex) => grid[cellIndex][columnIndex]);
  }

  public static boxesFromGrid(grid: Grid): VirtualLine[] {
    return ArrUtil.create2DArray(9, 9, (boxIndex, cellIndex) => {
      const firstRowIndex = Sudoku.boxFirstLineIndex(boxIndex, VirtualLineType.ROW);
      const firstColumnIndex = Sudoku.boxFirstLineIndex(boxIndex, VirtualLineType.COLUMN);
      return grid[firstRowIndex + Math.floor(cellIndex / 3)][firstColumnIndex + (cellIndex % 3)];
    });
  }

  public static createEmptyGrid(): Grid {
    return ArrUtil.create2DArray<Cell>(9, 9, (rowIndex, columnIndex) => ({ rowIndex, columnIndex }));
  }

  public static invalidCells(grid: Grid): Cell[] {
    const rows: VirtualLine[] = Sudoku.rowsFromGrid(grid);
    const columns: VirtualLine[] = Sudoku.columnsFromGrid(grid);
    const boxes: VirtualLine[] = Sudoku.boxesFromGrid(grid);
    const fn = (vl: VirtualLine[]) => vl.map((x) => Sudoku.duplicatedValueInVirtualLine(x, "inputValue")).flat();

    return Sudoku.removeDuplicatedPositions([...fn(rows), ...fn(columns), ...fn(boxes)]);
  }

  public static boxFirstLineIndex(boxIndex: number, type: RowColumn): number {
    switch (type) {
      case VirtualLineType.ROW:
        return Math.floor(boxIndex / 3) * 3;
      case VirtualLineType.COLUMN:
        return (boxIndex % 3) * 3;
    }
  }

  public static getBoxIndex(rowIndex: number, columnIndex: number): number {
    return Math.floor(rowIndex / 3) * 3 + Math.floor(columnIndex / 3);
  }

  public static getRowColumnIndexFromBoxIndexAndCellIndex(boxIndex: number, cellIndex: number): Position {
    return {
      rowIndex: Math.floor(boxIndex / 3) * 3 + Math.floor(cellIndex / 3),
      columnIndex: (boxIndex % 3) * 3 + (cellIndex % 3),
    };
  }

  public static isSamePos(p1: Position, p2: Position): boolean {
    return p1.rowIndex === p2.rowIndex && p1.columnIndex === p2.columnIndex;
  }

  public static virtualLinesIntersections(line1: VirtualLine, line2: VirtualLine): Cell[] {
    return line1.filter((x) => line2.some((y) => Sudoku.isSamePos(x, y)));
  }

  public static missingValuesInVirtualLine(virtualLine: VirtualLine): Candidates {
    const missing = Sudoku.candidatesFactory(true);
    for (const cell of virtualLine) {
      if (cell.clue) {
        missing[cell.clue] = false;
      } else if (cell.inputValue) {
        missing[cell.inputValue] = false;
      }
    }
    return missing;
  }

  public static removeDuplicatedPositions(positions: Position[]): Position[] {
    return positions.filter((cur, index, self) => index === self.findIndex((x) => Sudoku.isSamePos(x, cur)));
  }

  public static removeDuplicatedPositionAndValue(data: PositionAndValue[]): PositionAndValue[] {
    return ArrUtil.removeDuplicateValue(data, (a, b) => Sudoku.isSamePos(a, b) && a.value === b.value);
  }

  public static candidatesFactory(defaultValue: boolean, elements?: SudokuElement[]): Candidates {
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

  public static duplicatedValueInVirtualLine(virtualLine: VirtualLine, key: Extract<keyof Cell, "clue" | "inputValue">): Cell[] {
    const duplicatedCells: Cell[] = [];
    const values = key === "clue" ? virtualLine.map((x) => x.clue) : virtualLine.map((x) => x.clue ?? x.inputValue);
    values.forEach((x, ix, arr) => x && arr.some((y, iy) => ix !== iy && x === y && duplicatedCells.push(virtualLine[ix])));
    return duplicatedCells;
  }

  public static allElements(): SudokuElement[] {
    return ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  }

  public static cloneGrid(grid: Grid): Grid {
    return ArrUtil.cloneArr(grid);
  }

  private static createGrid(clues: InputClues): Grid {
    if (clues.length !== 9 || clues.some((x) => x.length !== 9)) throw new Error("Invalid input clues");
    const grid: Grid = ArrUtil.create2DArray<Cell>(9, 9, (rowIndex, columnIndex) => ({ rowIndex, columnIndex }));
    clues.forEach((row, i) =>
      row.forEach((clue, j) => {
        if (clue !== "0") grid[i][j].clue = clue;
      }),
    );

    return grid;
  }

  public getInvalidCells(): Cell[] {
    return this.invalidCells;
  }

  public getGrid(): Grid {
    return this.grid;
  }

  public getRow(rowIndex: number): VirtualLine {
    return this.rows[rowIndex];
  }

  public getColumn(columnIndex: number): VirtualLine {
    return this.columns[columnIndex];
  }

  public getBoxFromRowColumnIndex(rowIndex: number, columnIndex: number): VirtualLine {
    return this.boxes[Sudoku.getBoxIndex(rowIndex, columnIndex)];
  }

  public getBoxFromBoxIndex(boxIndex: number): VirtualLine {
    const rowIndex = Sudoku.boxFirstLineIndex(boxIndex, VirtualLineType.ROW);
    const columnIndex = Sudoku.boxFirstLineIndex(boxIndex, VirtualLineType.COLUMN);
    return this.getBoxFromRowColumnIndex(rowIndex, columnIndex);
  }

  public getAllRows(): VirtualLine[] {
    return this.rows.slice();
  }

  public getAllColumns(): VirtualLine[] {
    return this.columns.slice();
  }

  public getAllBoxes(): VirtualLine[] {
    return this.boxes.slice();
  }

  public getAllVirtualLines(type: VirtualLineType): VirtualLine[] {
    switch (type) {
      case VirtualLineType.ROW:
        return this.getAllRows();
      case VirtualLineType.COLUMN:
        return this.getAllColumns();
      case VirtualLineType.BOX:
        return this.getAllBoxes();
    }
  }

  public getAllRelatedBoxesInRowOrColumn(lineType: RowColumn, lineIndex: number): VirtualLine[] {
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

  public getAllRelatedRowsOrColumnsInBox(lineType: RowColumn, boxIndex: number): VirtualLine[] {
    const firstIndex = Sudoku.boxFirstLineIndex(boxIndex, lineType);
    switch (lineType) {
      case VirtualLineType.ROW:
        return [this.getRow(firstIndex), this.getRow(firstIndex + 1), this.getRow(firstIndex + 2)];
      case VirtualLineType.COLUMN:
        return [this.getColumn(firstIndex), this.getColumn(firstIndex + 1), this.getColumn(firstIndex + 2)];
    }
  }

  public getAllRelatedCells(cell: Cell): Cell[] {
    const row = this.getRow(cell.rowIndex).filter((x) => !Sudoku.isSamePos(x, cell));
    const column = this.getColumn(cell.columnIndex).filter((x) => !Sudoku.isSamePos(x, cell));
    const box = this.getBoxFromRowColumnIndex(cell.rowIndex, cell.columnIndex).filter((x) => !Sudoku.isSamePos(x, cell));
    return ArrUtil.removeDuplicateValue([...row, ...column, ...box], (a, b) => Sudoku.isSamePos(a, b));
  }

  public setCandidates(rowIndex: number, columnIndex: number, candidates: Candidates): void {
    this.grid[rowIndex][columnIndex].candidates = { ...candidates };
  }

  public removeCandidatesForCell(rowIndex: number, columnIndex: number): void {
    if (this.grid[rowIndex][columnIndex].candidates) delete this.grid[rowIndex][columnIndex].candidates;
  }

  public setInputValue({ rowIndex, columnIndex, value }: PositionAndValue, updateValidateInfo: boolean): boolean {
    const cell = this.grid[rowIndex][columnIndex];
    if (cell.clue) return false;

    cell.inputValue = value;
    if (cell.candidates) delete cell.candidates;
    if (updateValidateInfo) this.validatePuzzle();

    return true;
  }

  public setInputValues(data: PositionAndValue[]): void {
    const haveChanged: boolean[] = data.map((x) => this.setInputValue(x, false));
    if (haveChanged.filter((x) => x).length) this.validatePuzzle();
  }

  public removeInputValue({ rowIndex, columnIndex }: Position, update: boolean): void {
    if (this.grid[rowIndex][columnIndex].inputValue) delete this.grid[rowIndex][columnIndex].inputValue;
    if (update) this.validatePuzzle();
  }

  public addElementInCandidates(rowIndex: number, columnIndex: number, value: SudokuElement): boolean {
    const cell = this.grid[rowIndex][columnIndex];
    if (cell.clue || cell.inputValue) return false;
    if (cell.candidates) {
      if (!cell.candidates[value]) {
        cell.candidates[value] = true;
        return true;
      } else {
        return false;
      }
    } else {
      cell.candidates = Sudoku.candidatesFactory(true, [value]);
      return true;
    }
  }

  public removeElementInCandidates(rowIndex: number, columnIndex: number, value: SudokuElement): boolean {
    const cell = this.grid[rowIndex][columnIndex];
    if (cell.clue || cell.inputValue) return false;
    if (cell.candidates?.[value]) {
      cell.candidates[value] = false;
      return true;
    }

    return false;
  }

  public batchRemoveElementInCandidates(data: PositionAndValue[]): number {
    let count = 0;

    data.forEach(({ rowIndex, columnIndex, value }) => {
      const cell = this.grid[rowIndex][columnIndex];
      if (cell.candidates?.[value]) {
        cell.candidates[value] = false;
        count++;
      }
    });

    return count;
  }

  public clearAllCandidates(): void {
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        if (this.grid[i][j].candidates) delete this.grid[i][j].candidates;
      }
    }
  }

  public validatePuzzle(): void {
    this.invalidCells = Sudoku.invalidCells(this.grid);
  }
}
