import type { FillInputValueData, FillStrategyType } from "./FillStrategy/type";
import type { EliminationData, EliminationStrategyType } from "./EliminationStrategy/type";

export type SudokuElement = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

export type Candidates = {
  [key in SudokuElement]: boolean;
};

export interface Position {
  rowIndex: number;
  columnIndex: number;
}

export interface Cell extends Position {
  clue?: SudokuElement;
  inputValue?: SudokuElement;
  candidates?: Candidates;
}

export type Row = Cell[];

export type Grid = Row[];

export type VirtualLine = Cell[];

export type CandidateCell = Omit<Cell & { candidates: Candidates }, "clue" | "inputValue">;

export enum VirtualLineType {
  ROW = "ROW",
  COLUMN = "COLUMN",
  BOX = "BOX",
}

export type RowColumn = Exclude<VirtualLineType, VirtualLineType.BOX>;

export interface PositionAndValue {
  rowIndex: number;
  columnIndex: number;
  value: SudokuElement;
}

export interface InputCount {
  uniqueMissing: number;
  nakedSingle: number;
  hiddenSingle: number;
}

export interface EliminationCount {
  lockedCandidates: number;
  nakedPairs: number;
  nakedTriplets: number;
  nakedQuads: number;
  hiddenPairs: number;
  hiddenTriplets: number;
  hiddenQuads: number;
  xWing: number;
  xyWing: number;
  // swordfish: number;
}

export interface SolveStats {
  inputCount: InputCount;
  eliminationCount: EliminationCount;
}

export type SudokuElementWithZero = SudokuElement | "0";
export type InputClues = SudokuElementWithZero[][];

export interface Pincer extends Cell {
  same: SudokuElement;
  diff: SudokuElement;
}

export interface BaseStep {
  grid: Grid;
}

export interface FillCandidatesStep extends BaseStep {
  fillCandidates: true;
}

export interface FillStep extends BaseStep {
  fill: {
    strategy: FillStrategyType;
    data: FillInputValueData[];
    withoutCandidates?: true;
  };
}

export interface EliminationAfterFillStep extends BaseStep {
  afterFill: {
    data: EliminationData;
  };
}

export interface EliminationStep extends BaseStep {
  elimination: {
    strategy: EliminationStrategyType;
    data: EliminationData[];
  };
}

export interface FinalStep extends BaseStep {
  final: true;
}

export type Step = FillCandidatesStep | FillStep | EliminationAfterFillStep | EliminationStep | FinalStep;
