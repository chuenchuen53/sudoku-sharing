import Sudoku from "../Sudoku";
import { VirtualLineType, type CandidateCell, type RowColumn, type VirtualLine } from "../type";
import { SudokuLineUtil } from "../SudokuLine";
import CalcUtil from "../../utils/CalcUtil";
import SudokuSolver from "../SudokuSolver";
import EliminationStrategy from "./EliminationStrategy";
import type { SudokuLine } from "../SudokuLine";
import type { Elimination, EliminationData, Highlight } from "./type";

export default class XWing extends EliminationStrategy {
  private static readonly instance = new XWing();

  private constructor() {
    super();
  }

  public static getInstance(): XWing {
    return XWing.instance;
  }

  public static xWingFromSudoku(sudoku: Sudoku): EliminationData[] {
    const allRows = sudoku.getAllRows();
    const allColumns = sudoku.getAllColumns();

    const rowResult = XWing.xWingFromVirtualLines(VirtualLineType.ROW, allRows, allColumns);
    const columnResult = XWing.xWingFromVirtualLines(VirtualLineType.COLUMN, allColumns, allRows);
    return [...rowResult, ...columnResult];
  }

  public static xWingFromVirtualLines(
    perspective: RowColumn,
    virtualLines: VirtualLine[],
    perpendicularVirtualLines: VirtualLine[],
  ): EliminationData[] {
    const result: EliminationData[] = [];

    for (const sudokuElement of Sudoku.allElements()) {
      const gridWithElementInCandidate = virtualLines.map((line) => line.map((cell) => (cell.candidates?.[sudokuElement] ? cell : undefined)));

      const lineWithTwoCellsContained = gridWithElementInCandidate.reduce(
        (acc, line) => {
          const cells = line.filter((x): x is CandidateCell => Boolean(x?.candidates));
          if (cells.length === 2) acc.push({ cells });
          return acc;
        },
        [] as { cells: CandidateCell[] }[],
      );

      if (lineWithTwoCellsContained.length < 2) continue;

      const combinations = CalcUtil.combinations2(lineWithTwoCellsContained);
      for (const [line1, line2] of combinations) {
        const isSamePerpendicularPos =
          perspective === VirtualLineType.ROW
            ? line1.cells[0].columnIndex === line2.cells[0].columnIndex && line1.cells[1].columnIndex === line2.cells[1].columnIndex
            : line1.cells[0].rowIndex === line2.cells[0].rowIndex && line1.cells[1].rowIndex === line2.cells[1].rowIndex;

        if (!isSamePerpendicularPos) continue;

        const transverseIndexes =
          perspective === VirtualLineType.ROW
            ? [line1.cells[0].columnIndex, line1.cells[1].columnIndex]
            : [line1.cells[0].rowIndex, line1.cells[1].rowIndex];
        const multiple = [line1.cells[0], line1.cells[1], line2.cells[0], line2.cells[1]];
        const eliminationLines = [perpendicularVirtualLines[transverseIndexes[0]], perpendicularVirtualLines[transverseIndexes[1]]];
        const eliminations: Elimination[] = [];
        eliminationLines.forEach((line) => {
          line.forEach((cell) => {
            if (cell.candidates?.[sudokuElement] && !multiple.some((x) => Sudoku.isSamePos(x, cell))) {
              eliminations.push({
                rowIndex: cell.rowIndex,
                columnIndex: cell.columnIndex,
                elements: [sudokuElement],
              });
            }
          });
        });

        if (eliminations.length === 0) continue;
        const perpendicular = perspective === VirtualLineType.ROW ? VirtualLineType.COLUMN : VirtualLineType.ROW;
        const relatedLines: SudokuLine[] = [
          SudokuLineUtil.sudokuLine(perspective, perspective === VirtualLineType.ROW ? line1.cells[0].rowIndex : line1.cells[0].columnIndex),
          SudokuLineUtil.sudokuLine(perspective, perspective === VirtualLineType.ROW ? line2.cells[1].rowIndex : line2.cells[1].columnIndex),
          SudokuLineUtil.sudokuLine(perpendicular, perpendicular === VirtualLineType.ROW ? line1.cells[0].rowIndex : line1.cells[0].columnIndex),
          SudokuLineUtil.sudokuLine(perpendicular, perpendicular === VirtualLineType.ROW ? line2.cells[1].rowIndex : line2.cells[1].columnIndex),
        ];
        const candidates = Sudoku.candidatesFactory(true, [sudokuElement]);
        const highlights: Highlight[] = [
          {
            position: { rowIndex: line1.cells[0].rowIndex, columnIndex: line1.cells[0].columnIndex },
            candidates,
          },
          {
            position: { rowIndex: line1.cells[1].rowIndex, columnIndex: line1.cells[1].columnIndex },
            candidates,
          },
          {
            position: { rowIndex: line2.cells[0].rowIndex, columnIndex: line2.cells[0].columnIndex },
            candidates,
          },
          {
            position: { rowIndex: line2.cells[1].rowIndex, columnIndex: line2.cells[1].columnIndex },
            candidates,
          },
        ];
        result.push({ eliminations, relatedLines, highlights });
      }
    }

    return result;
  }

  public override canEliminate(sudoku: Sudoku): EliminationData[] {
    return XWing.xWingFromSudoku(sudoku);
  }

  public descriptionOfEliminationData(data: EliminationData): string {
    const { relatedLines, highlights } = data;
    const element = SudokuSolver.getCandidatesArr(highlights[0].candidates)[0];
    const line1 = SudokuLineUtil.lineNameForDisplay(relatedLines[0]);
    const line2 = SudokuLineUtil.lineNameForDisplay(relatedLines[1]);
    const perpendicularLine1 = SudokuLineUtil.lineNameForDisplay(relatedLines[2]);
    const perpendicularLine2 = SudokuLineUtil.lineNameForDisplay(relatedLines[3]);
    const perpendicularLineType = SudokuLineUtil.lineTypeAndIndex(relatedLines[2]).virtualLineType.toLowerCase();
    return `${element} in ${line1}, ${line2} are in same ${perpendicularLineType} (${perpendicularLine1}, ${perpendicularLine2})`;
  }
}
