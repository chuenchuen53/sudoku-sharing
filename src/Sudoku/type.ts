export type SudokuIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type Element = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export type Candidates = {
  [key in Element]: boolean;
};

export interface Cell {
  clue?: Element;
  inputValue?: Element;
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
  value: Element;
}

export type ElementMissing = Record<VirtualLineType, Candidates[]>;

export interface Stats {
  rowUniqueMissing: number;
  columnUniqueMissing: number;
  boxUniqueMissing: number;
  nakedSingles: number;
  hiddenSingles: number;
}

export type InputClues = (Element | "0")[][];
