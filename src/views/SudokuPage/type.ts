import type { SudokuElementWithZero, Cell, InputValueData } from "@/Sudoku/type";

export interface Highlight {
  element: SudokuElementWithZero;
  cell: Cell[];
  candidate: InputValueData[];
  invalid: Cell[];
}
