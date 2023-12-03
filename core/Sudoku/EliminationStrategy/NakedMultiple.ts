import Sudoku from "../Sudoku";
import SudokuSolver from "../SudokuSolver";
import { SudokuLineUtil } from "../SudokuLine";
import CalcUtil from "../../utils/CalcUtil";
import EliminationStrategy, { type Elimination, type EliminationData, type Highlight } from "./EliminationStrategy";
import type { SudokuElement, VirtualLine, VirtualLineType } from "../type";

export default abstract class NakedMultiple extends EliminationStrategy {
  public static nakedMultipleFromVirtualLines(
    virtualLines: VirtualLine[],
    sizeOfCandidate: 3 | 4,
    virtualLineType: VirtualLineType,
  ): EliminationData[] {
    const result: EliminationData[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const missingArr = SudokuSolver.getCandidatesArr(Sudoku.missingValuesInVirtualLine(virtualLine));
      if (missingArr.length < sizeOfCandidate) continue;

      const emptyCells = SudokuSolver.candidateCellsFromVirtualLine(virtualLine);
      const combinations = sizeOfCandidate === 3 ? CalcUtil.combinations3(missingArr) : CalcUtil.combinations4(missingArr);

      for (const combination of combinations) {
        const cells = emptyCells.filter((x) => SudokuSolver.isSubset(x.candidates, combination));
        if (cells.length !== sizeOfCandidate) continue;

        const eliminations: Elimination[] = [];
        const restCells = emptyCells.filter((x) => !cells.some((y) => Sudoku.isSamePos(x, y)));
        restCells.forEach(({ rowIndex, columnIndex, candidates }) => {
          if (!candidates) return;
          const elements: SudokuElement[] = combination.filter((x) => candidates[x]);
          if (elements.length === 0) return;
          eliminations.push({ rowIndex, columnIndex, elements });
        });

        if (eliminations.length === 0) continue;
        const relatedLines = [SudokuLineUtil.sudokuLine(virtualLineType, i)];
        const highlights: Highlight[] = cells.map((x) => ({
          position: {
            rowIndex: x.rowIndex,
            columnIndex: x.columnIndex,
          },
          candidates: { ...x.candidates },
        }));

        result.push({ eliminations, relatedLines, highlights });
      }
    }

    return result;
  }
}
