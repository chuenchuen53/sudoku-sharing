import ArrayUtils from "@/utils/ArrayUtil";
import CalcUtil from "@/utils/CalcUtil";
import ObjUtil from "@/utils/ObjUtil";

type SudokuIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type SudokuElement = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";

type Candidates = {
  [key in SudokuElement]: boolean;
};

interface Cell {
  clue?: SudokuElement;
  inputValue?: SudokuElement;
  candidates?: Candidates;
}
type SudokuRow = Cell[];
type Puzzle = SudokuRow[];

interface InputValueData {
  rowIndex: number;
  columnIndex: number;
  value: SudokuElement;
}

interface CellWithIndex extends Cell {
  rowIndex: number;
  columnIndex: number;
}

type VirtualLine = CellWithIndex[];

interface ElementMissing {
  rows: Candidates[];
  columns: Candidates[];
  boxes: Candidates[];
}

interface Stats {
  rowUniqueMissing: number;
  columnUniqueMissing: number;
  boxUniqueMissing: number;
  nakedSingles: number;
  hiddenSingles: number;
}

const allElementsFactory = () => ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

const statsTemplate: () => Stats = () => ({
  rowUniqueMissing: 0,
  columnUniqueMissing: 0,
  boxUniqueMissing: 0,
  nakedSingles: 0,
  hiddenSingles: 0,
});

const candidatesTemplate = (defaultValue: boolean) => ({
  "1": defaultValue,
  "2": defaultValue,
  "3": defaultValue,
  "4": defaultValue,
  "5": defaultValue,
  "6": defaultValue,
  "7": defaultValue,
  "8": defaultValue,
  "9": defaultValue,
});

const candidatesFromArr = (arr: SudokuElement[]) => {
  const candidates = candidatesTemplate(false);
  arr.forEach((x) => (candidates[x] = true));
  return candidates;
};

const hiddenCandidatesTemplate = () => ({
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
  public puzzle: Puzzle;
  public isValid: boolean;
  public stats: Stats;
  public numberOfClues: number;

  private elementMissing: ElementMissing;

  constructor(puzzle) {
    this.puzzle = this.createPuzzle(puzzle);
    this.isValid = this.validatePuzzle().clueValid;
    this.stats = statsTemplate();
    this.elementMissing = this.updateElementMissing();
    this.numberOfClues = this.getNumberOfClues();
  }

  private getNumberOfClues() {
    return this.puzzle.reduce((acc, row) => acc + row.reduce((acc, cell) => (cell.clue ? acc + 1 : acc), 0), 0);
  }

  private updateElementMissing() {
    const rows = this.getAllRows().map((x) => this.missingInVirtualLine(x));
    const columns = this.getAllColumns().map((x) => this.missingInVirtualLine(x));
    const boxes = this.getAllBoxes().map((x) => this.missingInVirtualLine(x));

    this.elementMissing = {
      rows,
      columns,
      boxes,
    };

    return this.elementMissing;
  }

  createPuzzle(clues?: (SudokuElement | null)[][]): Puzzle {
    const puzzle: Puzzle = ArrayUtils.create2DArray(9, 9, {});
    if (!clues) return puzzle;

    for (let i = 0; i < clues.length; i++) {
      for (let j = 0; j < clues[i].length; j++) {
        const clue = clues[i][j];
        if (clue) {
          puzzle[i][j].clue = clue;
        }
      }
    }

    return puzzle;
  }

  getRow(rowIndex: number): VirtualLine {
    return this.puzzle[rowIndex].map((x, columnIndex) => ({
      ...x,
      rowIndex,
      columnIndex,
    }));
  }

  getColumn(columnIndex: number): VirtualLine {
    return this.puzzle.map((row, rowIndex) => ({
      ...row[columnIndex],
      rowIndex,
      columnIndex,
    }));
  }

  getBox(rowIndex: number, columnIndex: number): VirtualLine {
    const box: VirtualLine = [];
    const boxRowIndex = this.boxFirstRowOrColumnIndex(rowIndex);
    const boxColumnIndex = this.boxFirstRowOrColumnIndex(columnIndex);
    for (let i = boxRowIndex; i < boxRowIndex + 3; i++) {
      for (let j = boxColumnIndex; j < boxColumnIndex + 3; j++) {
        box.push({
          ...this.puzzle[i][j],
          rowIndex: i,
          columnIndex: j,
        });
      }
    }
    return box;
  }

  getAllRows(): VirtualLine[] {
    return this.puzzle.map((_, rowIndex) => this.getRow(rowIndex));
  }

  getAllColumns(): VirtualLine[] {
    return this.puzzle[0].map((_, columnIndex) => this.getColumn(columnIndex));
  }

  getAllBoxes(): VirtualLine[] {
    const boxes: VirtualLine[] = [];
    for (let i = 0; i < 9; i += 3) {
      for (let j = 0; j < 9; j += 3) {
        boxes.push(this.getBox(i, j));
      }
    }
    return boxes;
  }

  getAllRelatedBoxesInRow(rowIndex: number): VirtualLine[] {
    const boxes: VirtualLine[] = [];
    for (let i = 0; i < 9; i += 3) {
      boxes.push(this.getBox(rowIndex, i));
    }
    return boxes;
  }

  getAllRelatedBoxesInColumn(columnIndex: number): VirtualLine[] {
    const boxes: VirtualLine[] = [];
    for (let i = 0; i < 9; i += 3) {
      boxes.push(this.getBox(i, columnIndex));
    }
    return boxes;
  }

  getAllRelatedLinesInBox(type: "row" | "column", boxIndex: number): VirtualLine[] {
    if (type === "row") {
      const boxRowIndex = this.boxFirstRowOrColumnIndex(boxIndex);
      return [this.getRow(boxRowIndex), this.getRow(boxRowIndex + 1), this.getRow(boxRowIndex + 2)];
    } else {
      const boxColumnIndex = this.boxFirstRowOrColumnIndex(boxIndex);
      return [this.getColumn(boxColumnIndex), this.getColumn(boxColumnIndex + 1), this.getColumn(boxColumnIndex + 2)];
    }
  }

  boxFirstRowOrColumnIndex(index: number) {
    return Math.floor(index / 3) * 3;
  }

  getAllCellsInRelatedVirtualLines(rowIndex: number, columnIndex: number): { rowIndex: number; columnIndex: number }[] {
    const row = this.getRow(rowIndex);
    const column = this.getColumn(columnIndex);
    const box = this.getBox(rowIndex, columnIndex);
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
    this.puzzle[rowIndex][columnIndex].candidates = { ...candidates };
  }

  setInputValue(data: InputValueData[]) {
    if (!data.length) return;

    data.forEach(({ rowIndex, columnIndex, value }) => {
      if (this.puzzle[rowIndex][columnIndex].clue) {
        console.error("Cannot set input value to a cell with a clue");
        return;
      }

      this.puzzle[rowIndex][columnIndex].inputValue = value;
      this.puzzle[rowIndex][columnIndex].candidates = undefined;
      const { inputValueValid } = this.validatePuzzle();
      this.isValid = inputValueValid;
    });
    this.updateElementMissing();
    this.getCombinedMissing();
  }

  clearAllCandidates() {
    for (let i = 0; i < this.puzzle.length; i++) {
      for (let j = 0; j < this.puzzle[i].length; j++) {
        this.puzzle[i][j].candidates = undefined;
      }
    }
  }

  missingInVirtualLine(virtualLine: VirtualLine) {
    const missing = candidatesTemplate(true);
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
  ) {
    const arr = key === "clue" ? virtualLine.map((x) => x.clue) : virtualLine.map((x) => x.clue ?? x.inputValue);
    const { haveDuplicate } = ArrayUtils.checkDuplicates(arr);
    return haveDuplicate;
  }

  private removeDuplicatesInputValueData(data: InputValueData[]) {
    return data.filter(
      (cur, index, self) =>
        index ===
        self.findIndex((x) => x.rowIndex === cur.rowIndex && x.columnIndex === cur.columnIndex && x.value === cur.value)
    );
  }

  validatePuzzle() {
    const allRows = this.getAllRows();
    const allColumns = this.getAllColumns();
    const allBoxes = this.getAllBoxes();

    const rowClueValid = allRows.every((row) => !this.checkVirtualLineDuplicate(row, "clue"));
    const columnClueValid = allColumns.every((column) => !this.checkVirtualLineDuplicate(column, "clue"));
    const boxClueValid = allBoxes.every((box) => !this.checkVirtualLineDuplicate(box, "clue"));
    const clueValid = rowClueValid && columnClueValid && boxClueValid;

    const rowInputValueValid = allRows.every((row) => !this.checkVirtualLineDuplicate(row, "inputValue"));
    const columnInputValueValid = allColumns.every((column) => !this.checkVirtualLineDuplicate(column, "inputValue"));
    const boxInputValueValid = allBoxes.every((box) => !this.checkVirtualLineDuplicate(box, "inputValue"));
    const inputValueValid = rowInputValueValid && columnInputValueValid && boxInputValueValid;

    return { clueValid, inputValueValid };
  }

  getCombinedMissing() {
    const missingInRows = this.elementMissing.rows;
    const missingInColumns = this.elementMissing.columns;
    const missingInBoxes = this.elementMissing.boxes;

    for (let i = 0; i < this.puzzle.length; i++) {
      for (let j = 0; j < this.puzzle[i].length; j++) {
        if (this.puzzle[i][j].clue || this.puzzle[i][j].inputValue) continue;

        const boxIndex = this.getBoxIndex(i, j);
        const missingRow = missingInRows[i];
        const missingColumn = missingInColumns[j];
        const missingBox = missingInBoxes[boxIndex];
        const candidates = candidatesTemplate(false);

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

  rowColumnLockInBox(type: "row" | "column", index: number): InputValueData[] {
    const result: InputValueData[] = [];
    const missing = type === "row" ? this.elementMissing.rows[index] : this.elementMissing.columns[index];
    const relatedBoxes = type === "row" ? this.getAllRelatedBoxesInRow(index) : this.getAllRelatedBoxesInColumn(index);

    for (const key in missing) {
      const sudokuElement = key as SudokuElement;
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
      const sudokuElement = key as SudokuElement;
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
        const cell = this.puzzle[rowIndex][columnIndex];
        if (cell.candidates) {
          cell.candidates[value] = false;
        }
      });
      return true;
    }
  }

  getUniqueCandidate(candidates: Candidates): SudokuElement | null {
    const entries = Object.entries(candidates) as [SudokuElement, boolean][];
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

    for (let i = 0; i < this.puzzle.length; i++) {
      for (let j = 0; j < this.puzzle[i].length; j++) {
        const cell = this.puzzle[i][j];
        if (cell.clue || cell.inputValue || !cell.candidates) {
          continue;
        }
        const candidates = cell.candidates;
        const entries = Object.entries(candidates) as [SudokuElement, boolean][];
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
      const candidatesCount = hiddenCandidatesTemplate();
      for (let j = 0; j < virtualLine.length; j++) {
        const cell = virtualLine[j];
        if (cell.clue || cell.inputValue || !cell.candidates) {
          continue;
        }
        const candidates = cell.candidates;
        for (const key in candidates) {
          const sudokuElement = key as SudokuElement;
          if (candidates[sudokuElement]) {
            candidatesCount[sudokuElement]++;
          }
        }
      }

      for (const key in candidatesCount) {
        const sudokuElement = key as SudokuElement;
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
    const entries = Object.entries(cell.candidates) as [SudokuElement, boolean][];
    const candidatesArr = entries.filter(([_, value]) => value);
    return candidatesArr.length;
  }

  getCandidatesArr(candidates: Candidates): SudokuElement[] {
    const entries = Object.entries(candidates) as [SudokuElement, boolean][];
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
      const sudokuElement = key as SudokuElement;
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
    combination: SudokuElement[];
    multiple: CellWithIndex[];
    elimination: InputValueData[];
  }[] {
    const result: {
      combination: SudokuElement[];
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
        const allSubComb: SudokuElement[][] = [];

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
                const sudokuElement = key as SudokuElement;
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

  getXWingHelper(
    virtualLines: VirtualLine[],
    type: "row" | "column"
  ): { sudokuElement: SudokuElement; multiple: CellWithIndex[]; elimination: InputValueData[] }[] {
    const result: { sudokuElement: SudokuElement; multiple: CellWithIndex[]; elimination: InputValueData[] }[] = [];

    const allElements = allElementsFactory();

    for (const e of allElements) {
      const sudokuElement = e as SudokuElement;
      const containElement = virtualLines.map((line) =>
        line.map((x) => (x.candidates && x.candidates[sudokuElement]) ?? false)
      );
      const lineWithTwoCellsContained = containElement.reduce((acc, cur, curIndex) => {
        if (cur.filter((x) => x).length === 2) {
          const cells = virtualLines[curIndex].filter((x) => x.candidates && x.candidates[sudokuElement]);
          acc.push({ element: sudokuElement, index: curIndex, cells });
        }
        return acc;
      }, [] as { element: SudokuElement; index: number; cells: CellWithIndex[] }[]);
      if (lineWithTwoCellsContained.length > 1) {
        const combinations = CalcUtil.combinations(lineWithTwoCellsContained, 2);
        for (const [c1, c2] of combinations) {
          const isSamePosition =
            type === "row"
              ? c1.cells[0].columnIndex === c2.cells[0].columnIndex &&
                c1.cells[1].columnIndex === c2.cells[1].columnIndex
              : c1.cells[0].rowIndex === c2.cells[0].rowIndex && c1.cells[1].rowIndex === c2.cells[1].rowIndex;

          if (isSamePosition) {
            const transverseIndexes =
              type === "row"
                ? [c1.cells[0].columnIndex, c1.cells[1].columnIndex]
                : [c1.cells[0].rowIndex, c1.cells[1].rowIndex];

            const multiple = [c1.cells[0], c1.cells[1], c2.cells[0], c2.cells[1]];
            const eliminationLines =
              type === "row"
                ? [this.getColumn(transverseIndexes[0]), this.getColumn(transverseIndexes[1])]
                : [this.getRow(transverseIndexes[0]), this.getRow(transverseIndexes[1])];
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

    const rowResult = this.getXWingHelper(this.getAllRows(), "row");
    const columnResult = this.getXWingHelper(this.getAllColumns(), "column");
    const elimination = [...rowResult, ...columnResult].flatMap((x) => x.elimination);

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

      // const removalDueToLockedCandidates = this.getRemovalDueToLockedCandidates();
      // if (removalDueToLockedCandidates.length) {
      //   this.removeElementInCandidates(removalDueToLockedCandidates);
      //   if (this.setNakedSingles()) return this.trySolve();
      //   if (this.setHiddenSingles()) return this.trySolve();
      // }

      // const nakedPairsElimination = this.getNakedPairs();
      // if (nakedPairsElimination.length) {
      //   this.removeElementInCandidates(nakedPairsElimination);
      //   if (this.setNakedSingles()) return this.trySolve();
      //   if (this.setHiddenSingles()) return this.trySolve();
      // }

      // const nakedTripletsElimination = this.getNakedTriplets();
      // if (nakedTripletsElimination.length) {
      //   this.removeElementInCandidates(nakedTripletsElimination);
      //   if (this.setNakedSingles()) return this.trySolve();
      //   if (this.setHiddenSingles()) return this.trySolve();
      // }

      // const nakedQuadsElimination = this.getNakedQuads();
      // if (nakedQuadsElimination.length) {
      //   this.removeElementInCandidates(nakedQuadsElimination);
      //   if (this.setNakedSingles()) return this.trySolve();
      //   if (this.setHiddenSingles()) return this.trySolve();
      // }

      // const hiddenPairsElimination = this.getHiddenPairs();
      // if (hiddenPairsElimination.length) {
      //   this.removeElementInCandidates(hiddenPairsElimination);
      //   if (this.setNakedSingles()) return this.trySolve();
      //   if (this.setHiddenSingles()) return this.trySolve();
      // }

      // const hiddenTripletsElimination = this.getHiddenTriplets();
      // if (hiddenTripletsElimination.length) {
      //   this.removeElementInCandidates(hiddenTripletsElimination);
      //   if (this.setNakedSingles()) return this.trySolve();
      //   if (this.setHiddenSingles()) return this.trySolve();
      // }

      // const hiddenQuadsElimination = this.getHiddenQuads();
      // if (hiddenQuadsElimination.length) {
      //   this.removeElementInCandidates(hiddenQuadsElimination);
      //   if (this.setNakedSingles()) return this.trySolve();
      //   if (this.setHiddenSingles()) return this.trySolve();
      // }

      const xWingElimination = this.getXWing();
      if (xWingElimination.length) {
        console.log(xWingElimination);
        this.removeElementInCandidates(xWingElimination);
        if (this.setNakedSingles()) return this.trySolve();
        if (this.setHiddenSingles()) return this.trySolve();
      }

      return;
    }
  }
}
