import { expect, describe, it } from "vitest";
import SudokuSolver from "../../src/Sudoku/SudokuSolver";
import TU from "../utils";
import { VirtualLineType } from "../../src/Sudoku/type";
import type {
  Pincer,
  YWingResult,
  InputClues,
  InputValueData,
  SudokuElement,
  CandidateCellWithIndex,
} from "../../src/Sudoku/type";

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

const cf = TU.cellWithIndexFactory;
const pf = TU.pincerFactory;

describe("sudoku solver", () => {
  it("cellWithTwoCandidatesAndOnlyOneIsAorB", () => {
    const fn = SudokuSolver.cellWithTwoCandidatesAndOnlyOneIsAorB;

    expect(fn(cf(0, 0, { clue: "3" }), "1", "2")).toBe(null);
    expect(fn(cf(0, 0, { inputValue: "3" }), "1", "2")).toBe(null);
    expect(fn(cf(0, 0, { candidates: ["1", "2", "3", "4", "5", "6", "7", "8", "9"] }), "1", "2")).toBe(null);
    expect(fn(cf(0, 0, { candidates: ["3", "4", "5"] }), "1", "2")).toBe(null);
    expect(fn(cf(0, 0, { candidates: ["1", "2"] }), "1", "2")).toBe(null);
    expect(fn(cf(0, 0, { candidates: ["1", "3"] }), "1", "2")).toStrictEqual(
      TU.pincerFactory(cf(0, 0, { candidates: ["1", "3"] }), "1", "3")
    );
    expect(fn(cf(0, 0, { candidates: ["2", "3"] }), "1", "2")).toStrictEqual(
      TU.pincerFactory(cf(0, 0, { candidates: ["2", "3"] }), "2", "3")
    );
    expect(fn(cf(0, 0, { candidates: ["5", "7"] }), "4", "5")).toStrictEqual(
      TU.pincerFactory(cf(0, 0, { candidates: ["5", "7"] }), "5", "7")
    );
    expect(fn(cf(0, 0, { candidates: ["4", "7"] }), "4", "5")).toStrictEqual(
      TU.pincerFactory(cf(0, 0, { candidates: ["4", "7"] }), "4", "7")
    );
  });

  it("possiblePincersFromLine", () => {
    const fn = SudokuSolver.possiblePincersFromLine;

    const pincer = cf(2, 5, { candidates: ["1", "3"] }) as CandidateCellWithIndex;

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

    const row0 = TU.virtualLineFactory(candidatesArr, { type: VirtualLineType.ROW, lineIndex: 0 });
    expect(fn(row0, pincer)).toStrictEqual([]);

    const row2 = TU.virtualLineFactory(candidatesArr, { type: VirtualLineType.ROW, lineIndex: 2 });
    expect(fn(row2, pincer)).toStrictEqual([
      TU.pincerFactory(cf(2, 0, { candidates: candidatesArr[0] }), "1", "4"),
      TU.pincerFactory(cf(2, 4, { candidates: candidatesArr[4] }), "3", "4"),
    ]);

    const column0 = TU.virtualLineFactory(candidatesArr, { type: VirtualLineType.COLUMN, lineIndex: 0 });
    expect(fn(column0, pincer)).toStrictEqual([]);

    const column5 = TU.virtualLineFactory(candidatesArr, { type: VirtualLineType.COLUMN, lineIndex: 5 });
    expect(fn(column5, pincer)).toStrictEqual([
      TU.pincerFactory(cf(0, 5, { candidates: candidatesArr[0] }), "1", "4"),
      TU.pincerFactory(cf(4, 5, { candidates: candidatesArr[4] }), "3", "4"),
    ]);

    const box0 = TU.virtualLineFactory(candidatesArr, { type: VirtualLineType.BOX, boxIndex: 0 });
    expect(fn(box0, pincer)).toStrictEqual([]);

    const box1 = TU.virtualLineFactory(candidatesArr, { type: VirtualLineType.BOX, boxIndex: 1 });
    expect(fn(box1, pincer)).toStrictEqual([
      TU.pincerFactory(cf(0, 3, { candidates: candidatesArr[0] }), "1", "4"),
      TU.pincerFactory(cf(1, 4, { candidates: candidatesArr[4] }), "3", "4"),
    ]);
  });

  it("isYWingPattern", () => {
    const fn = SudokuSolver.isYWingPattern;

    // assume pivot 1, 2
    const p0 = TU.pincerFactory(cf(0, 0, { candidates: ["1", "2"] }), "1", "2");
    const p1 = TU.pincerFactory(cf(0, 0, { candidates: ["1", "3"] }), "1", "3");
    expect(fn(p0, p1)).toBe(false); // same position

    const p2 = TU.pincerFactory(cf(2, 3, { candidates: ["1", "3"] }), "1", "3");
    const p3 = TU.pincerFactory(cf(5, 7, { candidates: ["1", "4"] }), "1", "4");
    expect(fn(p2, p3)).toBe(false); // same same

    const p4 = TU.pincerFactory(cf(2, 3, { candidates: ["1", "3"] }), "1", "3");
    const p5 = TU.pincerFactory(cf(5, 7, { candidates: ["2", "4"] }), "2", "4");
    expect(fn(p4, p5)).toBe(false); // diff diff

    const p6 = TU.pincerFactory(cf(2, 3, { candidates: ["1", "3"] }), "1", "3");
    const p7 = TU.pincerFactory(cf(5, 7, { candidates: ["2", "3"] }), "2", "3");
    expect(fn(p6, p7)).toBe(true);
    expect(fn(p7, p6)).toBe(true);

    const p8 = TU.pincerFactory(cf(2, 3, { candidates: ["2", "7"] }), "2", "7");
    const p9 = TU.pincerFactory(cf(5, 7, { candidates: ["1", "7"] }), "1", "7");
    expect(fn(p8, p9)).toBe(true);
    expect(fn(p9, p8)).toBe(true);
  });

  it("cartesianProductWithYWingPattern", () => {
    const fn = SudokuSolver.cartesianProductWithYWingPattern;

    // assume pivot 1, 2 at [2, 2]
    const rowPincers: Pincer[] = [
      TU.pincerFactory(cf(2, 0, { candidates: ["1", "7"] }), "1", "7"),
      TU.pincerFactory(cf(2, 4, { candidates: ["2", "4"] }), "2", "4"),
      TU.pincerFactory(cf(2, 8, { candidates: ["2", "8"] }), "2", "8"),
    ];
    const columnPincers: Pincer[] = [
      TU.pincerFactory(cf(0, 2, { candidates: ["2", "7"] }), "2", "7"),
      TU.pincerFactory(cf(4, 2, { candidates: ["1", "4"] }), "1", "4"),
      TU.pincerFactory(cf(8, 2, { candidates: ["2", "8"] }), "2", "8"),
    ];
    const boxPincers: Pincer[] = [
      TU.pincerFactory(cf(0, 0, { candidates: ["2", "7"] }), "2", "7"),
      TU.pincerFactory(cf(0, 1, { candidates: ["1", "4"] }), "1", "4"),
      TU.pincerFactory(cf(0, 2, { candidates: ["2", "7"] }), "2", "7"),
      TU.pincerFactory(cf(1, 0, { candidates: ["2", "4"] }), "2", "4"),
      TU.pincerFactory(cf(2, 0, { candidates: ["1", "7"] }), "1", "7"),
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

  it("getYWing test 1", () => {
    const s = new SudokuSolver(p0);
    s.setBasicCandidates();
    const result = s.getYWing();
    const expectResult: YWingResult[] = [
      {
        pivot: cf(7, 4, { candidates: ["2", "8"] }),
        pincers: [
          pf(cf(7, 6, { candidates: ["2", "7"] }), "2", "7"),
          pf(cf(3, 4, { candidates: ["7", "8"] }), "8", "7"),
        ],
        elimination: TU.inputValueDataArrFactory([[3, 6, "7"]]),
      },
      {
        pivot: cf(8, 3, { candidates: ["5", "8"] }),
        pincers: [
          pf(cf(2, 3, { candidates: ["2", "5"] }), "5", "2"),
          pf(cf(7, 4, { candidates: ["2", "8"] }), "8", "2"),
        ],
        elimination: TU.inputValueDataArrFactory([
          [2, 4, "2"],
          [1, 4, "2"],
        ]),
      },
    ];

    expect(result).toStrictEqual(expectResult);
  });

  it("getRemovalDueToYWing test 1", () => {
    const s = new SudokuSolver(p0);
    s.setBasicCandidates();
    const result = s.getRemovalDueToYWing();
    const expectResult: InputValueData[] = TU.inputValueDataArrFactory([
      [3, 6, "7"],
      [2, 4, "2"],
      [1, 4, "2"],
    ]);
    expect(result).toStrictEqual(expectResult);
  });

  it("removeCandidatesDueToYWing test 1", () => {
    const s = new SudokuSolver(p0);
    s.setBasicCandidates();
    expect(s.removeCandidatesDueToYWing()).toBe(3);
  });
});
