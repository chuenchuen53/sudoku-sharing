import ArrayUtils from "@/utils/ArrayUtil";
import CalcUtil from "@/utils/CalcUtil";
import ObjUtil from "@/utils/ObjUtil";
import {
  type Element,
  type SudokuIndex,
  type Cell,
  type Candidates,
  type CellWithIndex,
  type ElementMissing,
  type InputValueData,
  type Grid,
  type Stats,
  type VirtualLine,
  type InputClues,
  type RowColumn,
  VirtualLineType,
} from "./type";

export interface CheckVirtualLineDuplicateResult {
  haveDuplicate: boolean;
  duplicatedCells: CellWithIndex[];
}

const createAllElementsArr = (): Element[] => ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

export const candidatesFactory = (defaultValue: boolean, elements?: Element[]) => {
  if (!elements) {
    return {
      "1": defaultValue,
      "2": defaultValue,
      "3": defaultValue,
      "4": defaultValue,
      "5": defaultValue,
      "6": defaultValue,
      "7": defaultValue,
      "8": defaultValue,
      "9": defaultValue,
    };
  } else {
    return {
      "1": elements.includes("1") ? defaultValue : !defaultValue,
      "2": elements.includes("2") ? defaultValue : !defaultValue,
      "3": elements.includes("3") ? defaultValue : !defaultValue,
      "4": elements.includes("4") ? defaultValue : !defaultValue,
      "5": elements.includes("5") ? defaultValue : !defaultValue,
      "6": elements.includes("6") ? defaultValue : !defaultValue,
      "7": elements.includes("7") ? defaultValue : !defaultValue,
      "8": elements.includes("8") ? defaultValue : !defaultValue,
      "9": elements.includes("9") ? defaultValue : !defaultValue,
    };
  }
};

// todo
const statsTemplate: () => Stats = () => ({
  rowUniqueMissing: 0,
  columnUniqueMissing: 0,
  boxUniqueMissing: 0,
  nakedSingles: 0,
  hiddenSingles: 0,
});

const candidatesFromArr = (arr: Element[]) => {
  const candidates = candidatesFactory(false);
  arr.forEach((x) => (candidates[x] = true));
  return candidates;
};

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

export default class Sudoku {
  public grid: Grid;
  public invalidCells: [CellWithIndex, CellWithIndex][] = [];
  public isValid: boolean;
  public numberOfClues: number;
  public stats: Stats;

  private elementMissing: ElementMissing;

  constructor(clues: InputClues) {
    this.grid = this.createPuzzle(clues);
    this.isValid = this.validatePuzzle("clue").isValid;
    this.elementMissing = this.updateElementMissing();
    this.numberOfClues = this.getNumberOfClues();
    this.stats = statsTemplate();
  }

  private getNumberOfClues() {
    return this.grid.reduce((acc, row) => acc + row.reduce((acc, cell) => (cell.clue ? acc + 1 : acc), 0), 0);
  }

  private updateElementMissing() {
    this.elementMissing = {
      [VirtualLineType.ROW]: this.getAllRows().map((x) => this.missingInVirtualLine(x)),
      [VirtualLineType.COLUMN]: this.getAllColumns().map((x) => this.missingInVirtualLine(x)),
      [VirtualLineType.BOX]: this.getAllBoxes().map((x) => this.missingInVirtualLine(x)),
    };

    return this.elementMissing;
  }

  createPuzzle(clues: InputClues): Grid {
    if (clues.length !== 9 || clues.some((x) => x.length !== 9)) throw new Error("Invalid input clues");

    const grid: Grid = ArrayUtils.create2DArray(9, 9, {});
    clues.forEach((row, i) =>
      row.forEach((clue, j) => {
        if (clue !== "0") {
          grid[i][j].clue = clue;
        }
      })
    );

    return grid;
  }

  getRow(rowIndex: number): VirtualLine {
    return this.grid[rowIndex].map((x, columnIndex) => ({
      ...x,
      rowIndex,
      columnIndex,
    }));
  }

  getColumn(columnIndex: number): VirtualLine {
    return this.grid.map((row, rowIndex) => ({
      ...row[columnIndex],
      rowIndex,
      columnIndex,
    }));
  }

  getBoxFromRowColumnIndex(rowIndex: number, columnIndex: number): VirtualLine {
    const box: VirtualLine = [];
    const firstRowIndex = rowIndex - (rowIndex % 3);
    const firstColumnIndex = columnIndex - (columnIndex % 3);
    for (let i = firstRowIndex; i < firstRowIndex + 3; i++) {
      for (let j = firstColumnIndex; j < firstColumnIndex + 3; j++) {
        box.push({
          ...this.grid[i][j],
          rowIndex: i,
          columnIndex: j,
        });
      }
    }
    return box;
  }

  getBoxFromBoxIndex(boxIndex: number) {
    const rowIndex = this.boxFirstLineIndex(boxIndex, VirtualLineType.ROW);
    const columnIndex = this.boxFirstLineIndex(boxIndex, VirtualLineType.COLUMN);
    return this.getBoxFromRowColumnIndex(rowIndex, columnIndex);
  }

  getAllRows(): VirtualLine[] {
    return this.grid.map((_, rowIndex) => this.getRow(rowIndex));
  }

  getAllColumns(): VirtualLine[] {
    return this.grid[0].map((_, columnIndex) => this.getColumn(columnIndex));
  }

  getAllBoxes(): VirtualLine[] {
    const boxes: VirtualLine[] = [];
    for (let i = 0; i < 9; i += 3) {
      for (let j = 0; j < 9; j += 3) {
        boxes.push(this.getBoxFromRowColumnIndex(i, j));
      }
    }
    return boxes;
  }

  getAllRelatedBoxesInLine(lineType: RowColumn, lineIndex: number): VirtualLine[] {
    const boxes: VirtualLine[] = [];
    for (let i = 0; i < 9; i += 3) {
      lineType === VirtualLineType.ROW
        ? boxes.push(this.getBoxFromRowColumnIndex(lineIndex, i))
        : boxes.push(this.getBoxFromRowColumnIndex(i, lineIndex));
    }
    return boxes;
  }

  getAllRelatedLinesInBox(lineType: RowColumn, boxIndex: number): VirtualLine[] {
    const firstIndex = this.boxFirstLineIndex(boxIndex, VirtualLineType.ROW);
    const getLine = lineType === VirtualLineType.ROW ? this.getRow : this.getColumn;
    return [getLine(firstIndex), getLine(firstIndex + 1), getLine(firstIndex + 2)];
  }

  static isSamePos(c1: CellWithIndex, c2: CellWithIndex): boolean {
    return c1.rowIndex === c2.rowIndex && c1.columnIndex === c2.columnIndex;
  }

  getVirtualLinesIntersections(line1: VirtualLine, line2: VirtualLine): VirtualLine {
    return line1.filter((cell) =>
      line2.some((x) => x.rowIndex === cell.rowIndex && x.columnIndex === cell.columnIndex)
    );
  }

  getCellIntersections(cell: CellWithIndex): VirtualLine {
    const row = this.getRow(cell.rowIndex);
    const column = this.getColumn(cell.columnIndex);
    const box = this.getBoxFromRowColumnIndex(cell.rowIndex, cell.columnIndex);
    const intersection = [...row, ...column, ...box].filter((x) => !Sudoku.isSamePos(x, cell));
    return intersection.filter((x, index, arr) => arr.findIndex((y) => Sudoku.isSamePos(x, y)) === index);
  }

  boxFirstLineIndex(boxIndex: number, type: RowColumn) {
    switch (type) {
      case VirtualLineType.ROW:
        return Math.floor(boxIndex / 3) * 3;
      case VirtualLineType.COLUMN:
        return (boxIndex % 3) * 3;
    }
  }

  getAllCellsInRelatedVirtualLines(rowIndex: number, columnIndex: number): { rowIndex: number; columnIndex: number }[] {
    const row = this.getRow(rowIndex);
    const column = this.getColumn(columnIndex);
    const box = this.getBoxFromRowColumnIndex(rowIndex, columnIndex);
    const allCellsInRelatedVirtualLines = [...row, ...column, ...box]
      .filter(
        (value, index, self) =>
          index === self.findIndex((c) => c.rowIndex === value.rowIndex && c.columnIndex === value.columnIndex)
      )
      .map(({ rowIndex, columnIndex }) => ({ rowIndex, columnIndex }));
    return allCellsInRelatedVirtualLines;
  }

  getBoxIndex(rowIndex: number, columnIndex: number) {
    return Math.floor(rowIndex / 3) * 3 + Math.floor(columnIndex / 3);
  }

  setCandidates(rowIndex: number, columnIndex: number, candidates: Candidates) {
    this.grid[rowIndex][columnIndex].candidates = { ...candidates };
  }

  setInputValue(data: InputValueData[]) {
    if (!data.length) return;

    data.forEach(({ rowIndex, columnIndex, value }) => {
      if (this.grid[rowIndex][columnIndex].clue) {
        console.error("Cannot set input value to a cell with a clue");
        return;
      }

      this.grid[rowIndex][columnIndex].inputValue = value;
      delete this.grid[rowIndex][columnIndex].candidates;
      const { isValid } = this.validatePuzzle("inputValue");
      this.isValid = isValid;
    });
    this.updateElementMissing();
    this.getCombinedMissing();
  }

  clearAllCandidates() {
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        this.grid[i][j].candidates = undefined;
      }
    }
  }

  missingInVirtualLine(virtualLine: VirtualLine): Candidates {
    const missing = candidatesFactory(true);
    virtualLine.forEach((cell) => {
      if (cell.clue) {
        missing[cell.clue] = false;
      } else if (cell.inputValue) {
        missing[cell.inputValue] = false;
      }
    });
    return missing;
  }

  private checkVirtualLineDuplicate(
    virtualLine: VirtualLine,
    key: Extract<keyof CellWithIndex, "clue" | "inputValue">
  ): CheckVirtualLineDuplicateResult {
    const duplicatedCells: CellWithIndex[] = [];
    const values = key === "clue" ? virtualLine.map((x) => x.clue) : virtualLine.map((x) => x.clue ?? x.inputValue);
    values.forEach(
      (x, ix, arr) => x && arr.some((y, iy) => ix !== iy && x === y && duplicatedCells.push(virtualLine[ix]))
    );
    const haveDuplicate = duplicatedCells.length > 0;
    return { haveDuplicate, duplicatedCells };
  }

  private removeDuplicatesInputValueData(data: InputValueData[]) {
    return data.filter(
      (cur, index, self) =>
        index ===
        self.findIndex((x) => x.rowIndex === cur.rowIndex && x.columnIndex === cur.columnIndex && x.value === cur.value)
    );
  }

  validatePuzzle(type: Extract<keyof CellWithIndex, "clue" | "inputValue">): {
    isValid: boolean;
    detail: Record<"row" | "column" | "box", CheckVirtualLineDuplicateResult[]>;
  } {
    const allRows = this.getAllRows();
    const allColumns = this.getAllColumns();
    const allBoxes = this.getAllBoxes();

    const rowDetail = allRows.map((x) => this.checkVirtualLineDuplicate(x, type));
    const columnDetail = allColumns.map((x) => this.checkVirtualLineDuplicate(x, type));
    const boxDetail = allBoxes.map((x) => this.checkVirtualLineDuplicate(x, type));
    const detail = {
      row: rowDetail,
      column: columnDetail,
      box: boxDetail,
    };
    const isValid =
      !rowDetail.some((x) => x.haveDuplicate) &&
      !columnDetail.some((x) => x.haveDuplicate) &&
      !boxDetail.some((x) => x.haveDuplicate);

    return { isValid, detail };
  }

  getCombinedMissing() {
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
          const typedKey = key as Element;
          if (missingRow[typedKey] && missingColumn[typedKey] && missingBox[typedKey]) {
            candidates[typedKey] = true;
          }
        }

        this.setCandidates(i, j, candidates);
      }
    }
  }

  rowColumnLockInBox(type: "row" | "column", index: number): InputValueData[] {
    const result: InputValueData[] = [];
    const missing = type === "row" ? this.elementMissing.rows[index] : this.elementMissing.columns[index];
    const relatedBoxes = type === "row" ? this.getAllRelatedBoxesInLine(index) : this.getAllRelatedBoxesInColumn(index);

    for (const key in missing) {
      const sudokuElement = key as Element;
      if (!missing[sudokuElement]) continue;

      const boxContained = relatedBoxes.map((box) =>
        box.some(
          (cell) =>
            (type === "row" ? cell.rowIndex : cell.columnIndex) === index &&
            !cell.clue &&
            !cell.inputValue &&
            cell.candidates &&
            cell.candidates[sudokuElement]
        )
      );

      const numberOfBoxContained = boxContained.reduce((acc, cur) => acc + (cur ? 1 : 0), 0);
      if (numberOfBoxContained === 1) {
        const lockedBox = relatedBoxes[boxContained.indexOf(true)];
        const excludedCells = lockedBox.filter(
          (x) =>
            (type === "row" ? x.rowIndex : x.columnIndex) !== index &&
            !x.clue &&
            !x.inputValue &&
            x.candidates &&
            x.candidates[sudokuElement]
        );
        excludedCells.forEach((cell) =>
          result.push({ rowIndex: cell.rowIndex, columnIndex: cell.columnIndex, value: sudokuElement })
        );
      }
    }

    return result;
  }

  boxLockInRowColumn(type: "row" | "column", boxIndex: number): InputValueData[] {
    const result: InputValueData[] = [];
    const missing = this.elementMissing.boxes[boxIndex];
    const relatedLines = this.getAllRelatedLinesInBox(type, boxIndex);
    const box = this.getAllBoxes()[boxIndex];

    for (const key in missing) {
      const sudokuElement = key as Element;
      if (!missing[sudokuElement]) continue;

      const cellsContained = box.filter((x) => !x.clue && !x.inputValue && x.candidates && x.candidates[sudokuElement]);
      const allInSameLine =
        cellsContained.length &&
        cellsContained.every((x) =>
          type === "row" ? x.rowIndex === cellsContained[0].rowIndex : x.columnIndex === cellsContained[0].columnIndex
        );
      if (allInSameLine) {
        const lineIndex = type === "row" ? cellsContained[0].rowIndex : cellsContained[0].columnIndex;
        const virtualLine = relatedLines.find((x) => (type === "row" ? x[0].rowIndex : x[0].columnIndex) === lineIndex);
        if (!virtualLine) continue;
        const excludedCells = virtualLine.filter(
          (x) =>
            this.getBoxIndex(x.rowIndex, x.columnIndex) !== boxIndex &&
            !x.clue &&
            !x.inputValue &&
            x.candidates &&
            x.candidates[sudokuElement]
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

    const row = idx.map((x) => this.rowColumnLockInBox("row", x));
    const column = idx.map((x) => this.rowColumnLockInBox("column", x));
    const boxRow = idx.map((x) => this.boxLockInRowColumn("row", x));
    const boxColumn = idx.map((x) => this.boxLockInRowColumn("column", x));

    const arr: InputValueData[] = [...row.flat(), ...column.flat(), ...boxRow.flat(), ...boxColumn.flat()];
    return this.removeDuplicatesInputValueData(arr);
  }

  removeElementInCandidates(inputValueDataArr: InputValueData[]): boolean {
    if (!inputValueDataArr.length) {
      return false;
    } else {
      inputValueDataArr.forEach((inputValueData) => {
        const { rowIndex, columnIndex, value } = inputValueData;
        const cell = this.grid[rowIndex][columnIndex];
        if (cell.candidates) {
          cell.candidates[value] = false;
        }
      });
      return true;
    }
  }

  getUniqueCandidate(candidates: Candidates): Element | null {
    const entries = Object.entries(candidates) as [Element, boolean][];
    const candidatesArr = entries.filter(([_, value]) => value);
    if (candidatesArr.length === 1) {
      return candidatesArr[0][0];
    } else {
      return null;
    }
  }

  getUniqueMissing(type: "row" | "column" | "box") {
    const allVirtualLines =
      type === "row" ? this.getAllRows() : type === "column" ? this.getAllColumns() : this.getAllBoxes();
    const missingArr =
      type === "row"
        ? this.elementMissing.rows
        : type === "column"
        ? this.elementMissing.columns
        : this.elementMissing.boxes;

    const result = [];

    for (let i = 0; i < allVirtualLines.length; i++) {
      const virtualLine = allVirtualLines[i];
      const missing = missingArr[i];
      const uniqueMissing = this.getUniqueCandidate(missing);

      if (uniqueMissing) {
        const cell = virtualLine.find((x) => !x.clue && !x.inputValue);
        if (cell) {
          const rowIndex = cell.rowIndex;
          const columnIndex = cell.columnIndex;
          result.push({ rowIndex, columnIndex, value: uniqueMissing });
        }
      }
    }
    return result;
  }

  getNakedSingles(): InputValueData[] {
    if (!this.isValid) return [];

    const arr: InputValueData[] = [];

    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        const cell = this.grid[i][j];
        if (cell.clue || cell.inputValue || !cell.candidates) {
          continue;
        }
        const candidates = cell.candidates;
        const entries = Object.entries(candidates) as [Element, boolean][];
        const candidatesArr = entries.filter(([_, value]) => value);
        if (candidatesArr.length === 1) {
          arr.push({ rowIndex: i, columnIndex: j, value: candidatesArr[0][0] });
        }
      }
    }

    return arr;
  }

  getHiddenSinglesHelper(virtualLines: VirtualLine[]): InputValueData[] {
    const arr: InputValueData[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const candidatesCount = hiddenCandidatesCount();
      for (let j = 0; j < virtualLine.length; j++) {
        const cell = virtualLine[j];
        if (cell.clue || cell.inputValue || !cell.candidates) {
          continue;
        }
        const candidates = cell.candidates;
        for (const key in candidates) {
          const sudokuElement = key as Element;
          if (candidates[sudokuElement]) {
            candidatesCount[sudokuElement]++;
          }
        }
      }

      for (const key in candidatesCount) {
        const sudokuElement = key as Element;
        if (candidatesCount[sudokuElement] === 1) {
          const cell = virtualLine.find((x) => x.candidates && x.candidates[sudokuElement]);
          if (cell) {
            arr.push({ rowIndex: cell.rowIndex, columnIndex: cell.columnIndex, value: sudokuElement });
            break;
          }
        }
      }
    }

    return arr;
  }

  getHiddenSingles(): InputValueData[] {
    if (!this.isValid) return [];

    const rowResult = this.getHiddenSinglesHelper(this.getAllRows());
    const columnResult = this.getHiddenSinglesHelper(this.getAllColumns());
    const boxResult = this.getHiddenSinglesHelper(this.getAllBoxes());

    const arr: InputValueData[] = this.removeDuplicatesInputValueData([...rowResult, ...columnResult, ...boxResult]);

    return arr;
  }

  numberOfCandidates(cell: Cell): number {
    if (!cell.candidates) return 0;
    const entries = Object.entries(cell.candidates) as [Element, boolean][];
    const candidatesArr = entries.filter(([_, value]) => value);
    return candidatesArr.length;
  }

  getCandidatesArr(candidates: Candidates): Element[] {
    const entries = Object.entries(candidates) as [Element, boolean][];
    const candidatesArr = entries.filter(([_, value]) => value);
    return candidatesArr.map(([sudokuElement]) => sudokuElement);
  }

  getNakedPairsHelper(virtualLines: VirtualLine[]): {
    pairs: [CellWithIndex, CellWithIndex][];
    elimination: InputValueData[];
  }[] {
    const result: {
      pairs: [CellWithIndex, CellWithIndex][];
      elimination: InputValueData[];
    }[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const cellWith2Candidates = virtualLine.filter((x) => this.numberOfCandidates(x) === 2);
      if (cellWith2Candidates.length < 2) continue;

      const comb: [CellWithIndex, CellWithIndex][] = CalcUtil.combinations(cellWith2Candidates, 2);

      const pairs: [CellWithIndex, CellWithIndex][] = [
        ...comb.filter(([x, y]) => x.candidates && y.candidates && ObjUtil.shallowEquality(x.candidates, y.candidates)),
      ];
      if (!pairs.length) continue;
      const elimination: InputValueData[] = [];
      pairs.forEach(([x, y]) => {
        const candidates = x.candidates;
        if (!candidates) return;
        const elements = this.getCandidatesArr(candidates);
        const [c1, c2] = elements;
        const restCells = virtualLine.filter(
          (z) =>
            !(z.rowIndex === x.rowIndex && z.columnIndex === x.columnIndex) &&
            !(z.rowIndex === y.rowIndex && z.columnIndex === y.columnIndex)
        );
        restCells.forEach((z) => {
          if (z.candidates && z.candidates[c1]) {
            elimination.push({ rowIndex: z.rowIndex, columnIndex: z.columnIndex, value: c1 });
          }

          if (z.candidates && z.candidates[c2]) {
            elimination.push({ rowIndex: z.rowIndex, columnIndex: z.columnIndex, value: c2 });
          }
        });
      });

      result.push({ pairs, elimination });
    }

    return result;
  }

  getNakedPairs(): InputValueData[] {
    if (!this.isValid) return [];

    const rowResult = this.getNakedPairsHelper(this.getAllRows());
    const columnResult = this.getNakedPairsHelper(this.getAllColumns());
    const boxResult = this.getNakedPairsHelper(this.getAllBoxes());
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return elimination;
  }

  isCandidateIsSubset(subset: Candidates, superset: Candidates): boolean {
    for (const key in subset) {
      const sudokuElement = key as Element;
      if (subset[sudokuElement] && !superset[sudokuElement]) {
        return false;
      }
    }

    return true;
  }

  getMultipleNakedHelper(
    virtualLines: VirtualLine[],
    sizeOfCandidate: number
  ): {
    multiple: CellWithIndex[];
    elimination: InputValueData[];
  }[] {
    const result: {
      multiple: CellWithIndex[];
      elimination: InputValueData[];
    }[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];

      const emptyCells = virtualLine.filter((x) => !x.clue && !x.inputValue);
      const missingInVirtualLine = this.missingInVirtualLine(virtualLine);
      const missingArr = this.getCandidatesArr(missingInVirtualLine);
      if (missingArr.length < sizeOfCandidate) continue;
      const combinations = CalcUtil.combinations(missingArr, sizeOfCandidate);

      for (const comb of combinations) {
        const superset = candidatesFromArr(comb);
        const subsetCells = emptyCells.filter((x) => x.candidates && this.isCandidateIsSubset(x.candidates, superset));

        if (subsetCells.length === sizeOfCandidate) {
          const multiple: CellWithIndex[] = subsetCells;
          const elimination: InputValueData[] = [];

          const restCells = emptyCells.filter(
            (x) => !subsetCells.some((y) => y.rowIndex === x.rowIndex && y.columnIndex === x.columnIndex)
          );
          // const restCellsContainerAnyCandidateInComb = restCells.some(
          //   (x) => x.candidates && this.getCandidatesArr(x.candidates).some((y) => comb.includes(y))
          // );
          // if (restCellsContainerAnyCandidateInComb) continue;

          restCells.forEach((cell) => {
            for (const sudokuElement of comb) {
              if (cell.candidates && cell.candidates[sudokuElement]) {
                elimination.push({ rowIndex: cell.rowIndex, columnIndex: cell.columnIndex, value: sudokuElement });
              }
            }
          });

          result.push({ multiple, elimination });
        }
      }
    }

    return result;
  }

  getNakedTriplets(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 3;
    const rowResult = this.getMultipleNakedHelper(this.getAllRows(), size);
    const columnResult = this.getMultipleNakedHelper(this.getAllColumns(), size);
    const boxResult = this.getMultipleNakedHelper(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return elimination;
  }

  getNakedQuads(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 4;
    const rowResult = this.getMultipleNakedHelper(this.getAllRows(), size);
    const columnResult = this.getMultipleNakedHelper(this.getAllColumns(), size);
    const boxResult = this.getMultipleNakedHelper(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return elimination;
  }

  getHiddenMultipleHelper(
    virtualLines: VirtualLine[],
    sizeOfCandidate: number
  ): {
    combination: Element[];
    multiple: CellWithIndex[];
    elimination: InputValueData[];
  }[] {
    const result: {
      combination: Element[];
      multiple: CellWithIndex[];
      elimination: InputValueData[];
    }[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];

      const emptyCells = virtualLine.filter((x) => !x.clue && !x.inputValue);
      const missingInVirtualLine = this.missingInVirtualLine(virtualLine);
      const missingArr = this.getCandidatesArr(missingInVirtualLine);
      if (missingArr.length < sizeOfCandidate) continue;
      const combinations = CalcUtil.combinations(missingArr, sizeOfCandidate);

      // !debug
      if (virtualLine.every((x) => x.rowIndex === 1)) {
        console.log("file: index.ts ~ line 811 ~ Sudoku ~ combinations", combinations);
      }
      // !debug

      for (const combination of combinations) {
        const allSubComb: Element[][] = [];

        for (let i = 1; i <= combination.length; i++) {
          const subComb = CalcUtil.combinations(combination, i);
          allSubComb.push(...subComb);
        }

        const cellsRelated = emptyCells.filter(
          (x) => x.candidates && allSubComb.some((y) => this.isCandidateIsSubset(candidatesFromArr(y), x.candidates!))
        );

        if (cellsRelated.length === sizeOfCandidate) {
          const multiple: CellWithIndex[] = cellsRelated;
          const elimination: InputValueData[] = [];

          cellsRelated.forEach((x) => {
            if (x.candidates) {
              for (const key in x.candidates) {
                const sudokuElement = key as Element;
                if (x.candidates[sudokuElement] && !combination.includes(sudokuElement)) {
                  elimination.push({
                    rowIndex: x.rowIndex,
                    columnIndex: x.columnIndex,
                    value: sudokuElement,
                  });
                }
              }
            }
          });

          result.push({ combination, multiple, elimination });
        }
      }
    }

    return result;
  }

  getHiddenPairs(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 2;
    const rowResult = this.getHiddenMultipleHelper(this.getAllRows(), size);
    const columnResult = this.getHiddenMultipleHelper(this.getAllColumns(), size);
    const boxResult = this.getHiddenMultipleHelper(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return elimination;
  }

  getHiddenTriplets(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 3;
    const rowResult = this.getHiddenMultipleHelper(this.getAllRows(), size);
    const columnResult = this.getHiddenMultipleHelper(this.getAllColumns(), size);
    const boxResult = this.getHiddenMultipleHelper(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return elimination;
  }

  getHiddenQuads(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 4;
    const rowResult = this.getHiddenMultipleHelper(this.getAllRows(), size);
    const columnResult = this.getHiddenMultipleHelper(this.getAllColumns(), size);
    const boxResult = this.getHiddenMultipleHelper(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return elimination;
  }

  getXWingSwordfishHelper(
    virtualLines: VirtualLine[],
    type: "row" | "column",
    calcType: "xWing" | "swordfish"
  ): { sudokuElement: Element; multiple: CellWithIndex[]; elimination: InputValueData[] }[] {
    const result: { sudokuElement: Element; multiple: CellWithIndex[]; elimination: InputValueData[] }[] = [];

    const size = calcType === "xWing" ? 2 : 3;
    const allElements = createAllElementsArr();

    for (const e of allElements) {
      const sudokuElement = e as Element;
      const containElement = virtualLines.map((line) =>
        line.map((x) => (x.candidates && x.candidates[sudokuElement]) ?? false)
      );
      const lineWithTwoCellsContained = containElement.reduce((acc, cur, curIndex) => {
        if (cur.filter((x) => x).length === size) {
          const cells = virtualLines[curIndex].filter((x) => x.candidates && x.candidates[sudokuElement]);
          acc.push({ element: sudokuElement, index: curIndex, cells });
        }
        return acc;
      }, [] as { element: Element; index: number; cells: CellWithIndex[] }[]);
      if (lineWithTwoCellsContained.length >= size) {
        const combinations = CalcUtil.combinations(lineWithTwoCellsContained, size);
        for (const [c1, c2, c3] of combinations) {
          const isSamePosition =
            type === "row"
              ? c1.cells[0].columnIndex === c2.cells[0].columnIndex &&
                c1.cells[1].columnIndex === c2.cells[1].columnIndex &&
                (c3 ? c1.cells[0].columnIndex === c3.cells[0].columnIndex : true)
              : c1.cells[0].rowIndex === c2.cells[0].rowIndex &&
                c1.cells[1].rowIndex === c2.cells[1].rowIndex &&
                (c3 ? c1.cells[0].rowIndex === c3.cells[0].rowIndex : true);

          if (isSamePosition) {
            const transverseIndexes =
              calcType === "xWing"
                ? type === "row"
                  ? [c1.cells[0].columnIndex, c1.cells[1].columnIndex]
                  : [c1.cells[0].rowIndex, c1.cells[1].rowIndex]
                : type === "row"
                ? [c1.cells[0].columnIndex, c1.cells[1].columnIndex, c3.cells[0].columnIndex]
                : [c1.cells[0].rowIndex, c1.cells[1].rowIndex, c3.cells[0].rowIndex];
            const multiple =
              calcType === "xWing"
                ? [c1.cells[0], c1.cells[1], c2.cells[0], c2.cells[1]]
                : [c1.cells[0], c1.cells[1], c2.cells[0], c2.cells[1], c3.cells[0], c3.cells[1]];
            const eliminationLines =
              calcType === "xWing"
                ? type === "row"
                  ? [this.getColumn(transverseIndexes[0]), this.getColumn(transverseIndexes[1])]
                  : [this.getRow(transverseIndexes[0]), this.getRow(transverseIndexes[1])]
                : type === "row"
                ? [
                    this.getColumn(transverseIndexes[0]),
                    this.getColumn(transverseIndexes[1]),
                    this.getColumn(transverseIndexes[1]),
                  ]
                : [
                    this.getRow(transverseIndexes[0]),
                    this.getRow(transverseIndexes[1]),
                    this.getRow(transverseIndexes[1]),
                  ];
            const elimination: InputValueData[] = [];
            eliminationLines.forEach((line) => {
              line.forEach((cell) => {
                if (cell.candidates && cell.candidates[sudokuElement]) {
                  if (!multiple.some((x) => x.rowIndex === cell.rowIndex && x.columnIndex === cell.columnIndex)) {
                    elimination.push({
                      rowIndex: cell.rowIndex,
                      columnIndex: cell.columnIndex,
                      value: sudokuElement,
                    });
                  }
                }
              });
            });
            result.push({ sudokuElement, multiple, elimination });
          }
        }
      }
    }

    return result;
  }

  getXWing(): InputValueData[] {
    if (!this.isValid) return [];

    const rowResult = this.getXWingSwordfishHelper(this.getAllRows(), "row", "xWing");
    const columnResult = this.getXWingSwordfishHelper(this.getAllColumns(), "column", "xWing");
    const elimination = [...rowResult, ...columnResult].flatMap((x) => x.elimination);

    return elimination;
  }

  // todo the swordfish may not need all rows/cols to have exactly 3 cells
  getSwordfish(): InputValueData[] {
    if (!this.isValid) return [];

    const rowResult = this.getXWingSwordfishHelper(this.getAllRows(), "row", "swordfish");
    const columnResult = this.getXWingSwordfishHelper(this.getAllColumns(), "column", "swordfish");
    const elimination = [...rowResult, ...columnResult].flatMap((x) => x.elimination);

    return elimination;
  }

  getYWingHelper(): {
    pivot: CellWithIndex;
    pincers: [CellWithIndex, CellWithIndex];
    elimination: InputValueData | null;
  }[] {
    const result: {
      pivot: CellWithIndex;
      pincers: [CellWithIndex, CellWithIndex];
      elimination: InputValueData | null;
    }[] = [];
    const cellsWithTwoCandidates = this.grid.map((row) =>
      row.map((cell) => (cell.candidates && this.numberOfCandidates(cell) === 2) ?? false)
    );

    const cellsWithTwoCandidatesAndOneIsAorB = (
      cell: CellWithIndex,
      a: Element,
      b: Element
    ): null | { rowIndex: number; columnIndex: number; same: Element; diff: Element } => {
      if (!cell.candidates) return null;
      const candidates = cell.candidates;
      const numberOfCandidates = this.numberOfCandidates(cell);
      if (numberOfCandidates !== 2) return null;
      if (!CalcUtil.xor(candidates[a], candidates[b])) return null;
      const rowIndex = cell.rowIndex;
      const columnIndex = cell.columnIndex;
      const same = candidates[a] ? a : b;
      const diff = this.getCandidatesArr(cell.candidates).filter((x) => x !== same)[0];
      return { rowIndex, columnIndex, same, diff };
    };

    const possiblePincersFromLine = (line: VirtualLine, pivot: CellWithIndex, a: Element, b: Element) => {
      return line.reduce((acc, cur, arr) => {
        if (cur.rowIndex === pivot.rowIndex && cur.columnIndex === pivot.columnIndex) return acc;
        const pincer = cellsWithTwoCandidatesAndOneIsAorB(cur, a, b);
        if (pincer) acc.push({ ...pincer, line });
        return acc;
      }, [] as { rowIndex: number; columnIndex: number; same: Element; diff: Element; line: VirtualLine }[]);
    };

    for (let i = 0; i < cellsWithTwoCandidates.length; i++) {
      for (let j = 0; j < cellsWithTwoCandidates[i].length; j++) {
        if (!cellsWithTwoCandidates[i][j]) continue;
        const pivot = { ...this.grid[i][j], rowIndex: i, columnIndex: j };
        if (!pivot.candidates) continue;
        const [a, b] = this.getCandidatesArr(pivot.candidates);
        const pivotRow = this.getRow(i);
        const pivotColumn = this.getColumn(j);
        const pivotBox = this.getBoxFromRowColumnIndex(i, j);
        const possibleRowPincers = possiblePincersFromLine(pivotRow, pivot, a, b);
        const possibleColumnPincers = possiblePincersFromLine(pivotColumn, pivot, a, b);
        const possibleBoxPincers = possiblePincersFromLine(pivotBox, pivot, a, b);

        const rowColumnProduct = CalcUtil.cartesianProduct(possibleRowPincers, possibleColumnPincers).filter(
          ([a, b]) => a.same !== b.same && a.diff === b.diff
        );
        console.log("file: index.ts ~ line 970 ~ Sudoku ~ getYWingHelper ~ rowColumnProduct", rowColumnProduct);
        const rowBoxProduct = CalcUtil.cartesianProduct(possibleRowPincers, possibleBoxPincers)
          .filter(([a, b]) => a.rowIndex === b.rowIndex && a.columnIndex === b.columnIndex)
          .filter(([a, b]) => a.same !== b.same && a.diff === b.diff);
        console.log("file: index.ts ~ line 972 ~ Sudoku ~ getYWingHelper ~ rowBoxProduct", rowBoxProduct);
        const columnBoxProduct = CalcUtil.cartesianProduct(possibleColumnPincers, possibleBoxPincers)
          .filter(([a, b]) => a.rowIndex === b.rowIndex && a.columnIndex === b.columnIndex)
          .filter(([a, b]) => a.same !== b.same && a.diff === b.diff);
        console.log("file: index.ts ~ line 976 ~ Sudoku ~ getYWingHelper ~ columnBoxProduct", columnBoxProduct);
        const validatePincer = [...rowColumnProduct, ...rowBoxProduct, ...columnBoxProduct];
        if (!validatePincer.length) continue;
        console.log(validatePincer);

        validatePincer.forEach((x) => {
          const pincers = x;
          let elimination: InputValueData | null = null;
          // !wrong type here
          const p1Intersection = this.getCellIntersections(pincers[0]);
          // !wrong type here
          const p2Intersection = this.getCellIntersections(pincers[1]);
          const intersection = this.getVirtualLinesIntersections(p1Intersection, p2Intersection).filter(
            (x) => !Sudoku.isSamePos(x, pivot)
          );
          intersection.forEach((x) => {
            if (x.candidates && x.candidates[pincers[0].diff]) {
              elimination = { rowIndex: x.rowIndex, columnIndex: x.columnIndex, value: pincers[0].diff };
            }
          });
          result.push({ pivot, pincers, elimination });
        });
      }
    }

    console.log("file: index.ts ~ line 994 ~ Sudoku ~ getYWingHelper ~ result", result);
    return result;
  }

  getYWing(): InputValueData[] {
    if (!this.isValid) return [];

    const elimination = this.getYWingHelper()
      .flatMap((x) => x.elimination)
      .filter((x) => x) as InputValueData[];
    return elimination;
  }

  setRowUniqueMissing(): boolean {
    const uniqueMissing = this.getUniqueMissing("row");
    if (uniqueMissing.length) {
      this.setInputValue(uniqueMissing);
      this.stats.rowUniqueMissing += uniqueMissing.length;
      return true;
    } else {
      return false;
    }
  }

  setColumnUniqueMissing(): boolean {
    const uniqueMissing = this.getUniqueMissing("column");
    if (uniqueMissing.length) {
      this.setInputValue(uniqueMissing);
      this.stats.columnUniqueMissing += uniqueMissing.length;
      return true;
    } else {
      return false;
    }
  }

  setBoxUniqueMissing(): boolean {
    const uniqueMissing = this.getUniqueMissing("box");
    if (uniqueMissing.length) {
      this.setInputValue(uniqueMissing);
      this.stats.boxUniqueMissing += uniqueMissing.length;
      return true;
    } else {
      return false;
    }
  }

  setNakedSingles(): boolean {
    const nakedSingles = this.getNakedSingles();
    if (nakedSingles.length) {
      this.setInputValue(nakedSingles);
      this.stats.nakedSingles += nakedSingles.length;
      return true;
    } else {
      return false;
    }
  }

  setHiddenSingles(): boolean {
    const hiddenSingles = this.getHiddenSingles();

    if (hiddenSingles.length) {
      this.setInputValue(hiddenSingles);
      this.stats.hiddenSingles += hiddenSingles.length;
      return true;
    } else {
      return false;
    }
  }

  trySolve(): void {
    if (this.isValid) {
      if (this.setRowUniqueMissing()) return this.trySolve();
      if (this.setColumnUniqueMissing()) return this.trySolve();
      if (this.setBoxUniqueMissing()) return this.trySolve();

      this.getCombinedMissing();
      if (this.setNakedSingles()) return this.trySolve();
      if (this.setHiddenSingles()) return this.trySolve();

      const removalDueToLockedCandidates = this.getRemovalDueToLockedCandidates();
      if (removalDueToLockedCandidates.length) {
        this.removeElementInCandidates(removalDueToLockedCandidates);
        if (this.setNakedSingles()) return this.trySolve();
        if (this.setHiddenSingles()) return this.trySolve();
      }

      const nakedPairsElimination = this.getNakedPairs();
      if (nakedPairsElimination.length) {
        this.removeElementInCandidates(nakedPairsElimination);
        if (this.setNakedSingles()) return this.trySolve();
        if (this.setHiddenSingles()) return this.trySolve();
      }

      const nakedTripletsElimination = this.getNakedTriplets();
      if (nakedTripletsElimination.length) {
        this.removeElementInCandidates(nakedTripletsElimination);
        if (this.setNakedSingles()) return this.trySolve();
        if (this.setHiddenSingles()) return this.trySolve();
      }

      const nakedQuadsElimination = this.getNakedQuads();
      if (nakedQuadsElimination.length) {
        this.removeElementInCandidates(nakedQuadsElimination);
        if (this.setNakedSingles()) return this.trySolve();
        if (this.setHiddenSingles()) return this.trySolve();
      }

      const hiddenPairsElimination = this.getHiddenPairs();
      if (hiddenPairsElimination.length) {
        this.removeElementInCandidates(hiddenPairsElimination);
        if (this.setNakedSingles()) return this.trySolve();
        if (this.setHiddenSingles()) return this.trySolve();
      }

      const hiddenTripletsElimination = this.getHiddenTriplets();
      if (hiddenTripletsElimination.length) {
        this.removeElementInCandidates(hiddenTripletsElimination);
        if (this.setNakedSingles()) return this.trySolve();
        if (this.setHiddenSingles()) return this.trySolve();
      }

      const hiddenQuadsElimination = this.getHiddenQuads();
      if (hiddenQuadsElimination.length) {
        this.removeElementInCandidates(hiddenQuadsElimination);
        if (this.setNakedSingles()) return this.trySolve();
        if (this.setHiddenSingles()) return this.trySolve();
      }

      const xWingElimination = this.getXWing();
      if (xWingElimination.length) {
        this.removeElementInCandidates(xWingElimination);
        if (this.setNakedSingles()) return this.trySolve();
        if (this.setHiddenSingles()) return this.trySolve();
      }

      const swordfishElimination = this.getSwordfish();
      if (swordfishElimination.length) {
        this.removeElementInCandidates(swordfishElimination);
        if (this.setNakedSingles()) return this.trySolve();
        if (this.setHiddenSingles()) return this.trySolve();
      }

      const yWingElimination = this.getYWing();
      if (yWingElimination.length) {
        this.removeElementInCandidates(yWingElimination);
        if (this.setNakedSingles()) return this.trySolve();
        if (this.setHiddenSingles()) return this.trySolve();
      }

      return;
    }
  }
}
