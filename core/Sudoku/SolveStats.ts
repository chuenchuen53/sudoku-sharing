import { FillStrategyType } from "./FillStrategy/FillStrategy";
import { EliminationStrategyType } from "./EliminationStrategy/EliminationStrategy";

export type FilleStats = Record<FillStrategyType, number>;
export type EliminationStats = Record<EliminationStrategyType, number>;

export interface Stats {
  filled: FilleStats;
  elimination: EliminationStats;
}

export default class SolveStats {
  private stats: Stats = SolveStats.initialStats();

  private static initialStats(): Stats {
    return {
      filled: {
        [FillStrategyType.UNIQUE_MISSING]: 0,
        [FillStrategyType.NAKED_SINGLE]: 0,
        [FillStrategyType.HIDDEN_SINGLE]: 0,
      },
      elimination: {
        [EliminationStrategyType.LOCKED_CANDIDATES]: 0,
        [EliminationStrategyType.NAKED_PAIRS]: 0,
        [EliminationStrategyType.NAKED_TRIPLETS]: 0,
        [EliminationStrategyType.NAKED_QUADS]: 0,
        [EliminationStrategyType.HIDDEN_PAIRS]: 0,
        [EliminationStrategyType.HIDDEN_TRIPLETS]: 0,
        [EliminationStrategyType.HIDDEN_QUADS]: 0,
        [EliminationStrategyType.X_WING]: 0,
        [EliminationStrategyType.XY_WING]: 0,
      },
    };
  }

  public getStats(): Stats {
    return JSON.parse(JSON.stringify(this.stats));
  }

  public reset(): void {
    for (const key in this.stats.filled) {
      this.stats.filled[key as FillStrategyType] = 0;
    }
    for (const key in this.stats.elimination) {
      this.stats.elimination[key as EliminationStrategyType] = 0;
    }
  }

  public addFilled(fillStrategyType: FillStrategyType, increment: number): void {
    this.stats.filled[fillStrategyType] += increment;
  }

  public addElimination(eliminationStrategyType: EliminationStrategyType, increment: number): void {
    this.stats.elimination[eliminationStrategyType] += increment;
  }
}
