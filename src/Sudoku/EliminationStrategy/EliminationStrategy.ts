import type { SudokuLine } from "../SudokuLine";
import type { Candidates, Position, SudokuElement } from "../type";

export interface Highlight {
  position: Position;
  candidates: Candidates;
  isSecondaryPosition?: boolean;
}

export interface Elimination extends Position {
  elements: SudokuElement[];
}

export interface EliminationData {
  eliminations: Elimination[];
  relatedLines: SudokuLine[];
  highlights: Highlight[];
}

export default abstract class EliminationStrategy {
  abstract canEliminate(): EliminationData;
}
