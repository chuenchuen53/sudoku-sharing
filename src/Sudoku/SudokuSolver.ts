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
import type FillStrategy from "./FillStrategy/FillStrategy";
import type { Candidates, SudokuElement, VirtualLine, CandidateCell } from "./type";

export default class SudokuSolver {
  public sudoku: Sudoku;
  public stats: CSolveStats = new CSolveStats();
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
    this.resetStats();
  }

  resetStats(): void {
    this.stats.reset();
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
    this.stats.addFilled(fillStrategyType, result.length);
    return result.length;
  }

  computeCanEliminate(eliminationStrategy: EliminationStrategyType): EliminationData[] {
    return this.eliminationStrategiesMap[eliminationStrategy].canEliminate(this.sudoku);
  }

  removeCandidatesFromEliminationStrategy(eliminationStrategy: EliminationStrategyType): number {
    const eliminationData = this.computeCanEliminate(eliminationStrategy);
    const removals = EliminationStrategy.removalsFromEliminationData(eliminationData);
    const count = this.sudoku.removeElementInCandidates(removals);
    this.stats.addElimination(eliminationStrategy, count);
    return count;
  }

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
