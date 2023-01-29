import CalcUtil from "../utils/CalcUtil";
import ArrUtil from "../utils/ArrUtil";
import Sudoku from "./Sudoku";
import type {
  RowColumn,
  Stats,
  Candidates,
  InputClues,
  SudokuElement,
  VirtualLine,
  InputValueData,
  Cell,
  CellWithIndex,
  ElementMissing,
  SudokuIndex,
} from "./type";
import { VirtualLineType } from "./type";
import ObjUtil from "@/utils/ObjUtil";

// const createAllElementsArr = (): SudokuElement[] => ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

// const candidatesFromArr = (arr: SudokuElement[]) => {
//   const candidates = candidatesFactory(false);
//   arr.forEach((x) => (candidates[x] = true));
//   return candidates;
// };

export interface UniqueMissing {
  virtualLine: VirtualLine;
  uniqueCandidate: SudokuElement;
  cell: CellWithIndex;
}

export interface NakedPairsTripletsResult {
  cells: CellWithIndex[];
  elimination: InputValueData[];
}

export default class SudokuSolver extends Sudoku {
  public elementMissing: ElementMissing;
  public stats: Stats;

  constructor(clues: InputClues) {
    super(clues);
    this.elementMissing = this.updateElementMissing();
    this.stats = SudokuSolver.statsTemplate();
  }

  override setInputValue(...args: Parameters<Sudoku["setInputValue"]>) {
    super.setInputValue(...args);
    this.updateElementMissing();
  }

  override setInputValues(...args: Parameters<Sudoku["setInputValues"]>) {
    super.setInputValues(...args);
    this.updateElementMissing();
  }

  override removeInputValue(...args: Parameters<Sudoku["removeInputValue"]>) {
    super.removeInputValue(...args);
    this.updateElementMissing();
  }

  getBasicCandidates(): void {
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
        const candidates = Sudoku.candidatesFactory(false);

        for (const key in candidates) {
          const typedKey = key as SudokuElement;
          if (missingRow[typedKey] && missingColumn[typedKey] && missingBox[typedKey]) {
            candidates[typedKey] = true;
          }
        }

        this.setCandidates(i, j, candidates);
      }
    }
  }

  getUniqueMissing(type: VirtualLineType): UniqueMissing[] {
    const allVirtualLines = this.getAllVirtualLines(type);
    const missingArr = this.elementMissing[type];
    const result: UniqueMissing[] = [];
    ArrUtil.zip2(allVirtualLines, missingArr).forEach(([virtualLine, missing]) => {
      const uniqueCandidate = SudokuSolver.getUniqueCandidate(missing);
      if (uniqueCandidate) {
        const cell = virtualLine.find((x) => !x.clue && !x.inputValue)!;
        result.push({ virtualLine, uniqueCandidate, cell });
      }
    });
    return result;
  }

  getNakedSingles(): InputValueData[] {
    const result: InputValueData[] = [];
    this.loopGrid((rowIndex, columnIndex, cell) => {
      if (!cell.candidates || cell.clue || cell.inputValue) return;
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
    return Sudoku.removeDuplicatedInputValueData([...rowResult, ...columnResult, ...boxResult]);
  }

  setUniqueMissing(): boolean {
    const row = this.getUniqueMissing(VirtualLineType.ROW);
    const column = this.getUniqueMissing(VirtualLineType.COLUMN);
    const box = this.getUniqueMissing(VirtualLineType.BOX);
    const inputValues: InputValueData[] = Sudoku.removeDuplicatedInputValueData(
      [...row, ...column, ...box].map((x) => ({
        rowIndex: x.cell.rowIndex,
        columnIndex: x.cell.columnIndex,
        value: x.uniqueCandidate,
      }))
    );
    if (!inputValues.length) return false;
    this.setInputValues(inputValues);
    this.stats.uniqueMissing += inputValues.length;
    return true;
  }

  setNakedSingles(): boolean {
    const nakedSingles = this.getNakedSingles();
    if (!nakedSingles.length) return false;
    this.setInputValues(nakedSingles);
    this.stats.nakedSingle += nakedSingles.length;
    return true;
  }

  setHiddenSingles(): boolean {
    const hiddenSingles = this.getHiddenSingles();
    if (!hiddenSingles.length) return false;
    this.setInputValues(hiddenSingles);
    this.stats.hiddenSingle += hiddenSingles.length;
    return true;
  }

  trySolve(): boolean {
    if (this.setUniqueMissing()) return this.trySolve();

    this.getBasicCandidates();
    if (this.setNakedSingles()) return this.trySolve();
    if (this.setHiddenSingles()) return this.trySolve();

    return this.solved;
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
    const candidatesCount: Record<SudokuElement, number> = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0,
      "7": 0,
      "8": 0,
      "9": 0,
    };
    virtualLine.forEach((cell) => {
      if (!cell.candidates || cell.clue || cell.inputValue) return;
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

  rowColumnLockInBox(type: RowColumn, index: number): InputValueData[] {
    const result: InputValueData[] = [];
    const missing = this.elementMissing[type][index];
    const relatedBoxes = this.getAllRelatedBoxesInRowOrColumn(type, index);

    for (const key in missing) {
      const sudokuElement = key as SudokuElement;
      if (!missing[sudokuElement]) continue;

      const boxContained = relatedBoxes.map((box) =>
        box.some(
          (cell) =>
            (type === VirtualLineType.ROW ? cell.rowIndex : cell.columnIndex) === index &&
            cell.candidates &&
            cell.candidates[sudokuElement] &&
            !cell.clue &&
            !cell.inputValue
        )
      );

      const numberOfBoxContained = boxContained.reduce((acc, cur) => acc + (cur ? 1 : 0), 0);
      if (numberOfBoxContained === 1) {
        const lockedBox = relatedBoxes[boxContained.indexOf(true)];
        const excludedCells = lockedBox.filter(
          (cell) =>
            (type === VirtualLineType.ROW ? cell.rowIndex : cell.columnIndex) !== index &&
            cell.candidates &&
            cell.candidates[sudokuElement] &&
            !cell.clue &&
            !cell.inputValue
        );
        excludedCells.forEach((cell) =>
          result.push({ rowIndex: cell.rowIndex, columnIndex: cell.columnIndex, value: sudokuElement })
        );
      }
    }

    return result;
  }

  boxLockInRowColumn(type: RowColumn, boxIndex: number): InputValueData[] {
    const result: InputValueData[] = [];
    const missing = this.elementMissing[VirtualLineType.BOX][boxIndex];
    const relatedLines = this.getAllRelatedRowsOrColumnsInBox(type, boxIndex);
    const box = this.getBoxFromBoxIndex(boxIndex);

    for (const key in missing) {
      const sudokuElement = key as SudokuElement;
      if (!missing[sudokuElement]) continue;

      const cellsContained = box.filter((x) => x.candidates && x.candidates[sudokuElement] && !x.clue && !x.inputValue);
      if (cellsContained.length === 0) continue;

      const allInSameLine = cellsContained.every((x) =>
        type === VirtualLineType.ROW
          ? x.rowIndex === cellsContained[0].rowIndex
          : x.columnIndex === cellsContained[0].columnIndex
      );
      if (allInSameLine) {
        const lineIndex = type === VirtualLineType.ROW ? cellsContained[0].rowIndex : cellsContained[0].columnIndex;
        const virtualLine = relatedLines.find(
          (x) => (type === VirtualLineType.ROW ? x[0].rowIndex : x[0].columnIndex) === lineIndex
        );
        if (!virtualLine) continue;
        const excludedCells = virtualLine.filter(
          (x) =>
            this.getBoxIndex(x.rowIndex, x.columnIndex) !== boxIndex &&
            x.candidates &&
            x.candidates[sudokuElement] &&
            !x.clue &&
            !x.inputValue
        );
        excludedCells.forEach((cell) =>
          result.push({ rowIndex: cell.rowIndex, columnIndex: cell.columnIndex, value: sudokuElement })
        );
      }
    }

    return result;
  }

  getRemovalDueToLockedCandidates(): InputValueData[] {
    const idx: SudokuIndex[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    const rowLockInBox = idx.map((x) => this.rowColumnLockInBox(VirtualLineType.ROW, x));
    const columnLockInBox = idx.map((x) => this.rowColumnLockInBox(VirtualLineType.COLUMN, x));
    const boxLockInRow = idx.map((x) => this.boxLockInRowColumn(VirtualLineType.ROW, x));
    const boxLockInColumn = idx.map((x) => this.boxLockInRowColumn(VirtualLineType.COLUMN, x));

    const arr: InputValueData[] = [
      ...rowLockInBox.flat(),
      ...columnLockInBox.flat(),
      ...boxLockInRow.flat(),
      ...boxLockInColumn.flat(),
    ];
    return Sudoku.removeDuplicatedInputValueData(arr);
  }

  removeElementInCandidates(inputValueDataArr: InputValueData[]): boolean {
    if (!inputValueDataArr.length) {
      return false;
    }

    inputValueDataArr.forEach((inputValueData) => {
      const { rowIndex, columnIndex, value } = inputValueData;
      const cell = this.grid[rowIndex][columnIndex];
      if (cell.candidates) {
        cell.candidates[value] = false;
      }
    });
    return true;
  }

  getNakedPairsFromVirtualLines(virtualLines: VirtualLine[]): NakedPairsTripletsResult[] {
    const result: NakedPairsTripletsResult[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const cellWith2Candidates = virtualLine.filter(
        (x) => x.candidates && SudokuSolver.numberOfCandidates(x.candidates) === 2
      );
      if (cellWith2Candidates.length < 2) continue;

      const comb: [CellWithIndex, CellWithIndex][] = CalcUtil.combinations2(cellWith2Candidates);
      const nakedPairs: [CellWithIndex, CellWithIndex][] = comb.filter(
        ([x, y]) => x.candidates && y.candidates && SudokuSolver.sameCandidates(x.candidates, y.candidates)
      );

      if (!nakedPairs.length) continue;

      nakedPairs.forEach(([x, y]) => {
        if (!x.candidates) return;

        const cells = [x, y];
        const elimination: InputValueData[] = [];
        const [c1, c2] = SudokuSolver.getCandidatesArr(x.candidates);
        const restCells = virtualLine.filter(
          (z) =>
            !(z.rowIndex === x.rowIndex && z.columnIndex === x.columnIndex) &&
            !(z.rowIndex === y.rowIndex && z.columnIndex === y.columnIndex)
        );
        restCells.forEach(({ rowIndex, columnIndex, candidates }) => {
          if (candidates?.[c1]) elimination.push({ rowIndex, columnIndex, value: c1 });
          if (candidates?.[c2]) elimination.push({ rowIndex, columnIndex, value: c2 });
        });

        result.push({ cells, elimination });
      });
    }

    return result;
  }

  getRemovalDueToNakedPairs(): InputValueData[] {
    if (!this.isValid) return [];

    const rowResult = this.getNakedPairsFromVirtualLines(this.getAllRows());
    const columnResult = this.getNakedPairsFromVirtualLines(this.getAllColumns());
    const boxResult = this.getNakedPairsFromVirtualLines(this.getAllBoxes());
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

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

  static statsTemplate: () => Stats = () => ({
    uniqueMissing: 0,
    nakedSingle: 0,
    hiddenSingle: 0,
  });

  static sameCandidates(x: Candidates, y: Candidates): boolean {
    for (let key in x) {
      if (x[key as SudokuElement] !== y[key as SudokuElement]) return false;
    }
    return true;
  }

  static getCandidatesArr(candidates: Candidates): SudokuElement[] {
    const result: SudokuElement[] = [];

    for (let key in candidates) {
      if (candidates[key as SudokuElement]) result.push(key as SudokuElement);
    }

    return result;
  }
}
