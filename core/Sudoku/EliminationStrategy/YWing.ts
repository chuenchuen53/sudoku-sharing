import Sudoku from "../Sudoku";
import SudokuSolver from "../SudokuSolver";
import CalcUtil from "../../utils/CalcUtil";
import EliminationStrategy, { type Elimination, type EliminationData, type Highlight } from "./EliminationStrategy";
import type { CandidateCell, Cell, Pincer, SudokuElement, VirtualLine } from "../type";

export default class YWing extends EliminationStrategy {
  private static readonly instance = new YWing();

  public static getInstance(): YWing {
    return YWing.instance;
  }

  public static yWingFromSudoku(sudoku: Sudoku): EliminationData[] {
    const result: EliminationData[] = [];
    const cellsWithTwoCandidates = sudoku
      .getAllRows()
      .map((row) =>
        row.map((cell) => (cell.candidates && SudokuSolver.numberOfCandidates(cell.candidates) === 2 ? (cell as CandidateCell) : undefined)),
      );

    for (let i = 0; i < cellsWithTwoCandidates.length; i++) {
      for (let j = 0; j < cellsWithTwoCandidates[i].length; j++) {
        const pivot = cellsWithTwoCandidates[i][j];
        if (!pivot) continue;

        const possibleRowPincers = YWing.possiblePincersFromLine(sudoku.getRow(i), pivot);
        const possibleColumnPincers = YWing.possiblePincersFromLine(sudoku.getColumn(j), pivot);
        const possibleBoxPincers = YWing.possiblePincersFromLine(sudoku.getBoxFromRowColumnIndex(i, j), pivot);

        const rowColumnProduct = YWing.cartesianProductWithYWingPattern(possibleRowPincers, possibleColumnPincers);
        const rowBoxProduct = YWing.cartesianProductWithYWingPattern(possibleRowPincers, possibleBoxPincers);
        const columnBoxProduct = YWing.cartesianProductWithYWingPattern(possibleColumnPincers, possibleBoxPincers);

        const validatePincerPairs = [...rowColumnProduct, ...rowBoxProduct, ...columnBoxProduct];
        validatePincerPairs.forEach((x) => {
          const pincers = x;
          const eliminations: Elimination[] = [];

          const p1Related = sudoku.getAllRelatedCells(pincers[0]);
          const p2Related = sudoku.getAllRelatedCells(pincers[1]);
          const intersection = Sudoku.virtualLinesIntersections(p1Related, p2Related).filter((x) => !Sudoku.isSamePos(x, pivot));
          intersection.forEach(({ rowIndex, columnIndex, candidates }) => {
            if (candidates?.[pincers[0].diff]) eliminations.push({ rowIndex, columnIndex, elements: [pincers[0].diff] });
          });

          if (eliminations.length === 0) return;
          const highlights: Highlight[] = [
            {
              position: { rowIndex: pivot.rowIndex, columnIndex: pivot.columnIndex },
              candidates: { ...pivot.candidates },
            },
            {
              position: { rowIndex: pincers[0].rowIndex, columnIndex: pincers[0].columnIndex },
              candidates: Sudoku.candidatesFactory(true, [pincers[0].same]),
              isSecondaryPosition: true,
            },
            {
              position: { rowIndex: pincers[1].rowIndex, columnIndex: pincers[1].columnIndex },
              candidates: Sudoku.candidatesFactory(true, [pincers[1].same]),
              isSecondaryPosition: true,
            },
          ];

          result.push({ eliminations, relatedLines: [], highlights });
        });
      }
    }

    return result;
  }

  static cellWithTwoCandidatesAndOnlyOneIsAorB(cell: Cell, a: SudokuElement, b: SudokuElement): null | Pincer {
    if (!cell.candidates || SudokuSolver.numberOfCandidates(cell.candidates) !== 2 || !CalcUtil.xor(cell.candidates[a], cell.candidates[b])) {
      return null;
    }

    const same = cell.candidates[a] ? a : b;
    const diff = SudokuSolver.getCandidatesArr(cell.candidates).filter((x) => x !== same)[0];
    return { ...cell, same, diff };
  }

  public static possiblePincersFromLine(line: VirtualLine, pivot: CandidateCell): Pincer[] {
    if (!line.some((x) => Sudoku.isSamePos(x, pivot))) return [];
    const [a, b] = SudokuSolver.getCandidatesArr(pivot.candidates);
    return line.reduce((acc, cur) => {
      if (!Sudoku.isSamePos(cur, pivot)) {
        const pincer = YWing.cellWithTwoCandidatesAndOnlyOneIsAorB(cur, a, b);
        if (pincer) acc.push(pincer);
      }
      return acc;
    }, [] as Pincer[]);
  }

  static isYWingPattern(x: Pincer, y: Pincer) {
    return !Sudoku.isSamePos(x, y) && x.same !== y.same && x.diff === y.diff;
  }

  static cartesianProductWithYWingPattern(a: Pincer[], b: Pincer[]): Pincer[][] {
    return CalcUtil.cartesianProduct(a, b).filter(([x, y]) => YWing.isYWingPattern(x, y));
  }

  private constructor() {
    super();
  }

  public override canEliminate(sudoku: Sudoku): EliminationData[] {
    return YWing.yWingFromSudoku(sudoku);
  }
}
