import ArrUtil from "../utils/ArrUtil";
import EliminationStrategy, { type EliminationData, EliminationStrategyType } from "./EliminationStrategy/EliminationStrategy";
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
import XYWing from "./EliminationStrategy/XYWing";
import FillStrategy, { type FillInputValueData, FillStrategyType } from "./FillStrategy/FillStrategy";
import SolveStats, { type Stats } from "./SolveStats";
import {
  type CandidateCell,
  type Candidates,
  type EliminationAfterFillStep,
  type EliminationStep,
  type FillCandidatesStep,
  type FillStep,
  type FinalStep,
  type Step,
  type SudokuElement,
  type VirtualLine,
  VirtualLineType,
} from "./type";
import { SudokuLineUtil } from "./SudokuLine";

export default class SudokuSolver {
  private static fillStrategiesBeforeSetCandidatesOrder: FillStrategyType[] = [
    FillStrategyType.UNIQUE_MISSING,
    FillStrategyType.HIDDEN_SINGLE,
    FillStrategyType.NAKED_SINGLE,
  ];
  private static fillStrategiesOrder: FillStrategyType[] = [
    FillStrategyType.UNIQUE_MISSING,
    FillStrategyType.NAKED_SINGLE,
    FillStrategyType.HIDDEN_SINGLE,
  ];
  private static eliminationStrategiesOrder: EliminationStrategyType[] = [
    EliminationStrategyType.LOCKED_CANDIDATES,
    EliminationStrategyType.NAKED_PAIRS,
    EliminationStrategyType.HIDDEN_PAIRS,
    EliminationStrategyType.X_WING,
    EliminationStrategyType.XY_WING,
    EliminationStrategyType.NAKED_TRIPLETS,
    EliminationStrategyType.HIDDEN_TRIPLETS,
    EliminationStrategyType.NAKED_QUADS,
    EliminationStrategyType.HIDDEN_QUADS,
  ];
  private static fillStrategiesMap: Record<FillStrategyType, FillStrategy> = {
    [FillStrategyType.UNIQUE_MISSING]: UniqueMissing.getInstance(),
    [FillStrategyType.NAKED_SINGLE]: NakedSingle.getInstance(),
    [FillStrategyType.HIDDEN_SINGLE]: HiddenSingle.getInstance(),
  };
  private static eliminationStrategiesMap: Record<EliminationStrategyType, EliminationStrategy> = {
    [EliminationStrategyType.LOCKED_CANDIDATES]: LockedCandidates.getInstance(),
    [EliminationStrategyType.NAKED_PAIRS]: NakedPairs.getInstance(),
    [EliminationStrategyType.NAKED_TRIPLETS]: NakedTriplets.getInstance(),
    [EliminationStrategyType.NAKED_QUADS]: NakedQuads.getInstance(),
    [EliminationStrategyType.HIDDEN_PAIRS]: HiddenPairs.getInstance(),
    [EliminationStrategyType.HIDDEN_TRIPLETS]: HiddenTriplets.getInstance(),
    [EliminationStrategyType.HIDDEN_QUADS]: HiddenQuads.getInstance(),
    [EliminationStrategyType.X_WING]: XWing.getInstance(),
    [EliminationStrategyType.XY_WING]: XYWing.getInstance(),
  };

  private readonly sudoku: Sudoku;
  private stats: SolveStats = new SolveStats();
  private steps: Step[] = [];

  constructor(sudoku: Sudoku) {
    this.sudoku = sudoku;
  }

  public static loopCandidates(fn: (sudokuElement: SudokuElement) => void): void {
    const allElements = Sudoku.allElements();
    for (let i = 0; i < allElements.length; i++) {
      fn(allElements[i]);
    }
  }

  public static numberOfCandidates(candidates: Candidates): number {
    let count = 0;
    SudokuSolver.loopCandidates((element) => candidates[element] && count++);
    return count;
  }

  public static getCandidatesArr(candidates: Candidates): SudokuElement[] {
    return Sudoku.allElements().filter((x) => candidates[x]);
  }

  public static candidateCellsFromVirtualLine(virtualLine: VirtualLine): CandidateCell[] {
    return virtualLine.filter((cell): cell is CandidateCell => Boolean(cell.candidates));
  }

  public static isSubset(candidates: Candidates, superset: SudokuElement[]): boolean {
    for (const sudokuElement of Sudoku.allElements()) {
      if (candidates[sudokuElement] && !superset.includes(sudokuElement)) return false;
    }
    return true;
  }

  public static sameCandidates(x: Candidates, y: Candidates): boolean {
    for (const sudokuElement of Sudoku.allElements()) {
      if (x[sudokuElement] !== y[sudokuElement]) return false;
    }
    return true;
  }

  public getSudoku(): Sudoku {
    return this.sudoku;
  }

  public getStats(): Stats {
    return this.stats.getStats();
  }

  public getSteps(): Step[] {
    const result: Step[] = [];
    for (const step of this.steps) {
      if ("elimination" in step) {
        const singleSteps = EliminationStrategy.generateSingleSteps(step);
        result.push(...singleSteps);
      } else if ("fill" in step && step.fill.withoutCandidates) {
        const singleSteps = FillStrategy.generateSingleSteps(step);
        result.push(...singleSteps);
      } else {
        result.push(step);
      }
    }
    return result;
  }

  public computeCanFillWithoutCandidates(fillStrategyType: FillStrategyType): FillInputValueData[] {
    return SudokuSolver.fillStrategiesMap[fillStrategyType].canFillWithoutCandidates(this.sudoku, this.getBasicCandidates());
  }

  public setValueFromFillStrategyWithoutCandidate(fillStrategyType: FillStrategyType): number {
    const result = this.computeCanFillWithoutCandidates(fillStrategyType);
    if (result.length === 0) return 0;
    const fillStep: FillStep = {
      grid: Sudoku.cloneGrid(this.sudoku.getGrid()),
      fill: {
        strategy: fillStrategyType,
        data: result,
        withoutCandidates: true,
      },
    };
    this.steps.push(fillStep);
    this.sudoku.setInputValues(result);
    this.stats.addFilled(fillStrategyType, result.length);

    return result.length;
  }

  public getBasicCandidates(): (Candidates | undefined)[][] {
    const result = ArrUtil.create2DArray<Candidates | undefined>(9, 9, () => undefined);

    const missingInRowArr = this.sudoku.getAllRows().map((x) => Sudoku.missingValuesInVirtualLine(x));
    const missingInColumnArr = this.sudoku.getAllColumns().map((x) => Sudoku.missingValuesInVirtualLine(x));
    const missingInBoxArr = this.sudoku.getAllBoxes().map((x) => Sudoku.missingValuesInVirtualLine(x));

    const grid = this.sudoku.getGrid();
    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j].clue || grid[i][j].inputValue) continue;

        const missingInRow = missingInRowArr[i];
        const missingInColumn = missingInColumnArr[j];
        const missingInBox = missingInBoxArr[Sudoku.getBoxIndex(i, j)];
        const candidatesTemplate = Sudoku.candidatesFactory(false);
        SudokuSolver.loopCandidates((sudokuElement) => {
          if (missingInRow[sudokuElement] && missingInColumn[sudokuElement] && missingInBox[sudokuElement]) {
            candidatesTemplate[sudokuElement] = true;
          }
        });
        result[i][j] = candidatesTemplate;
      }
    }

    return result;
  }

  public setBasicCandidates(): void {
    const result = this.getBasicCandidates();
    const grid = this.sudoku.getGrid();

    for (let i = 0; i < grid.length; i++) {
      for (let j = 0; j < grid[i].length; j++) {
        if (grid[i][j].clue || grid[i][j].inputValue) continue;
        if (!result[i][j]) continue;
        this.sudoku.setCandidates(i, j, result[i][j]!);
      }
    }
    const step: FillCandidatesStep = { grid: Sudoku.cloneGrid(this.sudoku.getGrid()), fillCandidates: true };
    this.steps.push(step);
  }

  public computeCanFill(fillStrategyType: FillStrategyType): FillInputValueData[] {
    return SudokuSolver.fillStrategiesMap[fillStrategyType].canFill(this.sudoku);
  }

  public setValueFromFillStrategy(fillStrategyType: FillStrategyType): number {
    const result = this.computeCanFill(fillStrategyType);
    if (result.length === 0) return 0;
    const fillStep: FillStep = {
      grid: Sudoku.cloneGrid(this.sudoku.getGrid()),
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
        grid: Sudoku.cloneGrid(this.sudoku.getGrid()),
        afterFill: {
          data: {
            eliminations,
            relatedLines: [],
            highlights: result.map((x) => ({ position: { rowIndex: x.rowIndex, columnIndex: x.columnIndex }, candidates: allFalseCandidates })),
          },
        },
      };
      this.steps.push(step);
      this.sudoku.batchRemoveElementInCandidates(removals);
    }
    return result.length;
  }

  public computeCanFillAndDescription(fillStrategyType: FillStrategyType): { data: FillInputValueData; description: string }[] {
    if (fillStrategyType === FillStrategyType.NAKED_SINGLE) {
      const data = this.computeCanFillWithoutCandidates(fillStrategyType);
      if (data.length > 0) {
        return data.map((x) => {
          const row = SudokuLineUtil.sudokuLine(VirtualLineType.ROW, x.rowIndex);
          const column = SudokuLineUtil.sudokuLine(VirtualLineType.COLUMN, x.columnIndex);
          const box = SudokuLineUtil.sudokuLine(VirtualLineType.BOX, Sudoku.getBoxIndex(x.rowIndex, x.columnIndex));
          const secondaryRelatedLines = [row, column, box];
          const description = SudokuSolver.fillStrategiesMap[fillStrategyType].descriptionOfFillInputValueData(x);
          return { data: { ...x, secondaryRelatedLines }, description };
        });
      }
    }

    const data = SudokuSolver.fillStrategiesMap[fillStrategyType].canFill(this.sudoku);
    return data.map((x) => ({ data: x, description: SudokuSolver.fillStrategiesMap[fillStrategyType].descriptionOfFillInputValueData(x) }));
  }

  public computeCanEliminate(eliminationStrategy: EliminationStrategyType): EliminationData[] {
    return SudokuSolver.eliminationStrategiesMap[eliminationStrategy].canEliminate(this.sudoku);
  }

  public removeCandidatesFromEliminationStrategy(eliminationStrategy: EliminationStrategyType): number {
    const eliminationData = this.computeCanEliminate(eliminationStrategy);
    const removals = EliminationStrategy.removalsFromEliminationData(eliminationData);
    if (removals.length === 0) return 0;
    const step: EliminationStep = {
      grid: Sudoku.cloneGrid(this.sudoku.getGrid()),
      elimination: {
        strategy: eliminationStrategy,
        data: eliminationData,
      },
    };
    this.steps.push(step);
    const count = this.sudoku.batchRemoveElementInCandidates(removals);
    this.stats.addElimination(eliminationStrategy, count);
    return count;
  }

  public computeCanEliminateAndDescription(eliminationStrategy: EliminationStrategyType): { data: EliminationData; description: string }[] {
    const data = SudokuSolver.eliminationStrategiesMap[eliminationStrategy].canEliminate(this.sudoku);
    return data.map((x) => ({ data: x, description: SudokuSolver.eliminationStrategiesMap[eliminationStrategy].descriptionOfEliminationData(x) }));
  }

  public tryFillBeforeSetCandidates(): boolean {
    for (const fillStrategyType of SudokuSolver.fillStrategiesBeforeSetCandidatesOrder) {
      if (this.setValueFromFillStrategyWithoutCandidate(fillStrategyType) > 0) return true;
    }
    return false;
  }

  public tryFillAfterSetCandidates(): boolean {
    for (const fillStrategyType of SudokuSolver.fillStrategiesOrder) {
      if (this.setValueFromFillStrategy(fillStrategyType) > 0) return true;
    }
    return false;
  }

  public trySolve(): boolean {
    let haveSetCandidates = false;
    while (!haveSetCandidates) {
      if (this.sudoku.solved) {
        const finalStep: FinalStep = { grid: Sudoku.cloneGrid(this.sudoku.getGrid()), final: true };
        this.steps.push(finalStep);
        return true;
      }

      if (!this.tryFillBeforeSetCandidates()) {
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
        for (const x of SudokuSolver.eliminationStrategiesOrder) {
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

    const solved = this.sudoku.solved;
    if (solved) {
      const finalStep: FinalStep = { grid: Sudoku.cloneGrid(this.sudoku.getGrid()), final: true };
      this.steps.push(finalStep);
    }

    return solved;
  }
}
