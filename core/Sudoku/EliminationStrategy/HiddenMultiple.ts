import Sudoku from "../Sudoku";
import SudokuSolver from "../SudokuSolver";
import { SudokuLineUtil } from "../SudokuLine";
import CalcUtil from "../../utils/CalcUtil";
import EliminationStrategy, { type Elimination, type EliminationData, type Highlight } from "./EliminationStrategy";
import type { VirtualLine, SudokuElement, VirtualLineType } from "../type";

export default abstract class HiddenMultiple extends EliminationStrategy {
  public static hiddenMultipleFromVirtualLines(
    virtualLines: VirtualLine[],
    sizeOfCandidate: 2 | 3 | 4,
    virtualLineType: VirtualLineType,
  ): EliminationData[] {
    const result: EliminationData[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const missingInVirtualLine = Sudoku.missingValuesInVirtualLine(virtualLine);
      const missingArr = SudokuSolver.getCandidatesArr(missingInVirtualLine);
      if (missingArr.length < sizeOfCandidate) continue;
      const emptyCells = SudokuSolver.candidateCellsFromVirtualLine(virtualLine);

      const combinations: SudokuElement[][] = CalcUtil.combinations(missingArr, sizeOfCandidate);

      for (const combination of combinations) {
        const multiple = emptyCells.filter(({ candidates }) => combination.some((sudokuElement) => candidates[sudokuElement]));

        if (multiple.length !== sizeOfCandidate) continue;
        const eliminations: Elimination[] = [];
        const highlights: Highlight[] = [];

        multiple.forEach(({ rowIndex, columnIndex, candidates }) => {
          const candidatesArr = SudokuSolver.getCandidatesArr(candidates);
          const eliminateElements = candidatesArr.filter((sudokuElement) => !combination.includes(sudokuElement));
          const highlightElements = candidatesArr.filter((sudokuElement) => combination.includes(sudokuElement));

          if (eliminateElements.length) {
            eliminations.push({ rowIndex, columnIndex, elements: eliminateElements });
          }
          if (highlightElements.length) {
            highlights.push({ position: { rowIndex, columnIndex }, candidates: Sudoku.candidatesFactory(true, highlightElements) });
          }
        });

        if (eliminations.length) {
          const relatedLines = [SudokuLineUtil.sudokuLine(virtualLineType, i)];
          result.push({ eliminations, relatedLines, highlights });
        }
      }
    }

    return result;
  }
}
