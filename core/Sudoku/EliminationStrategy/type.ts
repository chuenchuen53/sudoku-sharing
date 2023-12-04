import type { Candidates, Position, SudokuElement } from "../type";
import type { SudokuLine } from "../SudokuLine";

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

export enum EliminationStrategyType {
  LOCKED_CANDIDATES = "LOCKED_CANDIDATES",
  NAKED_PAIRS = "NAKED_PAIRS",
  NAKED_TRIPLETS = "NAKED_TRIPLETS",
  NAKED_QUADS = "NAKED_QUADS",
  HIDDEN_PAIRS = "HIDDEN_PAIRS",
  HIDDEN_TRIPLETS = "HIDDEN_TRIPLETS",
  HIDDEN_QUADS = "HIDDEN_QUADS",
  X_WING = "X_WING",
  XY_WING = "XY_WING",
}
