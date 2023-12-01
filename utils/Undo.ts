import type Sudoku from "~/core/Sudoku/Sudoku";
import type { Candidates, SudokuElement, SudokuElementWithZero } from "../core/Sudoku/type";
import ArrUtil from "~/core/utils/ArrUtil";

export enum UndoType {
  FILL = "FILL",
  CANDIDATE = "CANDIDATE",
  OVERWRITE_ALL_CANDIDATES = "OVERWRITE_ALL_CANDIDATES",
}

interface UndoFillItemWithInputValue {
  undoType: UndoType.FILL;
  rowIndex: number;
  columnIndex: number;
  inputValue: SudokuElementWithZero;
}

interface UndoFillItemWithCandidates {
  undoType: UndoType.FILL;
  rowIndex: number;
  columnIndex: number;
  candidates: Candidates;
}

type UndoFillItem = UndoFillItemWithInputValue | UndoFillItemWithCandidates;

interface UndoCandidateItem {
  undoType: UndoType.CANDIDATE;
  rowIndex: number;
  columnIndex: number;
  candidates: Candidates | null;
}

interface UndoOverwriteAllCandidatesItem {
  undoType: UndoType.OVERWRITE_ALL_CANDIDATES;
  overwriteAllCandidates: (Candidates | undefined)[][];
}

type UndoItem = UndoFillItem | UndoCandidateItem | UndoOverwriteAllCandidatesItem;

export class Undo {
  private sudoku: Sudoku;
  private readonly undoStack: UndoItem[] = [];

  public constructor(sudoku: Sudoku) {
    this.sudoku = sudoku;
  }

  public fill(rowIndex: number, columnIndex: number): void {
    const cell = this.sudoku.grid[rowIndex][columnIndex];
    if (cell.inputValue) {
      this.undoStack.push({ undoType: UndoType.FILL, rowIndex, columnIndex, inputValue: cell.inputValue });
    } else if (cell.candidates) {
      this.undoStack.push({ undoType: UndoType.FILL, rowIndex, columnIndex, candidates: { ...cell.candidates } });
    } else {
      this.undoStack.push({ undoType: UndoType.FILL, rowIndex, columnIndex, inputValue: "0" });
    }
  }

  public clear(rowIndex: number, columnIndex: number): void {
    const cell = this.sudoku.grid[rowIndex][columnIndex];
    if (cell.inputValue) {
      this.undoStack.push({ undoType: UndoType.FILL, rowIndex, columnIndex, inputValue: cell.inputValue });
    }
  }

  public addCandidate(rowIndex: number, columnIndex: number, value: SudokuElement): void {
    const cell = this.sudoku.grid[rowIndex][columnIndex];
    if (cell.candidates && !cell.candidates[value]) {
      this.undoStack.push({ undoType: UndoType.CANDIDATE, rowIndex, columnIndex, candidates: { ...cell.candidates } });
    } else {
      this.undoStack.push({ undoType: UndoType.CANDIDATE, rowIndex, columnIndex, candidates: null });
    }
  }

  public removeCandidate(rowIndex: number, columnIndex: number, value: SudokuElement): void {
    const cell = this.sudoku.grid[rowIndex][columnIndex];
    if (cell.candidates && cell.candidates[value]) {
      this.undoStack.push({ undoType: UndoType.CANDIDATE, rowIndex, columnIndex, candidates: { ...cell.candidates } });
    }
  }

  public overwriteAllCandidates(): void {
    const arr = ArrUtil.create2DArray<Candidates | undefined>(9, 9, () => undefined);
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; i++) {
        const candidates = this.sudoku.grid[i][j].candidates;
        if (candidates) {
          arr[i][j] = { ...candidates };
        }
      }
    }
    this.undoStack.push({ undoType: UndoType.OVERWRITE_ALL_CANDIDATES, overwriteAllCandidates: arr });
  }
}
