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
import type FillStrategy from "./FillStrategy/FillStrategy";
import type { SolveStats, Candidates, SudokuElement, VirtualLine, CandidateCell } from "./type";

export default class SudokuSolver {
  public sudoku: Sudoku;
  public stats: SolveStats;
  public fillStrategiesMap: Record<FillStrategyType, FillStrategy> = {
    [FillStrategyType.UNIQUE_MISSING]: new UniqueMissing(),
    [FillStrategyType.NAKED_SINGLE]: new NakedSingle(),
    [FillStrategyType.HIDDEN_SINGLE]: new HiddenSingle(),
  };
  public eliminationStrategiesMap: Record<EliminationStrategyType, EliminationStrategy> = {
    [EliminationStrategyType.LOCKED_CANDIDATES]: new LockedCandidates(),
    [EliminationStrategyType.NAKED_PAIRS]: new NakedPairs(),
    [EliminationStrategyType.NAKED_TRIPLETS]: new NakedTriplets(),
    [EliminationStrategyType.NAKED_QUADS]: new NakedQuads(),
    [EliminationStrategyType.HIDDEN_PAIRS]: new HiddenPairs(),
    [EliminationStrategyType.HIDDEN_TRIPLETS]: new HiddenTriplets(),
    [EliminationStrategyType.HIDDEN_QUADS]: new HiddenQuads(),
    [EliminationStrategyType.X_WING]: new XWing(),
    [EliminationStrategyType.Y_WING]: new YWing(),
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
    this.stats = SudokuSolver.statsTemplate();
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

  static statsTemplate() {
    return {
      inputCount: {
        uniqueMissing: 0,
        nakedSingle: 0,
        hiddenSingle: 0,
      },
      eliminationCount: {
        lockedCandidates: 0,
        nakedPairs: 0,
        nakedTriplets: 0,
        nakedQuads: 0,
        hiddenPairs: 0,
        hiddenTriplets: 0,
        hiddenQuads: 0,
        xWing: 0,
        yWing: 0,
        // swordfish: 0,
      },
    };
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
  }

  computeCanFill(fillStrategyType: FillStrategyType): FillInputValueData[] {
    return this.fillStrategiesMap[fillStrategyType].canFill(this.sudoku);
  }

  setValueFromFillStrategy(fillStrategyType: FillStrategyType): number {
    const result = this.computeCanFill(fillStrategyType);
    if (result.length === 0) return 0;
    this.sudoku.setInputValues(result);
    switch (fillStrategyType) {
      case FillStrategyType.UNIQUE_MISSING:
        this.addStatsInputCount$UniqueMissing(result.length);
        break;
      case FillStrategyType.NAKED_SINGLE:
        this.addStatsInputCount$NakedSingle(result.length);
        break;
      case FillStrategyType.HIDDEN_SINGLE:
        this.addStatsInputCount$HiddenSingle(result.length);
        break;
    }
    return result.length;
  }

  computeCanEliminate(eliminationStrategy: EliminationStrategyType): EliminationData[] {
    return this.eliminationStrategiesMap[eliminationStrategy].canEliminate(this.sudoku);
  }

  removeCandidatesFromEliminationStrategy(eliminationStrategy: EliminationStrategyType): number {
    const eliminationData = this.computeCanEliminate(eliminationStrategy);
    const removals = EliminationStrategy.removalsFromEliminationData(eliminationData);
    const count = this.sudoku.removeElementInCandidates(removals);
    switch (eliminationStrategy) {
      case EliminationStrategyType.LOCKED_CANDIDATES:
        this.addStatsEliminationCount$LockedCandidates(count);
        break;
      case EliminationStrategyType.NAKED_PAIRS:
        this.addStatsEliminationCount$NakedPairs(count);
        break;
      case EliminationStrategyType.NAKED_TRIPLETS:
        this.addStatsEliminationCount$NakedTriplets(count);
        break;
      case EliminationStrategyType.NAKED_QUADS:
        this.addStatsEliminationCount$NakedQuads(count);
        break;
      case EliminationStrategyType.HIDDEN_PAIRS:
        this.addStatsEliminationCount$HiddenPairs(count);
        break;
      case EliminationStrategyType.HIDDEN_TRIPLETS:
        this.addStatsEliminationCount$HiddenTriplets(count);
        break;
      case EliminationStrategyType.HIDDEN_QUADS:
        this.addStatsEliminationCount$HiddenQuads(count);
        break;
      case EliminationStrategyType.X_WING:
        this.addStatsEliminationCount$XWing(count);
        break;
      case EliminationStrategyType.Y_WING:
        this.addStatsEliminationCount$YWing(count);
        break;
    }
    return count;
  }

  resetStats(): void {
    this.stats = SudokuSolver.statsTemplate();
  }

  addStatsInputCount$UniqueMissing(increment: number): void {
    this.stats.inputCount.uniqueMissing += increment;
  }

  addStatsInputCount$NakedSingle(increment: number): void {
    this.stats.inputCount.nakedSingle += increment;
  }

  addStatsInputCount$HiddenSingle(increment: number): void {
    this.stats.inputCount.hiddenSingle += increment;
  }

  addStatsEliminationCount$LockedCandidates(increment: number): void {
    this.stats.eliminationCount.lockedCandidates += increment;
  }

  addStatsEliminationCount$NakedPairs(increment: number): void {
    this.stats.eliminationCount.nakedPairs += increment;
  }

  addStatsEliminationCount$NakedTriplets(increment: number): void {
    this.stats.eliminationCount.nakedTriplets += increment;
  }

  addStatsEliminationCount$NakedQuads(increment: number): void {
    this.stats.eliminationCount.nakedQuads += increment;
  }

  addStatsEliminationCount$HiddenPairs(increment: number): void {
    this.stats.eliminationCount.hiddenPairs += increment;
  }

  addStatsEliminationCount$HiddenTriplets(increment: number): void {
    this.stats.eliminationCount.hiddenTriplets += increment;
  }

  addStatsEliminationCount$HiddenQuads(increment: number): void {
    this.stats.eliminationCount.hiddenQuads += increment;
  }

  addStatsEliminationCount$XWing(increment: number): void {
    this.stats.eliminationCount.xWing += increment;
  }

  addStatsEliminationCount$YWing(increment: number): void {
    this.stats.eliminationCount.yWing += increment;
  }

  // addStatsEliminationCount$Swordfish(increment: number): void {
  //   this.stats.eliminationCount.swordfish += increment;
  // }

  trySolveByCandidates(): boolean {
    if (this.setValueFromFillStrategy(FillStrategyType.NAKED_SINGLE)) return true;
    if (this.setValueFromFillStrategy(FillStrategyType.HIDDEN_SINGLE)) return true;

    return false;
  }

  trySolve(): boolean {
    if (this.setValueFromFillStrategy(FillStrategyType.UNIQUE_MISSING)) return this.trySolve();

    this.setBasicCandidates();
    if (this.trySolveByCandidates()) return this.trySolve();

    for (const x of this.enabledEliminationStrategies) {
      if (this.removeCandidatesFromEliminationStrategy(x) && this.trySolveByCandidates()) return this.trySolve();
    }

    return this.sudoku.solved;
  }
}
