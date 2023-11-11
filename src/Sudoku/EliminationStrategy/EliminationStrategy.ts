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
  public abstract canEliminate(sudoku: Sudoku): EliminationData[];

  public static removalsFromEliminationData(data: EliminationData[]): InputValueData[] {
    const flattedEliminations = data.flatMap((x) => x.eliminations);
    const result: InputValueData[] = flattedEliminations.flatMap(({ rowIndex, columnIndex, elements }) =>
      elements.map((element) => ({ rowIndex, columnIndex, value: element }))
    );
    return Sudoku.removeDuplicatedInputValueData(result);
  }
}
