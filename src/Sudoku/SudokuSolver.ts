import ArrayUtils from "@/utils/ArrayUtil";
import { xor } from "lodash";
import Sudoku from "./Sudoku";
import { candidatesFactory } from "./Sudoku";
import { VirtualLineType } from "./type";
import type {
  Stats,
  Candidates,
  InputClues,
  SudokuElement,
  VirtualLine,
  Grid,
  InputValueData,
  Cell,
  CellWithIndex,
  ElementMissing,
} from "./type";

// todo
// const statsTemplate: () => Stats = () => ({
//   rowUniqueMissing: 0,
//   columnUniqueMissing: 0,
//   boxUniqueMissing: 0,
//   nakedSingles: 0,
//   hiddenSingles: 0,
// });

// const createAllElementsArr = (): SudokuElement[] => ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

// const candidatesFromArr = (arr: SudokuElement[]) => {
//   const candidates = candidatesFactory(false);
//   arr.forEach((x) => (candidates[x] = true));
//   return candidates;
// };

const hiddenCandidatesCount = () => ({
  "1": 0,
  "2": 0,
  "3": 0,
  "4": 0,
  "5": 0,
  "6": 0,
  "7": 0,
  "8": 0,
  "9": 0,
});

export interface UniqueMissing {
  virtualLine: VirtualLine;
  uniqueCandidate: SudokuElement;
  cell: CellWithIndex;
}

export default class SudokuSolver extends Sudoku {
  public elementMissing: ElementMissing;

  constructor(clues: InputClues) {
    super(clues);
    this.elementMissing = this.updateElementMissing();
  }

  getUniqueMissing(type: VirtualLineType): UniqueMissing[] {
    const allVirtualLines = this.getAllVirtualLines(type);
    const missingArr = this.elementMissing[type];
    const result: UniqueMissing[] = [];
    ArrayUtils.zip(allVirtualLines, missingArr).forEach(([virtualLine, missing]) => {
      const uniqueCandidate = SudokuSolver.getUniqueCandidate(missing);
      const cell = virtualLine.find((x) => !x.clue && !x.inputValue)!;
      if (uniqueCandidate) result.push({ virtualLine, uniqueCandidate, cell });
    });
    return result;
  }

  getBasicCandidates(): Grid {
    this.updateElementMissing();
    const missingInRows = this.elementMissing[VirtualLineType.ROW];
    const missingInColumns = this.elementMissing[VirtualLineType.COLUMN];
    const missingInBoxes = this.elementMissing[VirtualLineType.BOX];

    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        if (this.grid[i][j].clue || this.grid[i][j].inputValue) continue;

        const boxIndex = this.getBoxIndex(i, j);
        const missingRow = missingInRows[i];
        const missingColumn = missingInColumns[j];
        const missingBox = missingInBoxes[boxIndex];
        const candidates = candidatesFactory(false);

        for (const key in candidates) {
          const typedKey = key as SudokuElement;
          if (missingRow[typedKey] && missingColumn[typedKey] && missingBox[typedKey]) {
            candidates[typedKey] = true;
          }
        }

        this.setCandidates(i, j, candidates);
      }
    }

    return this.grid;
  }

  getNakedSingles(): InputValueData[] {
    const result: InputValueData[] = [];
    this.loopGrid((rowIndex, columnIndex, cell) => {
      if (cell.clue || cell.inputValue || !cell.candidates) return;
      const entries = Object.entries(cell.candidates) as [SudokuElement, boolean][];
      const candidatesArr = entries.filter(([_, value]) => value);
      if (candidatesArr.length === 1) result.push({ rowIndex, columnIndex, value: candidatesArr[0][0] });
    });
    return result;
  }

  getHiddenSingles(): InputValueData[] {
    const rowResult = SudokuSolver.getHiddenSingleFromVirtualLines(this.getAllRows());
    const columnResult = SudokuSolver.getHiddenSingleFromVirtualLines(this.getAllColumns());
    const boxResult = SudokuSolver.getHiddenSingleFromVirtualLines(this.getAllBoxes());
    return Sudoku.removeDuplicatesInputValueData([...rowResult, ...columnResult, ...boxResult]);
  }

  static numberOfCandidates(candidates: Candidates): number {
    const entries = Object.entries(candidates);
    return entries.reduce((acc, [_, value]) => (value ? acc + 1 : acc), 0);
  }

  static getUniqueCandidate(candidates: Candidates): SudokuElement | null {
    const entries = Object.entries(candidates);
    const candidatesArr = entries.filter(([_, value]) => value) as [SudokuElement, boolean][];
    return candidatesArr.length === 1 ? candidatesArr[0][0] : null;
  }

  static getHiddenSingleFromVirtualLine(virtualLine: VirtualLine): InputValueData[] {
    const result: InputValueData[] = [];
    const candidatesCount = hiddenCandidatesCount();
    virtualLine.forEach((cell) => {
      if (cell.clue || cell.inputValue || !cell.candidates) return;
      Object.entries(cell.candidates).forEach(([key, bool]) => bool && candidatesCount[key as SudokuElement]++);
    });
    Object.entries(candidatesCount).forEach(([key, count]) => {
      if (count !== 1) return;
      const sudokuElement = key as SudokuElement;
      const cell = virtualLine.find((x) => x.candidates && x.candidates[sudokuElement])!;
      if (SudokuSolver.numberOfCandidates(cell.candidates!) === 1) return; // naked single
      result.push({ rowIndex: cell.rowIndex, columnIndex: cell.columnIndex, value: sudokuElement });
    });
    return result;
  }

  static getHiddenSingleFromVirtualLines(virtualLines: VirtualLine[]): InputValueData[] {
    const result: InputValueData[] = [];
    virtualLines.forEach((virtualLine) => {
      const lineResult = SudokuSolver.getHiddenSingleFromVirtualLine(virtualLine);
      result.push(...lineResult);
    });
    return result;
  }

  private updateElementMissing() {
    const fn = (line: VirtualLine[]) => line.map((x) => this.missingInVirtualLine(x));
    this.elementMissing = {
      [VirtualLineType.ROW]: fn(this.getAllRows()),
      [VirtualLineType.COLUMN]: fn(this.getAllColumns()),
      [VirtualLineType.BOX]: fn(this.getAllBoxes()),
    };

    return this.elementMissing;
  }

  private loopGrid(callback: (rowIndex: number, columnIndex: number, cell: Cell, row?: Cell[]) => void): void {
    this.grid.forEach((row, rowIndex) =>
      row.forEach((cell, columnIndex) => {
        callback(rowIndex, columnIndex, cell, row);
      })
    );
  }

  // rowColumnLockInBox(type: "row" | "column", index: number): InputValueData[] {
  //   const result: InputValueData[] = [];
  //   const missing = type === "row" ? this.elementMissing.rows[index] : this.elementMissing.columns[index];
  //   const relatedBoxes = type === "row" ? this.getAllRelatedBoxesInLine(index) : this.getAllRelatedBoxesInColumn(index);

  //   for (const key in missing) {
  //     const sudokuElement = key as Element;
  //     if (!missing[sudokuElement]) continue;

  //     const boxContained = relatedBoxes.map((box) =>
  //       box.some(
  //         (cell) =>
  //           (type === "row" ? cell.rowIndex : cell.columnIndex) === index &&
  //           !cell.clue &&
  //           !cell.inputValue &&
  //           cell.candidates &&
  //           cell.candidates[sudokuElement]
  //       )
  //     );

  //     const numberOfBoxContained = boxContained.reduce((acc, cur) => acc + (cur ? 1 : 0), 0);
  //     if (numberOfBoxContained === 1) {
  //       const lockedBox = relatedBoxes[boxContained.indexOf(true)];
  //       const excludedCells = lockedBox.filter(
  //         (x) =>
  //           (type === "row" ? x.rowIndex : x.columnIndex) !== index &&
  //           !x.clue &&
  //           !x.inputValue &&
  //           x.candidates &&
  //           x.candidates[sudokuElement]
  //       );
  //       excludedCells.forEach((cell) =>
  //         result.push({ rowIndex: cell.rowIndex, columnIndex: cell.columnIndex, value: sudokuElement })
  //       );
  //     }
  //   }

  //   return result;
  // }

  // boxLockInRowColumn(type: "row" | "column", boxIndex: number): InputValueData[] {
  //   const result: InputValueData[] = [];
  //   const missing = this.elementMissing.boxes[boxIndex];
  //   const relatedLines = this.getAllRelatedLinesInBox(type, boxIndex);
  //   const box = this.getAllBoxes()[boxIndex];

  //   for (const key in missing) {
  //     const sudokuElement = key as Element;
  //     if (!missing[sudokuElement]) continue;

  //     const cellsContained = box.filter((x) => !x.clue && !x.inputValue && x.candidates && x.candidates[sudokuElement]);
  //     const allInSameLine =
  //       cellsContained.length &&
  //       cellsContained.every((x) =>
  //         type === "row" ? x.rowIndex === cellsContained[0].rowIndex : x.columnIndex === cellsContained[0].columnIndex
  //       );
  //     if (allInSameLine) {
  //       const lineIndex = type === "row" ? cellsContained[0].rowIndex : cellsContained[0].columnIndex;
  //       const virtualLine = relatedLines.find((x) => (type === "row" ? x[0].rowIndex : x[0].columnIndex) === lineIndex);
  //       if (!virtualLine) continue;
  //       const excludedCells = virtualLine.filter(
  //         (x) =>
  //           this.getBoxIndex(x.rowIndex, x.columnIndex) !== boxIndex &&
  //           !x.clue &&
  //           !x.inputValue &&
  //           x.candidates &&
  //           x.candidates[sudokuElement]
  //       );
  //       excludedCells.forEach((cell) =>
  //         result.push({ rowIndex: cell.rowIndex, columnIndex: cell.columnIndex, value: sudokuElement })
  //       );
  //     }
  //   }

  //   return result;
  // }

  // getRemovalDueToLockedCandidates(): InputValueData[] {
  //   const idx: SudokuIndex[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  //   const row = idx.map((x) => this.rowColumnLockInBox("row", x));
  //   const column = idx.map((x) => this.rowColumnLockInBox("column", x));
  //   const boxRow = idx.map((x) => this.boxLockInRowColumn("row", x));
  //   const boxColumn = idx.map((x) => this.boxLockInRowColumn("column", x));

  //   const arr: InputValueData[] = [...row.flat(), ...column.flat(), ...boxRow.flat(), ...boxColumn.flat()];
  //   return this.removeDuplicatesInputValueData(arr);
  // }

  // removeElementInCandidates(inputValueDataArr: InputValueData[]): boolean {
  //   if (!inputValueDataArr.length) {
  //     return false;
  //   } else {
  //     inputValueDataArr.forEach((inputValueData) => {
  //       const { rowIndex, columnIndex, value } = inputValueData;
  //       const cell = this.grid[rowIndex][columnIndex];
  //       if (cell.candidates) {
  //         cell.candidates[value] = false;
  //       }
  //     });
  //     return true;
  //   }
  // }

  // getCandidatesArr(candidates: Candidates): Element[] {
  //   const entries = Object.entries(candidates) as [Element, boolean][];
  //   const candidatesArr = entries.filter(([_, value]) => value);
  //   return candidatesArr.map(([sudokuElement]) => sudokuElement);
  // }

  // getNakedPairsHelper(virtualLines: VirtualLine[]): {
  //   pairs: [CellWithIndex, CellWithIndex][];
  //   elimination: InputValueData[];
  // }[] {
  //   const result: {
  //     pairs: [CellWithIndex, CellWithIndex][];
  //     elimination: InputValueData[];
  //   }[] = [];

  //   for (let i = 0; i < virtualLines.length; i++) {
  //     const virtualLine = virtualLines[i];
  //     const cellWith2Candidates = virtualLine.filter((x) => this.numberOfCandidates(x) === 2);
  //     if (cellWith2Candidates.length < 2) continue;

  //     const comb: [CellWithIndex, CellWithIndex][] = CalcUtil.combinations(cellWith2Candidates, 2);

  //     const pairs: [CellWithIndex, CellWithIndex][] = [
  //       ...comb.filter(([x, y]) => x.candidates && y.candidates && ObjUtil.shallowEquality(x.candidates, y.candidates)),
  //     ];
  //     if (!pairs.length) continue;
  //     const elimination: InputValueData[] = [];
  //     pairs.forEach(([x, y]) => {
  //       const candidates = x.candidates;
  //       if (!candidates) return;
  //       const elements = this.getCandidatesArr(candidates);
  //       const [c1, c2] = elements;
  //       const restCells = virtualLine.filter(
  //         (z) =>
  //           !(z.rowIndex === x.rowIndex && z.columnIndex === x.columnIndex) &&
  //           !(z.rowIndex === y.rowIndex && z.columnIndex === y.columnIndex)
  //       );
  //       restCells.forEach((z) => {
  //         if (z.candidates && z.candidates[c1]) {
  //           elimination.push({ rowIndex: z.rowIndex, columnIndex: z.columnIndex, value: c1 });
  //         }

  //         if (z.candidates && z.candidates[c2]) {
  //           elimination.push({ rowIndex: z.rowIndex, columnIndex: z.columnIndex, value: c2 });
  //         }
  //       });
  //     });

  //     result.push({ pairs, elimination });
  //   }

  //   return result;
  // }

  // getNakedPairs(): InputValueData[] {
  //   if (!this.isValid) return [];

  //   const rowResult = this.getNakedPairsHelper(this.getAllRows());
  //   const columnResult = this.getNakedPairsHelper(this.getAllColumns());
  //   const boxResult = this.getNakedPairsHelper(this.getAllBoxes());
  //   const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

  //   return elimination;
  // }

  // isCandidateIsSubset(subset: Candidates, superset: Candidates): boolean {
  //   for (const key in subset) {
  //     const sudokuElement = key as Element;
  //     if (subset[sudokuElement] && !superset[sudokuElement]) {
  //       return false;
  //     }
  //   }

  //   return true;
  // }

  // getMultipleNakedHelper(
  //   virtualLines: VirtualLine[],
  //   sizeOfCandidate: number
  // ): {
  //   multiple: CellWithIndex[];
  //   elimination: InputValueData[];
  // }[] {
  //   const result: {
  //     multiple: CellWithIndex[];
  //     elimination: InputValueData[];
  //   }[] = [];

  //   for (let i = 0; i < virtualLines.length; i++) {
  //     const virtualLine = virtualLines[i];

  //     const emptyCells = virtualLine.filter((x) => !x.clue && !x.inputValue);
  //     const missingInVirtualLine = this.missingInVirtualLine(virtualLine);
  //     const missingArr = this.getCandidatesArr(missingInVirtualLine);
  //     if (missingArr.length < sizeOfCandidate) continue;
  //     const combinations = CalcUtil.combinations(missingArr, sizeOfCandidate);

  //     for (const comb of combinations) {
  //       const superset = candidatesFromArr(comb);
  //       const subsetCells = emptyCells.filter((x) => x.candidates && this.isCandidateIsSubset(x.candidates, superset));

  //       if (subsetCells.length === sizeOfCandidate) {
  //         const multiple: CellWithIndex[] = subsetCells;
  //         const elimination: InputValueData[] = [];

  //         const restCells = emptyCells.filter(
  //           (x) => !subsetCells.some((y) => y.rowIndex === x.rowIndex && y.columnIndex === x.columnIndex)
  //         );
  //         // const restCellsContainerAnyCandidateInComb = restCells.some(
  //         //   (x) => x.candidates && this.getCandidatesArr(x.candidates).some((y) => comb.includes(y))
  //         // );
  //         // if (restCellsContainerAnyCandidateInComb) continue;

  //         restCells.forEach((cell) => {
  //           for (const sudokuElement of comb) {
  //             if (cell.candidates && cell.candidates[sudokuElement]) {
  //               elimination.push({ rowIndex: cell.rowIndex, columnIndex: cell.columnIndex, value: sudokuElement });
  //             }
  //           }
  //         });

  //         result.push({ multiple, elimination });
  //       }
  //     }
  //   }

  //   return result;
  // }

  // getNakedTriplets(): InputValueData[] {
  //   if (!this.isValid) return [];

  //   const size = 3;
  //   const rowResult = this.getMultipleNakedHelper(this.getAllRows(), size);
  //   const columnResult = this.getMultipleNakedHelper(this.getAllColumns(), size);
  //   const boxResult = this.getMultipleNakedHelper(this.getAllBoxes(), size);
  //   const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

  //   return elimination;
  // }

  // getNakedQuads(): InputValueData[] {
  //   if (!this.isValid) return [];

  //   const size = 4;
  //   const rowResult = this.getMultipleNakedHelper(this.getAllRows(), size);
  //   const columnResult = this.getMultipleNakedHelper(this.getAllColumns(), size);
  //   const boxResult = this.getMultipleNakedHelper(this.getAllBoxes(), size);
  //   const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

  //   return elimination;
  // }

  // getHiddenMultipleHelper(
  //   virtualLines: VirtualLine[],
  //   sizeOfCandidate: number
  // ): {
  //   combination: Element[];
  //   multiple: CellWithIndex[];
  //   elimination: InputValueData[];
  // }[] {
  //   const result: {
  //     combination: Element[];
  //     multiple: CellWithIndex[];
  //     elimination: InputValueData[];
  //   }[] = [];

  //   for (let i = 0; i < virtualLines.length; i++) {
  //     const virtualLine = virtualLines[i];

  //     const emptyCells = virtualLine.filter((x) => !x.clue && !x.inputValue);
  //     const missingInVirtualLine = this.missingInVirtualLine(virtualLine);
  //     const missingArr = this.getCandidatesArr(missingInVirtualLine);
  //     if (missingArr.length < sizeOfCandidate) continue;
  //     const combinations = CalcUtil.combinations(missingArr, sizeOfCandidate);

  //     // !debug
  //     if (virtualLine.every((x) => x.rowIndex === 1)) {
  //       console.log("file: index.ts ~ line 811 ~ Sudoku ~ combinations", combinations);
  //     }
  //     // !debug

  //     for (const combination of combinations) {
  //       const allSubComb: Element[][] = [];

  //       for (let i = 1; i <= combination.length; i++) {
  //         const subComb = CalcUtil.combinations(combination, i);
  //         allSubComb.push(...subComb);
  //       }

  //       const cellsRelated = emptyCells.filter(
  //         (x) => x.candidates && allSubComb.some((y) => this.isCandidateIsSubset(candidatesFromArr(y), x.candidates!))
  //       );

  //       if (cellsRelated.length === sizeOfCandidate) {
  //         const multiple: CellWithIndex[] = cellsRelated;
  //         const elimination: InputValueData[] = [];

  //         cellsRelated.forEach((x) => {
  //           if (x.candidates) {
  //             for (const key in x.candidates) {
  //               const sudokuElement = key as Element;
  //               if (x.candidates[sudokuElement] && !combination.includes(sudokuElement)) {
  //                 elimination.push({
  //                   rowIndex: x.rowIndex,
  //                   columnIndex: x.columnIndex,
  //                   value: sudokuElement,
  //                 });
  //               }
  //             }
  //           }
  //         });

  //         result.push({ combination, multiple, elimination });
  //       }
  //     }
  //   }

  //   return result;
  // }

  // getHiddenPairs(): InputValueData[] {
  //   if (!this.isValid) return [];

  //   const size = 2;
  //   const rowResult = this.getHiddenMultipleHelper(this.getAllRows(), size);
  //   const columnResult = this.getHiddenMultipleHelper(this.getAllColumns(), size);
  //   const boxResult = this.getHiddenMultipleHelper(this.getAllBoxes(), size);
  //   const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

  //   return elimination;
  // }

  // getHiddenTriplets(): InputValueData[] {
  //   if (!this.isValid) return [];

  //   const size = 3;
  //   const rowResult = this.getHiddenMultipleHelper(this.getAllRows(), size);
  //   const columnResult = this.getHiddenMultipleHelper(this.getAllColumns(), size);
  //   const boxResult = this.getHiddenMultipleHelper(this.getAllBoxes(), size);
  //   const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

  //   return elimination;
  // }

  // getHiddenQuads(): InputValueData[] {
  //   if (!this.isValid) return [];

  //   const size = 4;
  //   const rowResult = this.getHiddenMultipleHelper(this.getAllRows(), size);
  //   const columnResult = this.getHiddenMultipleHelper(this.getAllColumns(), size);
  //   const boxResult = this.getHiddenMultipleHelper(this.getAllBoxes(), size);
  //   const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

  //   return elimination;
  // }

  // getXWingSwordfishHelper(
  //   virtualLines: VirtualLine[],
  //   type: "row" | "column",
  //   calcType: "xWing" | "swordfish"
  // ): { sudokuElement: Element; multiple: CellWithIndex[]; elimination: InputValueData[] }[] {
  //   const result: { sudokuElement: Element; multiple: CellWithIndex[]; elimination: InputValueData[] }[] = [];

  //   const size = calcType === "xWing" ? 2 : 3;
  //   const allElements = createAllElementsArr();

  //   for (const e of allElements) {
  //     const sudokuElement = e as Element;
  //     const containElement = virtualLines.map((line) =>
  //       line.map((x) => (x.candidates && x.candidates[sudokuElement]) ?? false)
  //     );
  //     const lineWithTwoCellsContained = containElement.reduce((acc, cur, curIndex) => {
  //       if (cur.filter((x) => x).length === size) {
  //         const cells = virtualLines[curIndex].filter((x) => x.candidates && x.candidates[sudokuElement]);
  //         acc.push({ element: sudokuElement, index: curIndex, cells });
  //       }
  //       return acc;
  //     }, [] as { element: Element; index: number; cells: CellWithIndex[] }[]);
  //     if (lineWithTwoCellsContained.length >= size) {
  //       const combinations = CalcUtil.combinations(lineWithTwoCellsContained, size);
  //       for (const [c1, c2, c3] of combinations) {
  //         const isSamePosition =
  //           type === "row"
  //             ? c1.cells[0].columnIndex === c2.cells[0].columnIndex &&
  //               c1.cells[1].columnIndex === c2.cells[1].columnIndex &&
  //               (c3 ? c1.cells[0].columnIndex === c3.cells[0].columnIndex : true)
  //             : c1.cells[0].rowIndex === c2.cells[0].rowIndex &&
  //               c1.cells[1].rowIndex === c2.cells[1].rowIndex &&
  //               (c3 ? c1.cells[0].rowIndex === c3.cells[0].rowIndex : true);

  //         if (isSamePosition) {
  //           const transverseIndexes =
  //             calcType === "xWing"
  //               ? type === "row"
  //                 ? [c1.cells[0].columnIndex, c1.cells[1].columnIndex]
  //                 : [c1.cells[0].rowIndex, c1.cells[1].rowIndex]
  //               : type === "row"
  //               ? [c1.cells[0].columnIndex, c1.cells[1].columnIndex, c3.cells[0].columnIndex]
  //               : [c1.cells[0].rowIndex, c1.cells[1].rowIndex, c3.cells[0].rowIndex];
  //           const multiple =
  //             calcType === "xWing"
  //               ? [c1.cells[0], c1.cells[1], c2.cells[0], c2.cells[1]]
  //               : [c1.cells[0], c1.cells[1], c2.cells[0], c2.cells[1], c3.cells[0], c3.cells[1]];
  //           const eliminationLines =
  //             calcType === "xWing"
  //               ? type === "row"
  //                 ? [this.getColumn(transverseIndexes[0]), this.getColumn(transverseIndexes[1])]
  //                 : [this.getRow(transverseIndexes[0]), this.getRow(transverseIndexes[1])]
  //               : type === "row"
  //               ? [
  //                   this.getColumn(transverseIndexes[0]),
  //                   this.getColumn(transverseIndexes[1]),
  //                   this.getColumn(transverseIndexes[1]),
  //                 ]
  //               : [
  //                   this.getRow(transverseIndexes[0]),
  //                   this.getRow(transverseIndexes[1]),
  //                   this.getRow(transverseIndexes[1]),
  //                 ];
  //           const elimination: InputValueData[] = [];
  //           eliminationLines.forEach((line) => {
  //             line.forEach((cell) => {
  //               if (cell.candidates && cell.candidates[sudokuElement]) {
  //                 if (!multiple.some((x) => x.rowIndex === cell.rowIndex && x.columnIndex === cell.columnIndex)) {
  //                   elimination.push({
  //                     rowIndex: cell.rowIndex,
  //                     columnIndex: cell.columnIndex,
  //                     value: sudokuElement,
  //                   });
  //                 }
  //               }
  //             });
  //           });
  //           result.push({ sudokuElement, multiple, elimination });
  //         }
  //       }
  //     }
  //   }

  //   return result;
  // }

  // getXWing(): InputValueData[] {
  //   if (!this.isValid) return [];

  //   const rowResult = this.getXWingSwordfishHelper(this.getAllRows(), "row", "xWing");
  //   const columnResult = this.getXWingSwordfishHelper(this.getAllColumns(), "column", "xWing");
  //   const elimination = [...rowResult, ...columnResult].flatMap((x) => x.elimination);

  //   return elimination;
  // }

  // // todo the swordfish may not need all rows/cols to have exactly 3 cells
  // getSwordfish(): InputValueData[] {
  //   if (!this.isValid) return [];

  //   const rowResult = this.getXWingSwordfishHelper(this.getAllRows(), "row", "swordfish");
  //   const columnResult = this.getXWingSwordfishHelper(this.getAllColumns(), "column", "swordfish");
  //   const elimination = [...rowResult, ...columnResult].flatMap((x) => x.elimination);

  //   return elimination;
  // }

  // getYWingHelper(): {
  //   pivot: CellWithIndex;
  //   pincers: [CellWithIndex, CellWithIndex];
  //   elimination: InputValueData | null;
  // }[] {
  //   const result: {
  //     pivot: CellWithIndex;
  //     pincers: [CellWithIndex, CellWithIndex];
  //     elimination: InputValueData | null;
  //   }[] = [];
  //   const cellsWithTwoCandidates = this.grid.map((row) =>
  //     row.map((cell) => (cell.candidates && this.numberOfCandidates(cell) === 2) ?? false)
  //   );

  //   const cellsWithTwoCandidatesAndOneIsAorB = (
  //     cell: CellWithIndex,
  //     a: Element,
  //     b: Element
  //   ): null | { rowIndex: number; columnIndex: number; same: Element; diff: Element } => {
  //     if (!cell.candidates) return null;
  //     const candidates = cell.candidates;
  //     const numberOfCandidates = this.numberOfCandidates(cell);
  //     if (numberOfCandidates !== 2) return null;
  //     if (!CalcUtil.xor(candidates[a], candidates[b])) return null;
  //     const rowIndex = cell.rowIndex;
  //     const columnIndex = cell.columnIndex;
  //     const same = candidates[a] ? a : b;
  //     const diff = this.getCandidatesArr(cell.candidates).filter((x) => x !== same)[0];
  //     return { rowIndex, columnIndex, same, diff };
  //   };

  //   const possiblePincersFromLine = (line: VirtualLine, pivot: CellWithIndex, a: Element, b: Element) => {
  //     return line.reduce((acc, cur, arr) => {
  //       if (cur.rowIndex === pivot.rowIndex && cur.columnIndex === pivot.columnIndex) return acc;
  //       const pincer = cellsWithTwoCandidatesAndOneIsAorB(cur, a, b);
  //       if (pincer) acc.push({ ...pincer, line });
  //       return acc;
  //     }, [] as { rowIndex: number; columnIndex: number; same: Element; diff: Element; line: VirtualLine }[]);
  //   };

  //   for (let i = 0; i < cellsWithTwoCandidates.length; i++) {
  //     for (let j = 0; j < cellsWithTwoCandidates[i].length; j++) {
  //       if (!cellsWithTwoCandidates[i][j]) continue;
  //       const pivot = { ...this.grid[i][j], rowIndex: i, columnIndex: j };
  //       if (!pivot.candidates) continue;
  //       const [a, b] = this.getCandidatesArr(pivot.candidates);
  //       const pivotRow = this.getRow(i);
  //       const pivotColumn = this.getColumn(j);
  //       const pivotBox = this.getBoxFromRowColumnIndex(i, j);
  //       const possibleRowPincers = possiblePincersFromLine(pivotRow, pivot, a, b);
  //       const possibleColumnPincers = possiblePincersFromLine(pivotColumn, pivot, a, b);
  //       const possibleBoxPincers = possiblePincersFromLine(pivotBox, pivot, a, b);

  //       const rowColumnProduct = CalcUtil.cartesianProduct(possibleRowPincers, possibleColumnPincers).filter(
  //         ([a, b]) => a.same !== b.same && a.diff === b.diff
  //       );
  //       console.log("file: index.ts ~ line 970 ~ Sudoku ~ getYWingHelper ~ rowColumnProduct", rowColumnProduct);
  //       const rowBoxProduct = CalcUtil.cartesianProduct(possibleRowPincers, possibleBoxPincers)
  //         .filter(([a, b]) => a.rowIndex === b.rowIndex && a.columnIndex === b.columnIndex)
  //         .filter(([a, b]) => a.same !== b.same && a.diff === b.diff);
  //       console.log("file: index.ts ~ line 972 ~ Sudoku ~ getYWingHelper ~ rowBoxProduct", rowBoxProduct);
  //       const columnBoxProduct = CalcUtil.cartesianProduct(possibleColumnPincers, possibleBoxPincers)
  //         .filter(([a, b]) => a.rowIndex === b.rowIndex && a.columnIndex === b.columnIndex)
  //         .filter(([a, b]) => a.same !== b.same && a.diff === b.diff);
  //       console.log("file: index.ts ~ line 976 ~ Sudoku ~ getYWingHelper ~ columnBoxProduct", columnBoxProduct);
  //       const validatePincer = [...rowColumnProduct, ...rowBoxProduct, ...columnBoxProduct];
  //       if (!validatePincer.length) continue;
  //       console.log(validatePincer);

  //       validatePincer.forEach((x) => {
  //         const pincers = x;
  //         let elimination: InputValueData | null = null;
  //         // !wrong type here
  //         const p1Intersection = this.getAllRelatedCells(pincers[0]);
  //         // !wrong type here
  //         const p2Intersection = this.getAllRelatedCells(pincers[1]);
  //         const intersection = this.getVirtualLinesIntersections(p1Intersection, p2Intersection).filter(
  //           (x) => !Sudoku.isSamePos(x, pivot)
  //         );
  //         intersection.forEach((x) => {
  //           if (x.candidates && x.candidates[pincers[0].diff]) {
  //             elimination = { rowIndex: x.rowIndex, columnIndex: x.columnIndex, value: pincers[0].diff };
  //           }
  //         });
  //         result.push({ pivot, pincers, elimination });
  //       });
  //     }
  //   }

  //   console.log("file: index.ts ~ line 994 ~ Sudoku ~ getYWingHelper ~ result", result);
  //   return result;
  // }

  // getYWing(): InputValueData[] {
  //   if (!this.isValid) return [];

  //   const elimination = this.getYWingHelper()
  //     .flatMap((x) => x.elimination)
  //     .filter((x) => x) as InputValueData[];
  //   return elimination;
  // }

  // setRowUniqueMissing(): boolean {
  //   const uniqueMissing = this.getUniqueMissing("row");
  //   if (uniqueMissing.length) {
  //     this.setInputValue(uniqueMissing);
  //     this.stats.rowUniqueMissing += uniqueMissing.length;
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // setColumnUniqueMissing(): boolean {
  //   const uniqueMissing = this.getUniqueMissing("column");
  //   if (uniqueMissing.length) {
  //     this.setInputValue(uniqueMissing);
  //     this.stats.columnUniqueMissing += uniqueMissing.length;
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // setBoxUniqueMissing(): boolean {
  //   const uniqueMissing = this.getUniqueMissing("box");
  //   if (uniqueMissing.length) {
  //     this.setInputValue(uniqueMissing);
  //     this.stats.boxUniqueMissing += uniqueMissing.length;
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // setNakedSingles(): boolean {
  //   const nakedSingles = this.getNakedSingles();
  //   if (nakedSingles.length) {
  //     this.setInputValue(nakedSingles);
  //     this.stats.nakedSingles += nakedSingles.length;
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // setHiddenSingles(): boolean {
  //   const hiddenSingles = this.getHiddenSingles();

  //   if (hiddenSingles.length) {
  //     this.setInputValue(hiddenSingles);
  //     this.stats.hiddenSingles += hiddenSingles.length;
  //     return true;
  //   } else {
  //     return false;
  //   }
  // }

  // trySolve(): void {
  //   if (this.isValid) {
  //     if (this.setRowUniqueMissing()) return this.trySolve();
  //     if (this.setColumnUniqueMissing()) return this.trySolve();
  //     if (this.setBoxUniqueMissing()) return this.trySolve();

  //     this.getCombinedMissing();
  //     if (this.setNakedSingles()) return this.trySolve();
  //     if (this.setHiddenSingles()) return this.trySolve();

  //     const removalDueToLockedCandidates = this.getRemovalDueToLockedCandidates();
  //     if (removalDueToLockedCandidates.length) {
  //       this.removeElementInCandidates(removalDueToLockedCandidates);
  //       if (this.setNakedSingles()) return this.trySolve();
  //       if (this.setHiddenSingles()) return this.trySolve();
  //     }

  //     const nakedPairsElimination = this.getNakedPairs();
  //     if (nakedPairsElimination.length) {
  //       this.removeElementInCandidates(nakedPairsElimination);
  //       if (this.setNakedSingles()) return this.trySolve();
  //       if (this.setHiddenSingles()) return this.trySolve();
  //     }

  //     const nakedTripletsElimination = this.getNakedTriplets();
  //     if (nakedTripletsElimination.length) {
  //       this.removeElementInCandidates(nakedTripletsElimination);
  //       if (this.setNakedSingles()) return this.trySolve();
  //       if (this.setHiddenSingles()) return this.trySolve();
  //     }

  //     const nakedQuadsElimination = this.getNakedQuads();
  //     if (nakedQuadsElimination.length) {
  //       this.removeElementInCandidates(nakedQuadsElimination);
  //       if (this.setNakedSingles()) return this.trySolve();
  //       if (this.setHiddenSingles()) return this.trySolve();
  //     }

  //     const hiddenPairsElimination = this.getHiddenPairs();
  //     if (hiddenPairsElimination.length) {
  //       this.removeElementInCandidates(hiddenPairsElimination);
  //       if (this.setNakedSingles()) return this.trySolve();
  //       if (this.setHiddenSingles()) return this.trySolve();
  //     }

  //     const hiddenTripletsElimination = this.getHiddenTriplets();
  //     if (hiddenTripletsElimination.length) {
  //       this.removeElementInCandidates(hiddenTripletsElimination);
  //       if (this.setNakedSingles()) return this.trySolve();
  //       if (this.setHiddenSingles()) return this.trySolve();
  //     }

  //     const hiddenQuadsElimination = this.getHiddenQuads();
  //     if (hiddenQuadsElimination.length) {
  //       this.removeElementInCandidates(hiddenQuadsElimination);
  //       if (this.setNakedSingles()) return this.trySolve();
  //       if (this.setHiddenSingles()) return this.trySolve();
  //     }

  //     const xWingElimination = this.getXWing();
  //     if (xWingElimination.length) {
  //       this.removeElementInCandidates(xWingElimination);
  //       if (this.setNakedSingles()) return this.trySolve();
  //       if (this.setHiddenSingles()) return this.trySolve();
  //     }

  //     const swordfishElimination = this.getSwordfish();
  //     if (swordfishElimination.length) {
  //       this.removeElementInCandidates(swordfishElimination);
  //       if (this.setNakedSingles()) return this.trySolve();
  //       if (this.setHiddenSingles()) return this.trySolve();
  //     }

  //     const yWingElimination = this.getYWing();
  //     if (yWingElimination.length) {
  //       this.removeElementInCandidates(yWingElimination);
  //       if (this.setNakedSingles()) return this.trySolve();
  //       if (this.setHiddenSingles()) return this.trySolve();
  //     }

  //     return;
  //   }
  // }
}
