import Sudoku from "../Sudoku";
import type { EliminationStep, PositionAndValue } from "../type";
import type { EliminationData, EliminationStrategyType } from "./type";

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
