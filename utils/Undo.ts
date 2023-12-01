import type Sudoku from "~/core/Sudoku/Sudoku";
import type { Candidates, Grid, SudokuElement, SudokuElementWithZero } from "../core/Sudoku/type";
import ArrUtil from "~/core/utils/ArrUtil";

export enum UndoType {
  FILL = "FILL",
  CANDIDATE = "CANDIDATE",
  OVERWRITE_ALL_CANDIDATES = "OVERWRITE_ALL_CANDIDATES",
  REPLACE_ALL_INPUT_VALUES = "REPLACE_ALL_INPUT_VALUES",
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

interface UndoClearAllInputValuesItem {
  undoType: UndoType.REPLACE_ALL_INPUT_VALUES;
  overwriteAllInputValues: SudokuElementWithZero[][];
}

type UndoItem = UndoFillItem | UndoCandidateItem | UndoOverwriteAllCandidatesItem | UndoClearAllInputValuesItem;

export class UndoStack {
  private readonly MAX_SIZE = 100;
  private readonly stack: UndoItem[] = [];

  public get haveUndo(): boolean {
    return this.stack.length > 0;
  }

  public get lastUndo(): UndoItem | undefined {
    return this.stack.pop();
  }

  public push(undoItem: UndoItem): void {
    if (this.stack.length === this.MAX_SIZE) {
      this.stack.shift();
    }
    this.stack.push(undoItem);
  }
}

export class Undo {
  private sudoku: Sudoku;
  private readonly undoStack: UndoStack;

  public constructor(sudoku: Sudoku) {
    this.sudoku = sudoku;
    this.undoStack = new UndoStack();
  }

  public get haveUndo(): boolean {
    return this.undoStack.haveUndo;
  }

  public get lastUndo(): UndoItem | undefined {
    return this.undoStack.lastUndo;
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
      for (let j = 0; j < 9; j++) {
        const candidates = this.sudoku.grid[i][j].candidates;
        if (candidates) {
          arr[i][j] = { ...candidates };
        }
      }
    }
    this.undoStack.push({ undoType: UndoType.OVERWRITE_ALL_CANDIDATES, overwriteAllCandidates: arr });
  }

  public replaceAllInputValues(): void {
    const arr = ArrUtil.create2DArray<SudokuElementWithZero>(9, 9, () => "0");
    this.sudoku.grid.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (cell.inputValue) {
          arr[rowIndex][columnIndex] = cell.inputValue;
        }
      });
    });
    this.undoStack.push({ undoType: UndoType.REPLACE_ALL_INPUT_VALUES, overwriteAllInputValues: arr });
  }
}

export function undoAction(reactiveGrid: Ref<Grid>, sudoku: Sudoku, undoItem: UndoItem) {
  switch (undoItem.undoType) {
    case UndoType.FILL: {
      if ("inputValue" in undoItem) {
        if (undoItem.inputValue === "0") {
          delete reactiveGrid.value[undoItem.rowIndex][undoItem.columnIndex].inputValue;
          sudoku.removeInputValue({ rowIndex: undoItem.rowIndex, columnIndex: undoItem.columnIndex }, true);
        } else {
          reactiveGrid.value[undoItem.rowIndex][undoItem.columnIndex].inputValue = undoItem.inputValue;
          sudoku.setInputValue({ rowIndex: undoItem.rowIndex, columnIndex: undoItem.columnIndex, value: undoItem.inputValue }, true);
        }
      } else {
        if (reactiveGrid.value[undoItem.rowIndex][undoItem.columnIndex].inputValue) {
          delete reactiveGrid.value[undoItem.rowIndex][undoItem.columnIndex].inputValue;
          sudoku.removeInputValue({ rowIndex: undoItem.rowIndex, columnIndex: undoItem.columnIndex }, true);
        }
        reactiveGrid.value[undoItem.rowIndex][undoItem.columnIndex].candidates = undoItem.candidates;
      }
      break;
    }
    case UndoType.CANDIDATE: {
      if (undoItem.candidates === null) {
        delete reactiveGrid.value[undoItem.rowIndex][undoItem.columnIndex].candidates;
        sudoku.removeCandidatesForCell(undoItem.rowIndex, undoItem.columnIndex);
      } else {
        reactiveGrid.value[undoItem.rowIndex][undoItem.columnIndex].candidates = { ...undoItem.candidates };
        sudoku.setCandidates(undoItem.rowIndex, undoItem.columnIndex, undoItem.candidates);
      }
      break;
    }
    case UndoType.OVERWRITE_ALL_CANDIDATES: {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          const candidates = undoItem.overwriteAllCandidates[i][j];
          if (candidates === undefined) {
            delete reactiveGrid.value[i][j].candidates;
            sudoku.removeCandidatesForCell(i, j);
          } else {
            reactiveGrid.value[i][j].candidates = { ...candidates };
            sudoku.setCandidates(i, j, candidates);
          }
        }
      }
      break;
    }
    case UndoType.REPLACE_ALL_INPUT_VALUES: {
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          const inputValue = undoItem.overwriteAllInputValues[i][j];
          if (inputValue === "0") {
            if (reactiveGrid.value[i][j].inputValue) {
              delete reactiveGrid.value[i][j].inputValue;
              sudoku.removeInputValue({ rowIndex: i, columnIndex: j }, false);
            }
          } else {
            reactiveGrid.value[i][j].inputValue = inputValue;
            sudoku.setInputValue({ rowIndex: i, columnIndex: j, value: inputValue }, false);
          }
        }
      }
      sudoku.validatePuzzle();
      break;
    }
  }
}
