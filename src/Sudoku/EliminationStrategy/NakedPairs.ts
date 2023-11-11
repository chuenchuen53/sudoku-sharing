import CalcUtil from "@/utils/CalcUtil";
import Sudoku from "../Sudoku";
import SudokuSolver from "../SudokuSolver";
import { VirtualLineType, type VirtualLine } from "../type";
import EliminationStrategy, { type Elimination, type EliminationData, type Highlight } from "./EliminationStrategy";
import { SudokuLineUtil } from "../SudokuLine";

export default class NakedPairs extends EliminationStrategy {
  public canEliminate(sudoku: Sudoku): EliminationData[] {
    return NakedPairs.removalDueToNakedPairs(sudoku);
  }

  public static removalDueToNakedPairs(sudoku: Sudoku): EliminationData[] {
    const rowResult = NakedPairs.nakedPairsFromVirtualLines(sudoku.getAllRows(), VirtualLineType.ROW);
    const columnResult = NakedPairs.nakedPairsFromVirtualLines(sudoku.getAllColumns(), VirtualLineType.COLUMN);
    const boxResult = NakedPairs.nakedPairsFromVirtualLines(sudoku.getAllBoxes(), VirtualLineType.BOX);
    return [...rowResult, ...columnResult, ...boxResult];
  }

  public static nakedPairsFromVirtualLines(virtualLines: VirtualLine[], virtualLineType: VirtualLineType): EliminationData[] {
    const result: EliminationData[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const cellWith2Candidates = SudokuSolver.candidateCellsFromVirtualLine(virtualLine).filter(
        (x) => SudokuSolver.numberOfCandidates(x.candidates) === 2
      );
      if (cellWith2Candidates.length < 2) continue;

      const combinations = CalcUtil.combinations2(cellWith2Candidates);
      const nakedPairs = combinations.filter(([x, y]) => SudokuSolver.sameCandidates(x.candidates, y.candidates));

      nakedPairs.forEach(([x, y]) => {
        const eliminations: Elimination[] = [];
        const [c1, c2] = SudokuSolver.getCandidatesArr(x.candidates);
        const restCells = virtualLine.filter((z) => !(Sudoku.isSamePos(x, z) || Sudoku.isSamePos(y, z)));
        restCells.forEach(({ rowIndex, columnIndex, candidates }) => {
          if (candidates) {
            const elements = [c1, c2].filter((z) => candidates[z]);
            if (elements.length > 0) eliminations.push({ rowIndex, columnIndex, elements });
          }
        });

        if (eliminations.length === 0) return;
        const relatedLines = [SudokuLineUtil.sudokuLine(virtualLineType, i)];
        const highlights: Highlight[] = [
          {
            position: {
              rowIndex: x.rowIndex,
              columnIndex: x.columnIndex,
            },
            candidates: x.candidates,
          },
          {
            position: {
              rowIndex: y.rowIndex,
              columnIndex: y.columnIndex,
            },
            candidates: y.candidates,
          },
        ];

        result.push({ eliminations, relatedLines, highlights });
      });
    }

    return result;
  }
}
