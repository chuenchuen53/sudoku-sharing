import Sudoku from "../Sudoku";
import type { EliminationStep, Candidates, PositionAndValue, Position, SudokuElement } from "../type";
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
  XY_WING = "Y_WING",
}

export default abstract class EliminationStrategy {
  static strategyName(strategy: EliminationStrategyType) {
    return strategy.toLowerCase().replaceAll("_", " ");
  }

  public static removalsFromEliminationData(data: EliminationData[]): PositionAndValue[] {
    const flattedEliminations = data.flatMap((x) => x.eliminations);
    const result: PositionAndValue[] = flattedEliminations.flatMap(({ rowIndex, columnIndex, elements }) =>
      elements.map((element) => ({ rowIndex, columnIndex, value: element })),
    );
    return Sudoku.removeDuplicatedPositionAndValue(result);
  }

  public static generateSingleSteps(step: EliminationStep): EliminationStep[] {
    const strategy = step.elimination.strategy;
    const result: EliminationStep[] = [];
    const initGrid = step.grid;
    const sudoku = Sudoku.sudokuFromGrid(initGrid);

    for (const x of step.elimination.data) {
      const removals = EliminationStrategy.removalsFromEliminationData([x]);
      result.push({
        grid: Sudoku.cloneGrid(sudoku.getGrid()),
        elimination: {
          strategy,
          data: [x],
        },
      });
      if (sudoku.batchRemoveElementInCandidates(removals) === 0) result.pop();
    }

    return result;
  }

  public abstract canEliminate(sudoku: Sudoku): EliminationData[];

  public abstract descriptionOfEliminationData(data: EliminationData): string;
}
