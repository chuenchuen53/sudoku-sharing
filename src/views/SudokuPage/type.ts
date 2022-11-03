import type { SudokuElementWithZero, CellWithIndex, InputValueData } from "@/Sudoku/type";

export interface Highlight {
  element: SudokuElementWithZero;
  cell: CellWithIndex[];
  candidate: InputValueData[];
  invalid: CellWithIndex[];
}
