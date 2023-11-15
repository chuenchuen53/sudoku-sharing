import TestUtil from "../TestUtil";
import { expect, describe, it, vitest } from "vitest";
import Sudoku from "../../core/Sudoku/Sudoku";
import SudokuSolver from "../../core/Sudoku/SudokuSolver";
import type { SudokuElement, CandidateCell } from "../../core/Sudoku/type";

const candidatesFactory = Sudoku.candidatesFactory;

describe("sudoku solver static util method test", () => {
  it("loopCandidates", () => {
    const fn = vitest.fn((e: SudokuElement) => e);

    SudokuSolver.loopCandidates(fn);
    expect(fn).toBeCalledTimes(9);
    expect(fn).nthCalledWith(1, "1");
    expect(fn).nthCalledWith(2, "2");
    expect(fn).nthCalledWith(3, "3");
    expect(fn).nthCalledWith(4, "4");
    expect(fn).nthCalledWith(5, "5");
    expect(fn).nthCalledWith(6, "6");
    expect(fn).nthCalledWith(7, "7");
    expect(fn).nthCalledWith(8, "8");
    expect(fn).nthCalledWith(9, "9");
  });

  it("numberOfCandidates", () => {
    const c1 = candidatesFactory(true, ["1"]);
    const c2 = candidatesFactory(true, ["1", "8"]);
    const c3 = candidatesFactory(true, ["1", "3", "5", "6", "7", "9"]);
    expect(SudokuSolver.numberOfCandidates(c1)).toBe(1);
    expect(SudokuSolver.numberOfCandidates(c2)).toBe(2);
    expect(SudokuSolver.numberOfCandidates(c3)).toBe(6);
  });

  it("getCandidatesArr", () => {
    const c1 = candidatesFactory(true, ["1"]);
    const c2 = candidatesFactory(true, ["1", "8"]);
    const c3 = candidatesFactory(true, ["1", "3", "5", "6", "7", "9"]);
    expect(SudokuSolver.getCandidatesArr(c1)).toStrictEqual(["1"]);
    expect(SudokuSolver.getCandidatesArr(c2)).toStrictEqual(["1", "8"]);
    expect(SudokuSolver.getCandidatesArr(c3)).toStrictEqual(["1", "3", "5", "6", "7", "9"]);
  });

  it("candidateCellsFromVirtualLine", () => {
    const vl = TestUtil.virtualLineFactory([
      ["1", "2", "3"],
      { clue: "4" },
      ["1", "2", "3"],
      { inputValue: "5" },
      ["1", "3"],
      { clue: "7" },
      { inputValue: "8" },
      undefined,
    ]);
    const expectedResult: CandidateCell[] = [
      { rowIndex: 0, columnIndex: 0, candidates: candidatesFactory(true, ["1", "2", "3"]) },
      { rowIndex: 0, columnIndex: 2, candidates: candidatesFactory(true, ["1", "2", "3"]) },
      { rowIndex: 0, columnIndex: 4, candidates: candidatesFactory(true, ["1", "3"]) },
    ];
    expect(SudokuSolver.candidateCellsFromVirtualLine(vl)).toStrictEqual(expectedResult);
  });

  it("isSubset", () => {
    const superset: SudokuElement[] = ["1", "3", "5", "7"];
    expect(SudokuSolver.isSubset(candidatesFactory(true, ["1"]), superset)).toBe(true);
    expect(SudokuSolver.isSubset(candidatesFactory(true, ["5"]), superset)).toBe(true);
    expect(SudokuSolver.isSubset(candidatesFactory(true, ["1", "5"]), superset)).toBe(true);
    expect(SudokuSolver.isSubset(candidatesFactory(true, ["1", "5", "7"]), superset)).toBe(true);
    expect(SudokuSolver.isSubset(candidatesFactory(true, ["2"]), superset)).toBe(false);
    expect(SudokuSolver.isSubset(candidatesFactory(true, ["4", "6"]), superset)).toBe(false);
  });

  it("sameCandidates", () => {
    const c1 = candidatesFactory(true, ["1"]);
    const c2 = candidatesFactory(true, ["1", "8"]);
    const c3 = candidatesFactory(true, ["1", "3", "5", "6", "7", "9"]);

    const c1Clone = candidatesFactory(true, ["1"]);
    const c2Clone = candidatesFactory(true, ["1", "8"]);
    const c3Clone = candidatesFactory(true, ["1", "3", "5", "6", "7", "9"]);

    expect(SudokuSolver.sameCandidates(c1, c1Clone)).toBe(true);
    expect(SudokuSolver.sameCandidates(c1Clone, c1)).toBe(true);
    expect(SudokuSolver.sameCandidates(c2, c2Clone)).toBe(true);
    expect(SudokuSolver.sameCandidates(c2Clone, c2)).toBe(true);
    expect(SudokuSolver.sameCandidates(c3, c3Clone)).toBe(true);
    expect(SudokuSolver.sameCandidates(c3Clone, c3)).toBe(true);

    expect(SudokuSolver.sameCandidates(c1, c2)).toBe(false);
    expect(SudokuSolver.sameCandidates(c1, c3)).toBe(false);
    expect(SudokuSolver.sameCandidates(c2, c3)).toBe(false);
  });
});
