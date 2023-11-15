import { expect, describe, it } from "vitest";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import TestUtil from "../TestUtil";
import { VirtualLineType } from "../../src/Sudoku/type";
import type { Pincer, InputClues, InputValueData, SudokuElement, CandidateCell } from "../../src/Sudoku/type";
import Sudoku from "../../src/Sudoku/Sudoku";
import YWing from "../../src/Sudoku/EliminationStrategy/YWing";
import EliminationStrategy, { EliminationStrategyType } from "../../src/Sudoku/EliminationStrategy/EliminationStrategy";

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

const cf = TestUtil.CellFactory;

describe("sudoku solver", () => {
  it("cellWithTwoCandidatesAndOnlyOneIsAorB", () => {
    const fn = YWing.cellWithTwoCandidatesAndOnlyOneIsAorB;

    expect(fn(cf(0, 0, { clue: "3" }), "1", "2")).toBe(null);
    expect(fn(cf(0, 0, { inputValue: "3" }), "1", "2")).toBe(null);
    expect(fn(cf(0, 0, { candidates: ["1", "2", "3", "4", "5", "6", "7", "8", "9"] }), "1", "2")).toBe(null);
    expect(fn(cf(0, 0, { candidates: ["3", "4", "5"] }), "1", "2")).toBe(null);
    expect(fn(cf(0, 0, { candidates: ["1", "2"] }), "1", "2")).toBe(null);
    expect(fn(cf(0, 0, { candidates: ["1", "3"] }), "1", "2")).toStrictEqual(TestUtil.pincerFactory(cf(0, 0, { candidates: ["1", "3"] }), "1", "3"));
    expect(fn(cf(0, 0, { candidates: ["2", "3"] }), "1", "2")).toStrictEqual(TestUtil.pincerFactory(cf(0, 0, { candidates: ["2", "3"] }), "2", "3"));
    expect(fn(cf(0, 0, { candidates: ["5", "7"] }), "4", "5")).toStrictEqual(TestUtil.pincerFactory(cf(0, 0, { candidates: ["5", "7"] }), "5", "7"));
    expect(fn(cf(0, 0, { candidates: ["4", "7"] }), "4", "5")).toStrictEqual(TestUtil.pincerFactory(cf(0, 0, { candidates: ["4", "7"] }), "4", "7"));
  });

  it("possiblePincersFromLine", () => {
    const fn = YWing.possiblePincersFromLine;

    const pincer = cf(2, 5, { candidates: ["1", "3"] }) as CandidateCell;

    const candidatesArr: SudokuElement[][] = [
      ["1", "4"],
      ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      ["1", "4", "5"],
      ["1", "3"],
      ["3", "4"],
      ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
      ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    ];

    const row0 = TestUtil.virtualLineFactory(candidatesArr, { type: VirtualLineType.ROW, lineIndex: 0 });
    expect(fn(row0, pincer)).toStrictEqual([]);

    const row2 = TestUtil.virtualLineFactory(candidatesArr, { type: VirtualLineType.ROW, lineIndex: 2 });
    expect(fn(row2, pincer)).toStrictEqual([
      TestUtil.pincerFactory(cf(2, 0, { candidates: candidatesArr[0] }), "1", "4"),
      TestUtil.pincerFactory(cf(2, 4, { candidates: candidatesArr[4] }), "3", "4"),
    ]);

    const column0 = TestUtil.virtualLineFactory(candidatesArr, { type: VirtualLineType.COLUMN, lineIndex: 0 });
    expect(fn(column0, pincer)).toStrictEqual([]);

    const column5 = TestUtil.virtualLineFactory(candidatesArr, { type: VirtualLineType.COLUMN, lineIndex: 5 });
    expect(fn(column5, pincer)).toStrictEqual([
      TestUtil.pincerFactory(cf(0, 5, { candidates: candidatesArr[0] }), "1", "4"),
      TestUtil.pincerFactory(cf(4, 5, { candidates: candidatesArr[4] }), "3", "4"),
    ]);

    const box0 = TestUtil.virtualLineFactory(candidatesArr, { type: VirtualLineType.BOX, boxIndex: 0 });
    expect(fn(box0, pincer)).toStrictEqual([]);

    const box1 = TestUtil.virtualLineFactory(candidatesArr, { type: VirtualLineType.BOX, boxIndex: 1 });
    expect(fn(box1, pincer)).toStrictEqual([
      TestUtil.pincerFactory(cf(0, 3, { candidates: candidatesArr[0] }), "1", "4"),
      TestUtil.pincerFactory(cf(1, 4, { candidates: candidatesArr[4] }), "3", "4"),
    ]);
  });

  it("isYWingPattern", () => {
    const fn = YWing.isYWingPattern;

    // assume pivot 1, 2
    const p0 = TestUtil.pincerFactory(cf(0, 0, { candidates: ["1", "2"] }), "1", "2");
    const p1 = TestUtil.pincerFactory(cf(0, 0, { candidates: ["1", "3"] }), "1", "3");
    expect(fn(p0, p1)).toBe(false); // same position

    const p2 = TestUtil.pincerFactory(cf(2, 3, { candidates: ["1", "3"] }), "1", "3");
    const p3 = TestUtil.pincerFactory(cf(5, 7, { candidates: ["1", "4"] }), "1", "4");
    expect(fn(p2, p3)).toBe(false); // same same

    const p4 = TestUtil.pincerFactory(cf(2, 3, { candidates: ["1", "3"] }), "1", "3");
    const p5 = TestUtil.pincerFactory(cf(5, 7, { candidates: ["2", "4"] }), "2", "4");
    expect(fn(p4, p5)).toBe(false); // diff diff

    const p6 = TestUtil.pincerFactory(cf(2, 3, { candidates: ["1", "3"] }), "1", "3");
    const p7 = TestUtil.pincerFactory(cf(5, 7, { candidates: ["2", "3"] }), "2", "3");
    expect(fn(p6, p7)).toBe(true);
    expect(fn(p7, p6)).toBe(true);

    const p8 = TestUtil.pincerFactory(cf(2, 3, { candidates: ["2", "7"] }), "2", "7");
    const p9 = TestUtil.pincerFactory(cf(5, 7, { candidates: ["1", "7"] }), "1", "7");
    expect(fn(p8, p9)).toBe(true);
    expect(fn(p9, p8)).toBe(true);
  });

  it("cartesianProductWithYWingPattern", () => {
    const fn = YWing.cartesianProductWithYWingPattern;

    // assume pivot 1, 2 at [2, 2]
    const rowPincers: Pincer[] = [
      TestUtil.pincerFactory(cf(2, 0, { candidates: ["1", "7"] }), "1", "7"),
      TestUtil.pincerFactory(cf(2, 4, { candidates: ["2", "4"] }), "2", "4"),
      TestUtil.pincerFactory(cf(2, 8, { candidates: ["2", "8"] }), "2", "8"),
    ];
    const columnPincers: Pincer[] = [
      TestUtil.pincerFactory(cf(0, 2, { candidates: ["2", "7"] }), "2", "7"),
      TestUtil.pincerFactory(cf(4, 2, { candidates: ["1", "4"] }), "1", "4"),
      TestUtil.pincerFactory(cf(8, 2, { candidates: ["2", "8"] }), "2", "8"),
    ];
    const boxPincers: Pincer[] = [
      TestUtil.pincerFactory(cf(0, 0, { candidates: ["2", "7"] }), "2", "7"),
      TestUtil.pincerFactory(cf(0, 1, { candidates: ["1", "4"] }), "1", "4"),
      TestUtil.pincerFactory(cf(0, 2, { candidates: ["2", "7"] }), "2", "7"),
      TestUtil.pincerFactory(cf(1, 0, { candidates: ["2", "4"] }), "2", "4"),
      TestUtil.pincerFactory(cf(2, 0, { candidates: ["1", "7"] }), "1", "7"),
    ];

    const rowColumnResult = fn(rowPincers, columnPincers);
    const rowBoxResult = fn(rowPincers, boxPincers);
    const columnBoxResult = fn(columnPincers, boxPincers);

    const expectRowColumnResult: Pincer[][] = [
      [rowPincers[0], columnPincers[0]],
      [rowPincers[1], columnPincers[1]],
    ];
    const expectRowBoxResult: Pincer[][] = [
      [rowPincers[0], boxPincers[0]],
      [rowPincers[0], boxPincers[2]],
      [rowPincers[1], boxPincers[1]],
    ];
    const expectColumnBoxResult: Pincer[][] = [
      [columnPincers[0], boxPincers[4]],
      [columnPincers[1], boxPincers[3]],
    ];

    expect(rowColumnResult).toStrictEqual(expectRowColumnResult);
    expect(rowBoxResult).toStrictEqual(expectRowBoxResult);
    expect(columnBoxResult).toStrictEqual(expectColumnBoxResult);
  });

  it("yWingFromSudoku test 1", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();
    const result = YWing.yWingFromSudoku(s.sudoku);
    const expectResult: typeof result = [
      {
        eliminations: TestUtil.eliminationArrFactory([[3, 6, ["7"]]]),
        relatedLines: [],
        highlights: [
          {
            position: { rowIndex: 7, columnIndex: 4 },
            candidates: Sudoku.candidatesFactory(true, ["2", "8"]),
          },
          {
            position: { rowIndex: 7, columnIndex: 6 },
            candidates: Sudoku.candidatesFactory(true, ["2"]),
            isSecondaryPosition: true,
          },
          {
            position: { rowIndex: 3, columnIndex: 4 },
            candidates: Sudoku.candidatesFactory(true, ["8"]),
            isSecondaryPosition: true,
          },
        ],
      },
      {
        eliminations: TestUtil.eliminationArrFactory([
          [2, 4, ["2"]],
          [1, 4, ["2"]],
        ]),
        relatedLines: [],
        highlights: [
          {
            position: { rowIndex: 8, columnIndex: 3 },
            candidates: Sudoku.candidatesFactory(true, ["5", "8"]),
          },
          {
            position: { rowIndex: 2, columnIndex: 3 },
            candidates: Sudoku.candidatesFactory(true, ["5"]),
            isSecondaryPosition: true,
          },
          {
            position: { rowIndex: 7, columnIndex: 4 },
            candidates: Sudoku.candidatesFactory(true, ["8"]),
            isSecondaryPosition: true,
          },
        ],
      },
    ];

    expect(result).toStrictEqual(expectResult);
  });

  it("yWing removals test", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();
    const result = EliminationStrategy.removalsFromEliminationData(s.computeCanEliminate(EliminationStrategyType.Y_WING));
    const expectResult: InputValueData[] = TestUtil.inputValueDataArrFactory([
      [3, 6, "7"],
      [2, 4, "2"],
      [1, 4, "2"],
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("removeCandidatesDueToYWing test 1", () => {
    const s = new SudokuSolver(new Sudoku(p0));
    s.setBasicCandidates();
    expect(s.removeCandidatesFromEliminationStrategy(EliminationStrategyType.Y_WING)).toBe(3);
  });
});
