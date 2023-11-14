import EliminationStrategy from "./EliminationStrategy/EliminationStrategy";
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
import type FillStrategy from "./FillStrategy/FillStrategy";
import type { SolveStats, Candidates, SudokuElement, VirtualLine, CandidateCell } from "./type";

export default class SudokuSolver {
  public sudoku: Sudoku;
  public stats: SolveStats;
  public fillUniqueMissing: FillStrategy = new UniqueMissing();
  public fillNakedSingle: FillStrategy = new NakedSingle();
  public fillHiddenSingle: FillStrategy = new HiddenSingle();
  public lockedCandidates: EliminationStrategy = new LockedCandidates();
  public nakedPairs: EliminationStrategy = new NakedPairs();
  public nakedTriplets: EliminationStrategy = new NakedTriplets();
  public nakedQuads: EliminationStrategy = new NakedQuads();
  public hiddenPairs: EliminationStrategy = new HiddenPairs();
  public hiddenTriplets: EliminationStrategy = new HiddenTriplets();
  public hiddenQuads: EliminationStrategy = new HiddenQuads();
  public xWing: EliminationStrategy = new XWing();
  public yWing: EliminationStrategy = new YWing();

  private eliminationStrategies: (() => unknown)[];

  constructor(sudoku: Sudoku) {
    this.sudoku = sudoku;
    this.stats = SudokuSolver.statsTemplate();
    this.eliminationStrategies = [
      this.removeCandidatesDueToLockedCandidates.bind(this),
      this.removeCandidatesDueToNakedPairs.bind(this),
      this.removeCandidatesDueToHiddenPairs.bind(this),
      this.removeCandidatesDueToXWing.bind(this),
      this.removeCandidatesDueToYWing.bind(this),
      this.removeCandidatesDueToNakedTriplets.bind(this),
      this.removeCandidatesDueToNakedQuads.bind(this),
      this.removeCandidatesDueToHiddenTriplets.bind(this),
      this.removeCandidatesDueToHiddenQuads.bind(this),
    ];
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

  setUniqueMissing(): number {
    const result = this.fillUniqueMissing.canFill(this.sudoku);
    if (result.length === 0) return 0;
    this.sudoku.setInputValues(result);
    this.addStatsInputCount$UniqueMissing(result.length);
    return result.length;
  }

  setNakedSingles(): number {
    const nakedSingles = this.fillNakedSingle.canFill(this.sudoku);
    if (nakedSingles.length === 0) return 0;
    this.sudoku.setInputValues(nakedSingles);
    this.addStatsInputCount$NakedSingle(nakedSingles.length);
    return nakedSingles.length;
  }

  setHiddenSingles(): number {
    const hiddenSingles = this.fillHiddenSingle.canFill(this.sudoku);
    if (hiddenSingles.length === 0) return 0;
    this.sudoku.setInputValues(hiddenSingles);
    this.addStatsInputCount$HiddenSingle(hiddenSingles.length);
    return hiddenSingles.length;
  }

  removeCandidatesDueToLockedCandidates(): number {
    const eliminationData = this.lockedCandidates.canEliminate(this.sudoku);
    const removals = EliminationStrategy.removalsFromEliminationData(eliminationData);
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$LockedCandidates(count);
    return count;
  }

  removeCandidatesDueToNakedPairs(): number {
    const eliminationData = this.nakedPairs.canEliminate(this.sudoku);
    const removals = EliminationStrategy.removalsFromEliminationData(eliminationData);
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$NakedPairs(count);
    return count;
  }

  removeCandidatesDueToNakedTriplets(): number {
    const eliminationData = this.nakedTriplets.canEliminate(this.sudoku);
    const removals = EliminationStrategy.removalsFromEliminationData(eliminationData);
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$NakedTriplets(count);
    return count;
  }

  removeCandidatesDueToNakedQuads(): number {
    const eliminationData = this.nakedQuads.canEliminate(this.sudoku);
    const removals = EliminationStrategy.removalsFromEliminationData(eliminationData);
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$NakedQuads(count);
    return count;
  }

  removeCandidatesDueToHiddenPairs(): number {
    const eliminationData = this.hiddenPairs.canEliminate(this.sudoku);
    const removals = EliminationStrategy.removalsFromEliminationData(eliminationData);
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$HiddenPairs(count);
    return count;
  }

  removeCandidatesDueToHiddenTriplets(): number {
    const eliminationData = this.hiddenTriplets.canEliminate(this.sudoku);
    const removals = EliminationStrategy.removalsFromEliminationData(eliminationData);
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$HiddenTriplets(count);
    return count;
  }

  removeCandidatesDueToHiddenQuads(): number {
    const eliminationData = this.hiddenQuads.canEliminate(this.sudoku);
    const removals = EliminationStrategy.removalsFromEliminationData(eliminationData);
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$HiddenQuads(count);
    return count;
  }

  removeCandidatesDueToXWing(): number {
    const eliminationData = this.xWing.canEliminate(this.sudoku);
    const removals = EliminationStrategy.removalsFromEliminationData(eliminationData);
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$XWing(count);
    return count;
  }

  removeCandidatesDueToYWing(): number {
    const eliminationData = this.yWing.canEliminate(this.sudoku);
    const removals = EliminationStrategy.removalsFromEliminationData(eliminationData);
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$YWing(count);
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
    if (this.setNakedSingles()) return true;
    if (this.setHiddenSingles()) return true;

    return false;
  }

  trySolve(): boolean {
    if (this.setUniqueMissing()) return this.trySolve();

    this.setBasicCandidates();
    if (this.trySolveByCandidates()) return this.trySolve();

    for (let i = 0; i < this.eliminationStrategies.length; i++) {
      if (this.eliminationStrategies[i]() && this.trySolveByCandidates()) return this.trySolve();
    }

    return this.sudoku.solved;
  }
}
