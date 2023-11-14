import Sudoku from "../Sudoku";
import type { SudokuLine } from "../SudokuLine";
import type { Candidates, InputValueData, Position, SudokuElement } from "../type";

export interface Elimination extends Position {
  elements: SudokuElement[];
}

export interface Highlight {
  position: Position;
  candidates: Candidates;
  isSecondaryPosition?: boolean;
}

export interface EliminationData {
  eliminations: Elimination[];
  relatedLines: SudokuLine[];
  highlights: Highlight[];
}

export default abstract class EliminationStrategy {
  public static removalsFromEliminationData(data: EliminationData[]): InputValueData[] {
    const flattedEliminations = data.flatMap((x) => x.eliminations);
    const result: InputValueData[] = flattedEliminations.flatMap(({ rowIndex, columnIndex, elements }) =>
      elements.map((element) => ({ rowIndex, columnIndex, value: element }))
    );
    return Sudoku.removeDuplicatedInputValueData(result);
  }

  public abstract canEliminate(sudoku: Sudoku): EliminationData[];
}

export enum EliminationStrategyType {
  LOCKED_CANDIDATES = "LOCKED_CANDIDATES",
  NAKED_PAIRS = "NAKED_PAIRS",
  NAKED_TRIPLETS = "NAKED_TRIPLETS",
  NAKED_QUADS = "NAKED_QUADS",
  HIDDEN_PAIRS = "HIDDEN_PAIRS",
  HIDDEN_TRIPLETS = "HIDDEN_TRIPLETS",
  HIDDEN_QUADS = "HIDDEN_QUADS",
  X_WING = "X_WING",
  Y_WING = "Y_WING",
}
