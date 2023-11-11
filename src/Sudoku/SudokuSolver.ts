import CalcUtil from "../utils/CalcUtil";
import FillNakedSingle from "./FillNakedSingle";
import type FillStrategy from "./FillStrategy";
import FillUniqueMissing from "./FillUniqueMissing";
import Sudoku from "./Sudoku";
import { VirtualLineType } from "./type";
import type {
  RowColumn,
  SolveStats,
  Candidates,
  SudokuElement,
  VirtualLine,
  InputValueData,
  Cell,
  CandidateCell,
  HiddenMultipleFromVirtualLinesResult,
  NakedMultipleResult,
  Pincer,
  XWingSwordfishResult,
  YWingResult,
} from "./type";

export default class SudokuSolver {
  public stats: SolveStats;
  public sudoku: Sudoku;
  private fillUniqueMissing: FillStrategy = new FillUniqueMissing();
  private fillNakedSingle = new FillNakedSingle();
  private eliminationStrategies: (() => unknown)[];

  constructor(sudoku: Sudoku) {
    this.sudoku = sudoku;
    this.stats = SudokuSolver.statsTemplate();
    this.eliminationStrategies = [
      this.removeCandidatesDueToLockedCandidates.bind(this),
      this.removeCandidatesDueToNakedPairs.bind(this),
      this.removeCandidatesDueToHiddenPairs.bind(this),
      this.removeCandidatesDueToXWing.bind(this),
      this.removeCandidatesDueToYWing.bind(this),
      this.removeCandidatesDueToNakedTriplets.bind(this),
      this.removeCandidatesDueToNakedQuads.bind(this),
      this.removeCandidatesDueToHiddenTriplets.bind(this),
      this.removeCandidatesDueToHiddenQuads.bind(this),
    ];
  }

  static loopCandidates(fn: (sudokuElement: SudokuElement) => void): void {
    const allElements = Sudoku.allElements();
    for (let i = 0; i < allElements.length; i++) {
      fn(allElements[i]);
    }
  }

  static numberOfCandidates(candidates: Candidates): number {
    let count = 0;
    SudokuSolver.loopCandidates((element) => candidates[element] && count++);
    return count;
  }

  static getCandidatesArr(candidates: Candidates): SudokuElement[] {
    const result: SudokuElement[] = [];
    SudokuSolver.loopCandidates((sudokuElement) => candidates[sudokuElement] && result.push(sudokuElement));
    return result;
  }

  static candidateCellsFromVirtualLine(virtualLine: VirtualLine): CandidateCell[] {
    return virtualLine.filter((cell) => cell.candidates) as CandidateCell[];
  }

  static isSubset(candidates: Candidates, superset: SudokuElement[]): boolean {
    for (const sudokuElement of Sudoku.allElements()) {
      if (candidates[sudokuElement] && !superset.includes(sudokuElement)) return false;
    }
    return true;
  }

  static sameCandidates(x: Candidates, y: Candidates): boolean {
    for (const sudokuElement of Sudoku.allElements()) {
      if (x[sudokuElement] !== y[sudokuElement]) return false;
    }
    return true;
  }

  static getHiddenSingleFromVirtualLines(virtualLines: VirtualLine[]): InputValueData[] {
    const result: InputValueData[] = [];
    virtualLines.forEach((virtualLine) => {
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
        const candidates = cell.candidates;
        if (!candidates) return;
        SudokuSolver.loopCandidates((sudokuElement) => candidates[sudokuElement] && candidatesCount[sudokuElement]++);
      });
      SudokuSolver.loopCandidates((sudokuElement) => {
        if (candidatesCount[sudokuElement] !== 1) return;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const cell = virtualLine.find((x) => x.candidates?.[sudokuElement])!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (SudokuSolver.numberOfCandidates(cell.candidates!) === 1) return; // naked single
        result.push({ rowIndex: cell.rowIndex, columnIndex: cell.columnIndex, value: sudokuElement });
      });
    });

    return Sudoku.removeDuplicatedInputValueData(result);
  }

  static getNakedPairsFromVirtualLines(virtualLines: VirtualLine[]): NakedMultipleResult[] {
    const result: NakedMultipleResult[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const cellWith2Candidates = SudokuSolver.candidateCellsFromVirtualLine(virtualLine).filter(
        (x) => SudokuSolver.numberOfCandidates(x.candidates) === 2
      );
      if (cellWith2Candidates.length < 2) continue;

      const comb = CalcUtil.combinations2(cellWith2Candidates);
      const nakedPairs = comb.filter(([x, y]) => SudokuSolver.sameCandidates(x.candidates, y.candidates));

      nakedPairs.forEach(([x, y]) => {
        const cells = [x, y];
        const elimination: InputValueData[] = [];
        const [c1, c2] = SudokuSolver.getCandidatesArr(x.candidates);
        const restCells = virtualLine.filter((z) => !Sudoku.isSamePos(x, z) && !Sudoku.isSamePos(y, z));
        restCells.forEach(({ rowIndex, columnIndex, candidates }) => {
          if (candidates?.[c1]) elimination.push({ rowIndex, columnIndex, value: c1 });
          if (candidates?.[c2]) elimination.push({ rowIndex, columnIndex, value: c2 });
        });

        result.push({ cells, elimination });
      });
    }

    return result;
  }

  static getMultipleNakedFromVirtualLines(virtualLines: VirtualLine[], sizeOfCandidate: 3 | 4): NakedMultipleResult[] {
    const result: NakedMultipleResult[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const missingArr = SudokuSolver.getCandidatesArr(Sudoku.missingValuesInVirtualLine(virtualLine));
      if (missingArr.length < sizeOfCandidate) continue;
      const emptyCells = SudokuSolver.candidateCellsFromVirtualLine(virtualLine);
      const combinations = sizeOfCandidate === 3 ? CalcUtil.combinations3(missingArr) : CalcUtil.combinations4(missingArr);

      for (const combination of combinations) {
        const cells = emptyCells.filter((x) => SudokuSolver.isSubset(x.candidates, combination));
        if (cells.length !== sizeOfCandidate) continue;

        const elimination: InputValueData[] = [];
        const restCells = emptyCells.filter((x) => !cells.some((y) => Sudoku.isSamePos(x, y)));
        restCells.forEach(({ rowIndex, columnIndex, candidates }) => {
          for (const sudokuElement of combination) {
            if (candidates?.[sudokuElement]) elimination.push({ rowIndex, columnIndex, value: sudokuElement });
          }
        });

        result.push({ cells, elimination });
      }
    }

    return result;
  }

  static getHiddenMultipleFromVirtualLines(virtualLines: VirtualLine[], sizeOfCandidate: 2 | 3 | 4): HiddenMultipleFromVirtualLinesResult[] {
    const result: HiddenMultipleFromVirtualLinesResult[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const missingInVirtualLine = Sudoku.missingValuesInVirtualLine(virtualLine);
      const missingArr = SudokuSolver.getCandidatesArr(missingInVirtualLine);
      if (missingArr.length < sizeOfCandidate) continue;
      const emptyCells = SudokuSolver.candidateCellsFromVirtualLine(virtualLine);

      const combinations: SudokuElement[][] = CalcUtil.combinations(missingArr, sizeOfCandidate);

      for (const combination of combinations) {
        const multiple = emptyCells.filter(({ candidates }) =>
          combination.some((sudokuElement) => candidates[sudokuElement] && combination.includes(sudokuElement))
        );

        if (multiple.length !== sizeOfCandidate) continue;
        const elimination: InputValueData[] = [];

        multiple.forEach(({ rowIndex, columnIndex, candidates }) => {
          SudokuSolver.loopCandidates((sudokuElement) => {
            if (candidates[sudokuElement] && !combination.includes(sudokuElement)) {
              elimination.push({
                rowIndex,
                columnIndex,
                value: sudokuElement,
              });
            }
          });
        });

        result.push({ combination, multiple, elimination });
      }
    }

    return result;
  }

  static getXWingFromVirtualLines(
    type: VirtualLineType.ROW | VirtualLineType.COLUMN,
    virtualLines: VirtualLine[],
    perpendicularVirtualLines: VirtualLine[]
  ): XWingSwordfishResult[] {
    const result: XWingSwordfishResult[] = [];

    for (const sudokuElement of Sudoku.allElements()) {
      const gridWithElementInCandidate = virtualLines.map((line) =>
        line.map((cell) => (cell.candidates?.[sudokuElement] ? (cell as CandidateCell) : undefined))
      );

      const lineWithTwoCellsContained = gridWithElementInCandidate.reduce((acc, line) => {
        const cells = line.filter((x): x is CandidateCell => Boolean(x));
        if (cells.length === 2) acc.push({ cells });
        return acc;
      }, [] as { cells: Cell[] }[]);

      if (lineWithTwoCellsContained.length < 2) continue;

      const combinations = CalcUtil.combinations2(lineWithTwoCellsContained);
      for (const [line1, line2] of combinations) {
        const isSamePerpendicularPos =
          type === VirtualLineType.ROW
            ? line1.cells[0].columnIndex === line2.cells[0].columnIndex && line1.cells[1].columnIndex === line2.cells[1].columnIndex
            : line1.cells[0].rowIndex === line2.cells[0].rowIndex && line1.cells[1].rowIndex === line2.cells[1].rowIndex;

        if (!isSamePerpendicularPos) continue;

        const transverseIndexes =
          type === VirtualLineType.ROW
            ? [line1.cells[0].columnIndex, line1.cells[1].columnIndex]
            : [line1.cells[0].rowIndex, line1.cells[1].rowIndex];
        const multiple = [line1.cells[0], line1.cells[1], line2.cells[0], line2.cells[1]];
        const eliminationLines = [perpendicularVirtualLines[transverseIndexes[0]], perpendicularVirtualLines[transverseIndexes[1]]];
        const elimination: InputValueData[] = [];
        eliminationLines.forEach((line) => {
          line.forEach((cell) => {
            if (cell.candidates?.[sudokuElement] && !multiple.some((x) => Sudoku.isSamePos(x, cell))) {
              elimination.push({
                rowIndex: cell.rowIndex,
                columnIndex: cell.columnIndex,
                value: sudokuElement,
              });
            }
          });
        });
        result.push({ sudokuElement, multiple, elimination });
      }
    }

    return result;
  }

  static cellWithTwoCandidatesAndOnlyOneIsAorB(cell: Cell, a: SudokuElement, b: SudokuElement): null | Pincer {
    if (!cell.candidates || !CalcUtil.xor(cell.candidates[a], cell.candidates[b]) || SudokuSolver.numberOfCandidates(cell.candidates) !== 2) {
      return null;
    }

    const same = cell.candidates[a] ? a : b;
    const diff = SudokuSolver.getCandidatesArr(cell.candidates).filter((x) => x !== same)[0];
    return { ...cell, same, diff };
  }

  static possiblePincersFromLine(line: VirtualLine, pivot: CandidateCell): Pincer[] {
    if (!line.some((x) => Sudoku.isSamePos(x, pivot))) return [];
    const [a, b] = SudokuSolver.getCandidatesArr(pivot.candidates);
    return line.reduce((acc, cur) => {
      if (!Sudoku.isSamePos(cur, pivot)) {
        const pincer = SudokuSolver.cellWithTwoCandidatesAndOnlyOneIsAorB(cur, a, b);
        if (pincer) acc.push(pincer);
      }
      return acc;
    }, [] as Pincer[]);
  }

  static isYWingPattern(x: Pincer, y: Pincer) {
    return !Sudoku.isSamePos(x, y) && x.same !== y.same && x.diff === y.diff;
  }

  static cartesianProductWithYWingPattern(a: Pincer[], b: Pincer[]): Pincer[][] {
    return CalcUtil.cartesianProduct(a, b).filter(([x, y]) => SudokuSolver.isYWingPattern(x, y));
  }

  static statsTemplate() {
    return {
      inputCount: {
        uniqueMissing: 0,
        nakedSingle: 0,
        hiddenSingle: 0,
      },
      eliminationCount: {
        lockedCandidates: 0,
        nakedPairs: 0,
        nakedTriplets: 0,
        nakedQuads: 0,
        hiddenPairs: 0,
        hiddenTriplets: 0,
        hiddenQuads: 0,
        xWing: 0,
        yWing: 0,
        // swordfish: 0,
      },
    };
  }

  setBasicCandidates(): void {
    const missingInRowArr = this.sudoku.getAllRows().map((x) => Sudoku.missingValuesInVirtualLine(x));
    const missingInColumnArr = this.sudoku.getAllColumns().map((x) => Sudoku.missingValuesInVirtualLine(x));
    const missingInBoxArr = this.sudoku.getAllBoxes().map((x) => Sudoku.missingValuesInVirtualLine(x));

    for (let i = 0; i < this.sudoku.grid.length; i++) {
      for (let j = 0; j < this.sudoku.grid[i].length; j++) {
        if (this.sudoku.grid[i][j].clue || this.sudoku.grid[i][j].inputValue) continue;

        const missingInRow = missingInRowArr[i];
        const missingInColumn = missingInColumnArr[j];
        const missingInBox = missingInBoxArr[Sudoku.getBoxIndex(i, j)];
        const candidatesTemplate = Sudoku.candidatesFactory(false);
        SudokuSolver.loopCandidates((sudokuElement) => {
          if (missingInRow[sudokuElement] && missingInColumn[sudokuElement] && missingInBox[sudokuElement]) {
            candidatesTemplate[sudokuElement] = true;
          }
        });
        this.sudoku.setCandidates(i, j, candidatesTemplate);
      }
    }
  }

  setUniqueMissing(): number {
    const result = this.fillUniqueMissing.canFill(this.sudoku);
    if (result.length === 0) return 0;
    this.sudoku.setInputValues(result);
    this.addStatsInputCount$UniqueMissing(result.length);
    return result.length;
  }

  setNakedSingles(): number {
    const nakedSingles = this.fillNakedSingle.canFill(this.sudoku);
    if (nakedSingles.length === 0) return 0;
    this.sudoku.setInputValues(nakedSingles);
    this.addStatsInputCount$NakedSingle(nakedSingles.length);
    return nakedSingles.length;
  }

  getHiddenSingles(): InputValueData[] {
    const rowResult = SudokuSolver.getHiddenSingleFromVirtualLines(this.sudoku.getAllRows());
    const columnResult = SudokuSolver.getHiddenSingleFromVirtualLines(this.sudoku.getAllColumns());
    const boxResult = SudokuSolver.getHiddenSingleFromVirtualLines(this.sudoku.getAllBoxes());
    return Sudoku.removeDuplicatedInputValueData([...rowResult, ...columnResult, ...boxResult]);
  }

  setHiddenSingles(): number {
    const hiddenSingles = this.getHiddenSingles();
    if (hiddenSingles.length === 0) return 0;
    this.sudoku.setInputValues(hiddenSingles);
    this.addStatsInputCount$HiddenSingle(hiddenSingles.length);
    return hiddenSingles.length;
  }

  rowColumnLockInBox(type: RowColumn, index: number): InputValueData[] {
    const result: InputValueData[] = [];
    const virtualLine = type === VirtualLineType.ROW ? this.sudoku.getRow(index) : this.sudoku.getColumn(index);
    const missing = Sudoku.missingValuesInVirtualLine(virtualLine);
    const relatedBoxes = this.sudoku.getAllRelatedBoxesInRowOrColumn(type, index);

    SudokuSolver.loopCandidates((sudokuElement) => {
      if (!missing[sudokuElement]) return;

      const boxesContainedTheElement = relatedBoxes.filter((box) =>
        box.some((x) => (type === VirtualLineType.ROW ? x.rowIndex : x.columnIndex) === index && x.candidates?.[sudokuElement])
      );
      if (boxesContainedTheElement.length !== 1) return;
      const lockedBox = boxesContainedTheElement[0];
      lockedBox.forEach(({ rowIndex, columnIndex, candidates }) => {
        if ((type === VirtualLineType.ROW ? rowIndex : columnIndex) !== index && candidates?.[sudokuElement])
          result.push({ rowIndex, columnIndex, value: sudokuElement });
      });
    });

    return result;
  }

  boxLockInRowColumn(type: RowColumn, boxIndex: number): InputValueData[] {
    const result: InputValueData[] = [];
    const missing = Sudoku.missingValuesInVirtualLine(this.sudoku.getBoxFromBoxIndex(boxIndex));
    const relatedLines = this.sudoku.getAllRelatedRowsOrColumnsInBox(type, boxIndex);
    const box = this.sudoku.getBoxFromBoxIndex(boxIndex);

    SudokuSolver.loopCandidates((sudokuElement) => {
      if (!missing[sudokuElement]) return;
      const cellsContainTheElement = box.filter((x) => x.candidates?.[sudokuElement]);
      if (cellsContainTheElement.length === 0) return;
      const allInSameLine = cellsContainTheElement.every((x) =>
        type === VirtualLineType.ROW ? x.rowIndex === cellsContainTheElement[0].rowIndex : x.columnIndex === cellsContainTheElement[0].columnIndex
      );
      if (allInSameLine) {
        const lineIndex = type === VirtualLineType.ROW ? cellsContainTheElement[0].rowIndex : cellsContainTheElement[0].columnIndex;
        const virtualLine = relatedLines.find((x) => (type === VirtualLineType.ROW ? x[0].rowIndex : x[0].columnIndex) === lineIndex);
        virtualLine?.forEach(({ rowIndex, columnIndex, candidates }) => {
          if (Sudoku.getBoxIndex(rowIndex, columnIndex) !== boxIndex && candidates?.[sudokuElement])
            result.push({ rowIndex, columnIndex, value: sudokuElement });
        });
      }
    });

    return result;
  }

  getRemovalDueToLockedCandidates(): InputValueData[] {
    const idx = [0, 1, 2, 3, 4, 5, 6, 7, 8];

    const rowLockInBox = idx.map((x) => this.rowColumnLockInBox(VirtualLineType.ROW, x));
    const columnLockInBox = idx.map((x) => this.rowColumnLockInBox(VirtualLineType.COLUMN, x));
    const boxLockInRow = idx.map((x) => this.boxLockInRowColumn(VirtualLineType.ROW, x));
    const boxLockInColumn = idx.map((x) => this.boxLockInRowColumn(VirtualLineType.COLUMN, x));

    const combined: InputValueData[] = [...rowLockInBox.flat(), ...columnLockInBox.flat(), ...boxLockInRow.flat(), ...boxLockInColumn.flat()];
    return Sudoku.removeDuplicatedInputValueData(combined);
  }

  removeCandidatesDueToLockedCandidates(): number {
    const removals = this.getRemovalDueToLockedCandidates();
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$LockedCandidates(count);
    return count;
  }

  getRemovalDueToNakedPairs(): InputValueData[] {
    const rowResult = SudokuSolver.getNakedPairsFromVirtualLines(this.sudoku.getAllRows());
    const columnResult = SudokuSolver.getNakedPairsFromVirtualLines(this.sudoku.getAllColumns());
    const boxResult = SudokuSolver.getNakedPairsFromVirtualLines(this.sudoku.getAllBoxes());
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToNakedPairs(): number {
    const removals = this.getRemovalDueToNakedPairs();
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$NakedPairs(count);
    return count;
  }

  getRemovalDueToNakedTriplets(): InputValueData[] {
    const size = 3;
    const rowResult = SudokuSolver.getMultipleNakedFromVirtualLines(this.sudoku.getAllRows(), size);
    const columnResult = SudokuSolver.getMultipleNakedFromVirtualLines(this.sudoku.getAllColumns(), size);
    const boxResult = SudokuSolver.getMultipleNakedFromVirtualLines(this.sudoku.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToNakedTriplets(): number {
    const removals = this.getRemovalDueToNakedTriplets();
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$NakedTriplets(count);
    return count;
  }

  getRemovalDueToNakedQuads(): InputValueData[] {
    const size = 4;
    const rowResult = SudokuSolver.getMultipleNakedFromVirtualLines(this.sudoku.getAllRows(), size);
    const columnResult = SudokuSolver.getMultipleNakedFromVirtualLines(this.sudoku.getAllColumns(), size);
    const boxResult = SudokuSolver.getMultipleNakedFromVirtualLines(this.sudoku.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToNakedQuads(): number {
    const removals = this.getRemovalDueToNakedQuads();
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$NakedQuads(count);
    return count;
  }

  getRemovalDueToHiddenPairs(): InputValueData[] {
    const size = 2;
    const rowResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.sudoku.getAllRows(), size);
    const columnResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.sudoku.getAllColumns(), size);
    const boxResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.sudoku.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToHiddenPairs(): number {
    const removals = this.getRemovalDueToHiddenPairs();
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$HiddenPairs(count);
    return count;
  }

  getRemovalDueToHiddenTriplets(): InputValueData[] {
    const size = 3;
    const rowResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.sudoku.getAllRows(), size);
    const columnResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.sudoku.getAllColumns(), size);
    const boxResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.sudoku.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToHiddenTriplets(): number {
    const removals = this.getRemovalDueToHiddenTriplets();
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$HiddenTriplets(count);
    return count;
  }

  getRemovalDueToHiddenQuads(): InputValueData[] {
    const size = 4;
    const rowResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.sudoku.getAllRows(), size);
    const columnResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.sudoku.getAllColumns(), size);
    const boxResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.sudoku.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToHiddenQuads(): number {
    const removals = this.getRemovalDueToHiddenQuads();
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$HiddenQuads(count);
    return count;
  }

  getRemovalDueToXWing(): InputValueData[] {
    const allRows = this.sudoku.getAllRows();
    const allColumns = this.sudoku.getAllColumns();

    const rowResult = SudokuSolver.getXWingFromVirtualLines(VirtualLineType.ROW, allRows, allColumns);
    const columnResult = SudokuSolver.getXWingFromVirtualLines(VirtualLineType.COLUMN, allColumns, allRows);
    const elimination = [...rowResult, ...columnResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToXWing(): number {
    const removals = this.getRemovalDueToXWing();
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$XWing(count);
    return count;
  }

  getYWing(): YWingResult[] {
    const result: YWingResult[] = [];
    const cellsWithTwoCandidates = this.sudoku
      .getAllRows()
      .map((row) =>
        row.map((cell) => (cell.candidates && SudokuSolver.numberOfCandidates(cell.candidates) === 2 ? (cell as CandidateCell) : undefined))
      );

    for (let i = 0; i < cellsWithTwoCandidates.length; i++) {
      for (let j = 0; j < cellsWithTwoCandidates[i].length; j++) {
        const pivot = cellsWithTwoCandidates[i][j];
        if (!pivot) continue;

        const possibleRowPincers = SudokuSolver.possiblePincersFromLine(this.sudoku.getRow(i), pivot);
        const possibleColumnPincers = SudokuSolver.possiblePincersFromLine(this.sudoku.getColumn(j), pivot);
        const possibleBoxPincers = SudokuSolver.possiblePincersFromLine(this.sudoku.getBoxFromRowColumnIndex(i, j), pivot);

        const fn = SudokuSolver.cartesianProductWithYWingPattern;
        const rowColumnProduct = fn(possibleRowPincers, possibleColumnPincers);
        const rowBoxProduct = fn(possibleRowPincers, possibleBoxPincers);
        const columnBoxProduct = fn(possibleColumnPincers, possibleBoxPincers);

        const validatePincer = [...rowColumnProduct, ...rowBoxProduct, ...columnBoxProduct];
        validatePincer.forEach((x) => {
          const pincers = x;
          const elimination: InputValueData[] = [];

          const p1Related = this.sudoku.getAllRelatedCells(pincers[0]);
          const p2Related = this.sudoku.getAllRelatedCells(pincers[1]);
          const intersection = Sudoku.virtualLinesIntersections(p1Related, p2Related).filter((x) => !Sudoku.isSamePos(x, pivot));
          intersection.forEach(({ rowIndex, columnIndex, candidates }) => {
            if (candidates?.[pincers[0].diff]) elimination.push({ rowIndex, columnIndex, value: pincers[0].diff });
          });

          result.push({ pivot, pincers, elimination });
        });
      }
    }

    return result;
  }

  getRemovalDueToYWing(): InputValueData[] {
    const result = this.getYWing();
    const elimination = result.map((x) => x.elimination).flat();
    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToYWing(): number {
    const removals = this.getRemovalDueToYWing();
    const count = this.sudoku.removeElementInCandidates(removals);
    this.addStatsEliminationCount$YWing(count);
    return count;
  }

  resetStats(): void {
    this.stats = SudokuSolver.statsTemplate();
  }

  addStatsInputCount$UniqueMissing(increment: number): void {
    this.stats.inputCount.uniqueMissing += increment;
  }

  addStatsInputCount$NakedSingle(increment: number): void {
    this.stats.inputCount.nakedSingle += increment;
  }

  addStatsInputCount$HiddenSingle(increment: number): void {
    this.stats.inputCount.hiddenSingle += increment;
  }

  addStatsEliminationCount$LockedCandidates(increment: number): void {
    this.stats.eliminationCount.lockedCandidates += increment;
  }

  addStatsEliminationCount$NakedPairs(increment: number): void {
    this.stats.eliminationCount.nakedPairs += increment;
  }

  addStatsEliminationCount$NakedTriplets(increment: number): void {
    this.stats.eliminationCount.nakedTriplets += increment;
  }

  addStatsEliminationCount$NakedQuads(increment: number): void {
    this.stats.eliminationCount.nakedQuads += increment;
  }

  addStatsEliminationCount$HiddenPairs(increment: number): void {
    this.stats.eliminationCount.hiddenPairs += increment;
  }

  addStatsEliminationCount$HiddenTriplets(increment: number): void {
    this.stats.eliminationCount.hiddenTriplets += increment;
  }

  addStatsEliminationCount$HiddenQuads(increment: number): void {
    this.stats.eliminationCount.hiddenQuads += increment;
  }

  addStatsEliminationCount$XWing(increment: number): void {
    this.stats.eliminationCount.xWing += increment;
  }

  addStatsEliminationCount$YWing(increment: number): void {
    this.stats.eliminationCount.yWing += increment;
  }

  // addStatsEliminationCount$Swordfish(increment: number): void {
  //   this.stats.eliminationCount.swordfish += increment;
  // }

  trySolveByCandidates(): boolean {
    if (this.setNakedSingles()) return true;
    if (this.setHiddenSingles()) return true;

    return false;
  }

  trySolve(): boolean {
    if (this.setUniqueMissing()) return this.trySolve();

    this.setBasicCandidates();
    if (this.trySolveByCandidates()) return this.trySolve();

    for (let i = 0; i < this.eliminationStrategies.length; i++) {
      if (this.eliminationStrategies[i]() && this.trySolveByCandidates()) return this.trySolve();
    }

    return this.sudoku.solved;
  }
}
