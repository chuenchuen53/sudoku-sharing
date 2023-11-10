import TestUtil from "test/TestUtil";
import { expect, describe, it, vitest } from "vitest";
import Sudoku from "../../src/Sudoku/Sudoku";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import type { InputClues, Candidates, SudokuElement, CandidateCell } from "../../src/Sudoku/type";

const candidatesFactory = Sudoku.candidatesFactory;

const p0: InputClues = [
  ["0", "9", "0", "4", "6", "7", "5", "0", "8"],
  ["7", "0", "0", "0", "0", "0", "0", "0", "0"],
  ["0", "0", "8", "0", "0", "0", "4", "0", "9"],
  ["9", "6", "2", "1", "0", "0", "0", "4", "0"],
  ["8", "1", "0", "0", "0", "3", "0", "2", "0"],
  ["0", "3", "7", "6", "5", "0", "8", "0", "1"],
  ["5", "8", "0", "7", "0", "4", "9", "1", "3"],
  ["1", "0", "0", "3", "0", "0", "0", "0", "0"],
  ["0", "2", "4", "0", "0", "9", "6", "0", "0"],
];

const p1: InputClues = [
  ["2", "0", "0", "0", "0", "0", "8", "6", "0"],
  ["0", "0", "0", "0", "4", "2", "0", "0", "0"],
  ["0", "1", "0", "0", "6", "0", "0", "4", "7"],
  ["3", "4", "5", "0", "2", "0", "0", "0", "1"],
  ["7", "2", "0", "0", "0", "0", "4", "0", "9"],
  ["8", "0", "0", "0", "0", "0", "5", "0", "6"],
  ["0", "0", "2", "0", "3", "0", "0", "0", "0"],
  ["0", "0", "0", "6", "8", "0", "0", "1", "2"],
  ["5", "0", "8", "0", "0", "0", "0", "0", "4"],
];

describe("sudoku solver util method test", () => {
  it("getCombinedMissing", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();

    const arr: [number, number, Candidates][] = [
      [0, 0, candidatesFactory(true, ["2", "3"])],
      [0, 2, candidatesFactory(true, ["1", "3"])],
      [0, 7, candidatesFactory(true, ["3"])],
      [1, 1, candidatesFactory(true, ["4", "5"])],
      [1, 2, candidatesFactory(true, ["1", "3", "5", "6"])],
      [1, 3, candidatesFactory(true, ["2", "5", "8", "9"])],
      [1, 4, candidatesFactory(true, ["1", "2", "3", "8", "9"])],
      [1, 5, candidatesFactory(true, ["1", "2", "5", "8"])],
      [1, 6, candidatesFactory(true, ["1", "2", "3"])],
      [1, 7, candidatesFactory(true, ["3", "6"])],
      [1, 8, candidatesFactory(true, ["2", "6"])],
      [2, 0, candidatesFactory(true, ["2", "3", "6"])],
      [2, 1, candidatesFactory(true, ["5"])],
      [2, 3, candidatesFactory(true, ["2", "5"])],
      [2, 4, candidatesFactory(true, ["1", "2", "3"])],
      [2, 5, candidatesFactory(true, ["1", "2", "5"])],
      [2, 7, candidatesFactory(true, ["3", "6", "7"])],
      [3, 4, candidatesFactory(true, ["7", "8"])],
      [3, 5, candidatesFactory(true, ["8"])],
      [3, 6, candidatesFactory(true, ["3", "7"])],
      [3, 8, candidatesFactory(true, ["5", "7"])],
      [4, 2, candidatesFactory(true, ["5"])],
      [4, 3, candidatesFactory(true, ["9"])],
      [4, 4, candidatesFactory(true, ["4", "7", "9"])],
      [4, 6, candidatesFactory(true, ["7"])],
      [4, 8, candidatesFactory(true, ["5", "6", "7"])],
      [5, 0, candidatesFactory(true, ["4"])],
      [5, 5, candidatesFactory(true, ["2"])],
      [5, 7, candidatesFactory(true, ["9"])],
      [6, 2, candidatesFactory(true, ["6"])],
      [6, 4, candidatesFactory(true, ["2"])],
      [7, 1, candidatesFactory(true, ["7"])],
      [7, 2, candidatesFactory(true, ["6", "9"])],
      [7, 4, candidatesFactory(true, ["2", "8"])],
      [7, 5, candidatesFactory(true, ["2", "5", "6", "8"])],
      [7, 6, candidatesFactory(true, ["2", "7"])],
      [7, 7, candidatesFactory(true, ["5", "7", "8"])],
      [7, 8, candidatesFactory(true, ["2", "4", "5", "7"])],
      [8, 0, candidatesFactory(true, ["3"])],
      [8, 3, candidatesFactory(true, ["5", "8"])],
      [8, 4, candidatesFactory(true, ["1", "8"])],
      [8, 7, candidatesFactory(true, ["5", "7", "8"])],
      [8, 8, candidatesFactory(true, ["5", "7"])],
    ];

    arr.forEach(([r, c, candidates]) => expect(s.sudoku.grid[r][c].candidates).toStrictEqual(candidates));

    const ns = new SudokuSolver(new Sudoku(p0));
    arr.forEach(([r, c, candidates]) => ns.sudoku.setCandidates(r, c, candidates));
    expect(ns.sudoku.grid).toStrictEqual(s.sudoku.grid);
  });

  it("getCombinedMissing", () => {
    const s = new SudokuSolver(new Sudoku(p1));
    s.setBasicCandidates();

    const arr: [number, number, Candidates][] = [
      [0, 1, candidatesFactory(true, ["3", "5", "7", "9"])],
      [0, 2, candidatesFactory(true, ["3", "4", "7", "9"])],
      [0, 3, candidatesFactory(true, ["1", "3", "5", "7", "9"])],
      [0, 4, candidatesFactory(true, ["1", "5", "7", "9"])],
      [0, 5, candidatesFactory(true, ["1", "3", "5", "7", "9"])],
      [0, 8, candidatesFactory(true, ["3", "5"])],
      [1, 0, candidatesFactory(true, ["6", "9"])],
      [1, 1, candidatesFactory(true, ["3", "5", "6", "7", "8", "9"])],
      [1, 2, candidatesFactory(true, ["3", "6", "7", "9"])],
      [1, 3, candidatesFactory(true, ["1", "3", "5", "7", "8", "9"])],
      [1, 6, candidatesFactory(true, ["1", "3", "9"])],
      [1, 7, candidatesFactory(true, ["3", "5", "9"])],
      [1, 8, candidatesFactory(true, ["3", "5"])],
      [2, 0, candidatesFactory(true, ["9"])],
      [2, 2, candidatesFactory(true, ["3", "9"])],
      [2, 3, candidatesFactory(true, ["3", "5", "8", "9"])],
      [2, 5, candidatesFactory(true, ["3", "5", "8", "9"])],
      [2, 6, candidatesFactory(true, ["2", "3", "9"])],
      [3, 3, candidatesFactory(true, ["7", "8", "9"])],
      [3, 5, candidatesFactory(true, ["6", "7", "8", "9"])],
      [3, 6, candidatesFactory(true, ["7"])],
      [3, 7, candidatesFactory(true, ["7", "8"])],
      [4, 2, candidatesFactory(true, ["1", "6"])],
      [4, 3, candidatesFactory(true, ["1", "3", "5", "8"])],
      [4, 4, candidatesFactory(true, ["1", "5"])],
      [4, 5, candidatesFactory(true, ["1", "3", "5", "6", "8"])],
      [4, 7, candidatesFactory(true, ["3", "8"])],
      [5, 1, candidatesFactory(true, ["9"])],
      [5, 2, candidatesFactory(true, ["1", "9"])],
      [5, 3, candidatesFactory(true, ["1", "3", "4", "7", "9"])],
      [5, 4, candidatesFactory(true, ["1", "7", "9"])],
      [5, 5, candidatesFactory(true, ["1", "3", "4", "7", "9"])],
      [5, 7, candidatesFactory(true, ["2", "3", "7"])],
      [6, 0, candidatesFactory(true, ["1", "4", "6", "9"])],
      [6, 1, candidatesFactory(true, ["6", "7", "9"])],
      [6, 3, candidatesFactory(true, ["1", "4", "5", "7", "9"])],
      [6, 5, candidatesFactory(true, ["1", "4", "5", "7", "9"])],
      [6, 6, candidatesFactory(true, ["6", "7", "9"])],
      [6, 7, candidatesFactory(true, ["5", "7", "8", "9"])],
      [6, 8, candidatesFactory(true, ["5", "8"])],
      [7, 0, candidatesFactory(true, ["4", "9"])],
      [7, 1, candidatesFactory(true, ["3", "7", "9"])],
      [7, 2, candidatesFactory(true, ["3", "4", "7", "9"])],
      [7, 5, candidatesFactory(true, ["4", "5", "7", "9"])],
      [7, 6, candidatesFactory(true, ["3", "7", "9"])],
      [8, 1, candidatesFactory(true, ["3", "6", "7", "9"])],
      [8, 3, candidatesFactory(true, ["1", "2", "7", "9"])],
      [8, 4, candidatesFactory(true, ["1", "7", "9"])],
      [8, 5, candidatesFactory(true, ["1", "7", "9"])],
      [8, 6, candidatesFactory(true, ["3", "6", "7", "9"])],
      [8, 7, candidatesFactory(true, ["3", "7", "9"])],
    ];

    arr.forEach(([r, c, candidates]) => expect(s.sudoku.grid[r][c].candidates).toStrictEqual(candidates));

    const ns = new SudokuSolver(new Sudoku(p1));
    arr.forEach(([r, c, candidates]) => ns.sudoku.setCandidates(r, c, candidates));
    expect(ns.sudoku.grid).toStrictEqual(s.sudoku.grid);
  });

  it("candidateCellsFromVirtualLine", () => {
    const s = new SudokuSolver(new Sudoku(p0));

    for (let i = 0; i < 9; i++) {
      expect(SudokuSolver.candidateCellsFromVirtualLine(s.sudoku.getRow(i))).toStrictEqual([]);
      expect(SudokuSolver.candidateCellsFromVirtualLine(s.sudoku.getColumn(i))).toStrictEqual([]);
      expect(SudokuSolver.candidateCellsFromVirtualLine(s.sudoku.getBoxFromBoxIndex(i))).toStrictEqual([]);
    }

    s.sudoku.setCandidates(0, 0, candidatesFactory(true, ["1", "2", "3"]));

    const c00 = TestUtil.CellFactory(0, 0, { candidates: ["1", "2", "3"] });
    expect(SudokuSolver.candidateCellsFromVirtualLine(s.sudoku.getRow(0))).toStrictEqual([c00]);
    expect(SudokuSolver.candidateCellsFromVirtualLine(s.sudoku.getRow(1))).toStrictEqual([]);
    expect(SudokuSolver.candidateCellsFromVirtualLine(s.sudoku.getColumn(0))).toStrictEqual([c00]);
    expect(SudokuSolver.candidateCellsFromVirtualLine(s.sudoku.getColumn(1))).toStrictEqual([]);
    expect(SudokuSolver.candidateCellsFromVirtualLine(s.sudoku.getBoxFromBoxIndex(0))).toStrictEqual([c00]);
    expect(SudokuSolver.candidateCellsFromVirtualLine(s.sudoku.getBoxFromBoxIndex(1))).toStrictEqual([]);

    s.sudoku.setCandidates(1, 2, candidatesFactory(true, ["4"]));
    const c12 = TestUtil.CellFactory(1, 2, { candidates: ["4"] });
    expect(SudokuSolver.candidateCellsFromVirtualLine(s.sudoku.getRow(1))).toStrictEqual([c12]);
    expect(SudokuSolver.candidateCellsFromVirtualLine(s.sudoku.getColumn(2))).toStrictEqual([c12]);
    expect(SudokuSolver.candidateCellsFromVirtualLine(s.sudoku.getBoxFromBoxIndex(0))).toStrictEqual([c00, c12]);

    s.sudoku.clearAllCandidates();
    s.setBasicCandidates();

    for (let i = 0; i < 9; i++) {
      const rowCount = p0[i].filter((v) => v === "0").length;
      const colCount = p0.map((v) => v[i]).filter((v) => v === "0").length;
      expect(SudokuSolver.candidateCellsFromVirtualLine(s.sudoku.getRow(i)).length).toBe(rowCount);
      expect(SudokuSolver.candidateCellsFromVirtualLine(s.sudoku.getColumn(i)).length).toBe(colCount);
    }

    for (let i = 0; i < 9; i++) {
      const box = s.sudoku.getBoxFromBoxIndex(i);
      let count = 0;
      for (let i = 0; i < 9; i++) {
        if (p0[box[i].rowIndex][box[i].columnIndex] === "0") count++;
      }
      expect(SudokuSolver.candidateCellsFromVirtualLine(box).length).toBe(count);
    }
  });
});
