export type SudokuIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type SudokuElement = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export type Candidates = {
  [key in SudokuElement]: boolean;
};

export interface Cell {
  clue?: SudokuElement;
  inputValue?: SudokuElement;
  candidates?: Candidates;
}

export type Row = Cell[];

export type Grid = Row[];

export interface CellWithIndex extends Cell {
  rowIndex: number;
  columnIndex: number;
}

export type VirtualLine = CellWithIndex[];

export enum VirtualLineType {
  ROW = "ROW",
  COLUMN = "COLUMN",
  BOX = "BOX",
}

export type RowColumn = Exclude<VirtualLineType, VirtualLineType.BOX>;

export interface InputValueData {
  rowIndex: number;
  columnIndex: number;
  value: SudokuElement;
}

export type ElementMissing = Record<VirtualLineType, Candidates[]>;

export interface Stats {
  uniqueMissing: number;
  nakedSingle: number;
  hiddenSingle: number;
}

export type SudokuElementWithZero = SudokuElement | "0";
export type InputClues = SudokuElementWithZero[][];

export interface CheckVirtualLineDuplicateResult {
  haveDuplicate: boolean;
  duplicatedCells: CellWithIndex[];
}

export type ValidateDetail = Record<VirtualLineType, CheckVirtualLineDuplicateResult[]>;
