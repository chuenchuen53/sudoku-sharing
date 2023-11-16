import EliminationStrategy, { EliminationStrategyType, type EliminationData } from "./EliminationStrategy/EliminationStrategy";
import HiddenPairs from "./EliminationStrategy/HiddenPairs";
import HiddenQuads from "./EliminationStrategy/HiddenQuads";
import HiddenTriplets from "./EliminationStrategy/HiddenTriplets";
import LockedCandidates from "./EliminationStrategy/LockedCandidates";
import NakedPairs from "./EliminationStrategy/NakedPairs";
import NakedQuads from "./EliminationStrategy/NakedQuads";
import NakedTriplets from "./EliminationStrategy/NakedTriplets";
import XWing from "./EliminationStrategy/XWing";
import HiddenSingle from "./FillStrategy/HiddenSingle";
import NakedSingle from "./FillStrategy/NakedSingle";
import UniqueMissing from "./FillStrategy/UniqueMissing";
import Sudoku from "./Sudoku";
import YWing from "./EliminationStrategy/YWing";
import { FillStrategyType, type FillInputValueData } from "./FillStrategy/FillStrategy";
import CSolveStats from "./SolveStats";
import FillStrategy from "./FillStrategy/FillStrategy";
import type { Candidates, SudokuElement, VirtualLine, CandidateCell, Grid } from "./type";

export interface BaseStep {
  grid: Grid;
}

export interface FillStep extends BaseStep {
  fill: {
    strategy: FillStrategyType;
    data: FillInputValueData[];
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

export type Step = BaseStep | FillStep | EliminationAfterFillStep | EliminationStep;

export default class SudokuSolver {
  public sudoku: Sudoku;
  public stats: CSolveStats = new CSolveStats();
  public steps: Step[] = [];
  public fillStrategiesMap: Record<FillStrategyType, FillStrategy> = {
    [FillStrategyType.UNIQUE_MISSING]: UniqueMissing.getInstance(),
    [FillStrategyType.NAKED_SINGLE]: NakedSingle.getInstance(),
    [FillStrategyType.HIDDEN_SINGLE]: HiddenSingle.getInstance(),
  };
  public eliminationStrategiesMap: Record<EliminationStrategyType, EliminationStrategy> = {
    [EliminationStrategyType.LOCKED_CANDIDATES]: LockedCandidates.getInstance(),
    [EliminationStrategyType.NAKED_PAIRS]: NakedPairs.getInstance(),
    [EliminationStrategyType.NAKED_TRIPLETS]: NakedTriplets.getInstance(),
    [EliminationStrategyType.NAKED_QUADS]: NakedQuads.getInstance(),
    [EliminationStrategyType.HIDDEN_PAIRS]: HiddenPairs.getInstance(),
    [EliminationStrategyType.HIDDEN_TRIPLETS]: HiddenTriplets.getInstance(),
    [EliminationStrategyType.HIDDEN_QUADS]: HiddenQuads.getInstance(),
    [EliminationStrategyType.X_WING]: XWing.getInstance(),
    [EliminationStrategyType.Y_WING]: YWing.getInstance(),
  };
  public enabledEliminationStrategies: EliminationStrategyType[] = [
    EliminationStrategyType.LOCKED_CANDIDATES,
    EliminationStrategyType.NAKED_PAIRS,
    EliminationStrategyType.HIDDEN_PAIRS,
    EliminationStrategyType.X_WING,
    EliminationStrategyType.Y_WING,
    EliminationStrategyType.NAKED_TRIPLETS,
    EliminationStrategyType.HIDDEN_TRIPLETS,
    EliminationStrategyType.NAKED_QUADS,
    EliminationStrategyType.HIDDEN_QUADS,
  ];

  constructor(sudoku: Sudoku) {
    this.sudoku = sudoku;
  }

  static loopCandidates(fn: (sudokuElement: SudokuElement) => void): void {
    const allElements = Sudoku.allElements();
    for (let i = 0; i < allElements.length; i++) {
      fn(allElements[i]);
    }
  }

  static numberOfCandidates(candidates: Candidates): number {
    let count = 0;
    SudokuSolver.loopCandidates((element) => candidates[element] && count++);
    return count;
  }

  static getCandidatesArr(candidates: Candidates): SudokuElement[] {
    const result: SudokuElement[] = [];
    SudokuSolver.loopCandidates((sudokuElement) => candidates[sudokuElement] && result.push(sudokuElement));
    return result;
  }

  static candidateCellsFromVirtualLine(virtualLine: VirtualLine): CandidateCell[] {
    return virtualLine.filter((cell): cell is CandidateCell => Boolean(cell.candidates));
  }

  static isSubset(candidates: Candidates, superset: SudokuElement[]): boolean {
    for (const sudokuElement of Sudoku.allElements()) {
      if (candidates[sudokuElement] && !superset.includes(sudokuElement)) return false;
    }
    return true;
  }

  static sameCandidates(x: Candidates, y: Candidates): boolean {
    for (const sudokuElement of Sudoku.allElements()) {
      if (x[sudokuElement] !== y[sudokuElement]) return false;
    }
    return true;
  }

  replaceSudoku(sudoku: Sudoku): void {
    this.sudoku = sudoku;
    this.resetStatsAndSteps();
  }

  resetStatsAndSteps(): void {
    this.stats.reset();
    this.steps = [];
  }

  setBasicCandidates(): void {
    const missingInRowArr = this.sudoku.getAllRows().map((x) => Sudoku.missingValuesInVirtualLine(x));
    const missingInColumnArr = this.sudoku.getAllColumns().map((x) => Sudoku.missingValuesInVirtualLine(x));
    const missingInBoxArr = this.sudoku.getAllBoxes().map((x) => Sudoku.missingValuesInVirtualLine(x));

    for (let i = 0; i < this.sudoku.grid.length; i++) {
      for (let j = 0; j < this.sudoku.grid[i].length; j++) {
        if (this.sudoku.grid[i][j].clue || this.sudoku.grid[i][j].inputValue) continue;

        const missingInRow = missingInRowArr[i];
        const missingInColumn = missingInColumnArr[j];
        const missingInBox = missingInBoxArr[Sudoku.getBoxIndex(i, j)];
        const candidatesTemplate = Sudoku.candidatesFactory(false);
        SudokuSolver.loopCandidates((sudokuElement) => {
          if (missingInRow[sudokuElement] && missingInColumn[sudokuElement] && missingInBox[sudokuElement]) {
            candidatesTemplate[sudokuElement] = true;
          }
        });
        this.sudoku.setCandidates(i, j, candidatesTemplate);
      }
    }
    const step: BaseStep = { grid: Sudoku.cloneGrid(this.sudoku.grid) };
    this.steps.push(step);
  }

  computeCanFill(fillStrategyType: FillStrategyType): FillInputValueData[] {
    return this.fillStrategiesMap[fillStrategyType].canFill(this.sudoku);
  }

  setValueFromFillStrategy(fillStrategyType: FillStrategyType): number {
    const result = this.computeCanFill(fillStrategyType);
    if (result.length === 0) return 0;
    const fillStep: FillStep = {
      grid: Sudoku.cloneGrid(this.sudoku.grid),
      fill: {
        strategy: fillStrategyType,
        data: result,
      },
    };
    this.steps.push(fillStep);
    this.sudoku.setInputValues(result);
    this.stats.addFilled(fillStrategyType, result.length);
    const { removals, eliminations } = FillStrategy.eliminationAfterFill(this.sudoku, result);
    if (removals.length > 0) {
      const allFalseCandidates = Sudoku.candidatesFactory(false);
      const step: EliminationAfterFillStep = {
        grid: Sudoku.cloneGrid(this.sudoku.grid),
        afterFill: {
          data: {
            eliminations,
            relatedLines: [],
            highlights: result.map((x) => ({ position: { rowIndex: x.rowIndex, columnIndex: x.columnIndex }, candidates: allFalseCandidates })),
          },
        },
      };
      this.steps.push(step);
      this.sudoku.removeElementInCandidates(removals);
    }
    return result.length;
  }

  computeCanEliminate(eliminationStrategy: EliminationStrategyType): EliminationData[] {
    return this.eliminationStrategiesMap[eliminationStrategy].canEliminate(this.sudoku);
  }

  removeCandidatesFromEliminationStrategy(eliminationStrategy: EliminationStrategyType): number {
    const eliminationData = this.computeCanEliminate(eliminationStrategy);
    const removals = EliminationStrategy.removalsFromEliminationData(eliminationData);
    if (removals.length === 0) return 0;
    const step: EliminationStep = {
      grid: Sudoku.cloneGrid(this.sudoku.grid),
      elimination: {
        strategy: eliminationStrategy,
        data: eliminationData,
      },
    };
    this.steps.push(step);
    const count = this.sudoku.removeElementInCandidates(removals);
    this.stats.addElimination(eliminationStrategy, count);
    return count;
  }

  tryFillAfterSetCandidates(): boolean {
    if (this.setValueFromFillStrategy(FillStrategyType.UNIQUE_MISSING)) return true;
    if (this.setValueFromFillStrategy(FillStrategyType.NAKED_SINGLE)) return true;
    if (this.setValueFromFillStrategy(FillStrategyType.HIDDEN_SINGLE)) return true;

    return false;
  }

  trySolve(): boolean {
    let haveSetCandidates = false;
    while (!haveSetCandidates) {
      if (this.setValueFromFillStrategy(FillStrategyType.UNIQUE_MISSING) === 0) {
        this.setBasicCandidates();
        haveSetCandidates = true;
      }
    }

    let stop = false;
    while (!stop) {
      let haveNewFill = this.tryFillAfterSetCandidates();
      if (haveNewFill) continue;

      let haveRemovals = true;
      while (haveRemovals) {
        haveRemovals = false;
        for (const x of this.enabledEliminationStrategies) {
          haveRemovals = haveRemovals || this.removeCandidatesFromEliminationStrategy(x) > 0;
          if (haveRemovals && this.tryFillAfterSetCandidates()) {
            haveNewFill = true;
            haveRemovals = false;
            break;
          }
        }
      }

      if (!haveNewFill) stop = true;
    }

    return this.sudoku.solved;
  }
}
