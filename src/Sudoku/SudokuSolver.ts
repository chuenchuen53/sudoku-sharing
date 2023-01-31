import CalcUtil from "../utils/CalcUtil";
import ArrUtil from "../utils/ArrUtil";
import Sudoku from "./Sudoku";
import { VirtualLineType } from "./type";
import type {
  UniqueMissingResult,
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
  HiddenMultipleFromVirtualLinesResult,
  NakedPairsTripletsQuadsResult,
  Pincer,
  XWingSwordfishResult,
  YWingResult,
} from "./type";

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

  getUniqueMissing(type: VirtualLineType): UniqueMissingResult[] {
    const allVirtualLines = this.getAllVirtualLines(type);
    const missingArr = this.elementMissing[type];
    const result: UniqueMissingResult[] = [];
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

  getNakedPairsFromVirtualLines(virtualLines: VirtualLine[]): NakedPairsTripletsQuadsResult[] {
    const result: NakedPairsTripletsQuadsResult[] = [];

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

  getRemovalDueToNakedPairs(): InputValueData[] {
    if (!this.isValid) return [];

    const rowResult = this.getNakedPairsFromVirtualLines(this.getAllRows());
    const columnResult = this.getNakedPairsFromVirtualLines(this.getAllColumns());
    const boxResult = this.getNakedPairsFromVirtualLines(this.getAllBoxes());
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  static isCandidateExtendedTheSet(candidates: Candidates, superset: SudokuElement[]): boolean {
    for (const key in candidates) {
      const sudokuElement = key as SudokuElement;
      if (candidates[sudokuElement] && !superset.includes(sudokuElement)) return false;
    }

    return true;
  }

  getMultipleNakedFromVirtualLines(
    virtualLines: VirtualLine[],
    sizeOfCandidate: 3 | 4
  ): NakedPairsTripletsQuadsResult[] {
    const result: NakedPairsTripletsQuadsResult[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const emptyCells = virtualLine.filter((x) => !x.clue && !x.inputValue);
      const missingInVirtualLine = this.missingInVirtualLine(virtualLine);
      const missingArr = SudokuSolver.getCandidatesArr(missingInVirtualLine);
      if (missingArr.length < sizeOfCandidate) continue;
      const combinations =
        sizeOfCandidate === 3 ? CalcUtil.combinations3(missingArr) : CalcUtil.combinations4(missingArr);

      for (const comb of combinations) {
        const cells = emptyCells.filter(
          (x) => x.candidates && SudokuSolver.isCandidateExtendedTheSet(x.candidates, comb)
        );

        if (cells.length === sizeOfCandidate) {
          const elimination: InputValueData[] = [];
          const restCells = emptyCells.filter((x) => !cells.some((y) => Sudoku.isSamePos(x, y)));
          restCells.forEach(({ rowIndex, columnIndex, candidates }) => {
            for (const sudokuElement of comb) {
              if (candidates?.[sudokuElement]) elimination.push({ rowIndex, columnIndex, value: sudokuElement });
            }
          });

          result.push({ cells, elimination });
        }
      }
    }

    return result;
  }

  getRemovalDueToNakedTriplets(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 3;
    const rowResult = this.getMultipleNakedFromVirtualLines(this.getAllRows(), size);
    const columnResult = this.getMultipleNakedFromVirtualLines(this.getAllColumns(), size);
    const boxResult = this.getMultipleNakedFromVirtualLines(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  getRemovalDueToNakedQuads(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 4;
    const rowResult = this.getMultipleNakedFromVirtualLines(this.getAllRows(), size);
    const columnResult = this.getMultipleNakedFromVirtualLines(this.getAllColumns(), size);
    const boxResult = this.getMultipleNakedFromVirtualLines(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  getHiddenMultipleFromVirtualLines(
    virtualLines: VirtualLine[],
    sizeOfCandidate: 2 | 3 | 4
  ): HiddenMultipleFromVirtualLinesResult[] {
    const result: HiddenMultipleFromVirtualLinesResult[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const emptyCells = virtualLine.filter((x) => !x.clue && !x.inputValue);
      const missingInVirtualLine = this.missingInVirtualLine(virtualLine);
      const missingArr = SudokuSolver.getCandidatesArr(missingInVirtualLine);
      if (missingArr.length < sizeOfCandidate) continue;
      const combinations: SudokuElement[][] = CalcUtil.combinations(missingArr, sizeOfCandidate);

      for (const combination of combinations) {
        const multiple = emptyCells.filter((x) => {
          if (!x.candidates) return false;

          for (const sudokuElement of combination) {
            if (x.candidates[sudokuElement] && combination.includes(sudokuElement)) return true;
          }

          return false;
        });

        if (multiple.length === sizeOfCandidate) {
          const elimination: InputValueData[] = [];

          multiple.forEach(({ rowIndex, columnIndex, candidates }) => {
            if (!candidates) return;

            for (const key in candidates) {
              const sudokuElement = key as SudokuElement;
              if (candidates[sudokuElement] && !combination.includes(sudokuElement)) {
                elimination.push({
                  rowIndex,
                  columnIndex,
                  value: sudokuElement,
                });
              }
            }
          });

          result.push({ combination, multiple, elimination });
        }
      }
    }

    return result;
  }

  getRemovalDueToHiddenPairs(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 2;
    const rowResult = this.getHiddenMultipleFromVirtualLines(this.getAllRows(), size);
    const columnResult = this.getHiddenMultipleFromVirtualLines(this.getAllColumns(), size);
    const boxResult = this.getHiddenMultipleFromVirtualLines(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  getRemovalDueToHiddenTriplets(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 3;
    const rowResult = this.getHiddenMultipleFromVirtualLines(this.getAllRows(), size);
    const columnResult = this.getHiddenMultipleFromVirtualLines(this.getAllColumns(), size);
    const boxResult = this.getHiddenMultipleFromVirtualLines(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  getRemovalDueToHiddenQuads(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 4;
    const rowResult = this.getHiddenMultipleFromVirtualLines(this.getAllRows(), size);
    const columnResult = this.getHiddenMultipleFromVirtualLines(this.getAllColumns(), size);
    const boxResult = this.getHiddenMultipleFromVirtualLines(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  getXWingSwordfishFromVirtualLines(
    type: VirtualLineType.ROW | VirtualLineType.COLUMN,
    virtualLines: VirtualLine[],
    perpendicularVirtualLines: VirtualLine[]
  ): XWingSwordfishResult[] {
    const result: XWingSwordfishResult[] = [];

    for (const e of Sudoku.allElements()) {
      const sudokuElement = e as SudokuElement;
      const gridWithElementInCandidate = virtualLines.map((line) =>
        line.map((cell) => (cell.candidates?.[sudokuElement] ? cell : undefined))
      );

      const lineWithTwoCellsContained = gridWithElementInCandidate.reduce((acc, line, lineIndex) => {
        const cells = line.filter((x): x is CellWithIndex => Boolean(x));
        if (cells.length === 2) acc.push({ lineIndex, cells });
        return acc;
      }, [] as { lineIndex: number; cells: CellWithIndex[] }[]);

      if (lineWithTwoCellsContained.length >= 2) {
        const combinations = CalcUtil.combinations2(lineWithTwoCellsContained);
        for (const [line1, line2] of combinations) {
          const isSamePerpendicularPos =
            type === VirtualLineType.ROW
              ? line1.cells[0].columnIndex === line2.cells[0].columnIndex &&
                line1.cells[1].columnIndex === line2.cells[1].columnIndex
              : line1.cells[0].rowIndex === line2.cells[0].rowIndex &&
                line1.cells[1].rowIndex === line2.cells[1].rowIndex;

          if (isSamePerpendicularPos) {
            const transverseIndexes =
              type === VirtualLineType.ROW
                ? [line1.cells[0].columnIndex, line1.cells[1].columnIndex]
                : [line1.cells[0].rowIndex, line1.cells[1].rowIndex];
            const multiple = [line1.cells[0], line1.cells[1], line2.cells[0], line2.cells[1]];
            const eliminationLines = [
              perpendicularVirtualLines[transverseIndexes[0]],
              perpendicularVirtualLines[transverseIndexes[1]],
            ].filter((x) => x);
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
      }
    }

    return result;
  }

  getRemovalDueToXWing(): InputValueData[] {
    if (!this.isValid) return [];

    const allRows = this.getAllRows();
    const allColumns = this.getAllColumns();

    const rowResult = this.getXWingSwordfishFromVirtualLines(VirtualLineType.ROW, allRows, allColumns);
    const columnResult = this.getXWingSwordfishFromVirtualLines(VirtualLineType.COLUMN, allColumns, allRows);
    const elimination = [...rowResult, ...columnResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  static cellWithTwoCandidatesAndOnlyOneIsAorB(cell: CellWithIndex, a: SudokuElement, b: SudokuElement): null | Pincer {
    if (
      !cell.candidates ||
      SudokuSolver.numberOfCandidates(cell.candidates) !== 2 ||
      !CalcUtil.xor(cell.candidates[a], cell.candidates[b])
    ) {
      return null;
    }

    const same = cell.candidates[a] ? a : b;
    const diff = SudokuSolver.getCandidatesArr(cell.candidates).filter((x) => x !== same)[0];
    return { ...cell, same, diff };
  }

  static possiblePincersFromLine = (line: VirtualLine, pivot: CellWithIndex): Pincer[] => {
    if (!line.some((x) => Sudoku.isSamePos(x, pivot))) return [];
    if (!pivot.candidates) return [];

    const candidatesArr = SudokuSolver.getCandidatesArr(pivot.candidates);
    if (candidatesArr.length !== 2) return [];

    const [a, b] = candidatesArr;

    return line.reduce((acc, cur) => {
      if (!Sudoku.isSamePos(cur, pivot)) {
        const pincer = SudokuSolver.cellWithTwoCandidatesAndOnlyOneIsAorB(cur, a, b);
        if (pincer) acc.push(pincer);
      }
      return acc;
    }, [] as Pincer[]);
  };

  static isYWingPattern = (x: Pincer, y: Pincer): boolean => {
    return !Sudoku.isSamePos(x, y) && x.same !== y.same && x.diff === y.diff;
  };

  static cartesianProductWithYWingPattern = (a: Pincer[], b: Pincer[]): Pincer[][] => {
    return CalcUtil.cartesianProduct(a, b).filter(([x, y]) => SudokuSolver.isYWingPattern(x, y));
  };

  getYWing(): YWingResult[] {
    const result: YWingResult[] = [];
    const cellsWithTwoCandidates = this.getAllRows().map((row) =>
      row.map((cell) => (cell.candidates && SudokuSolver.numberOfCandidates(cell.candidates) === 2 ? cell : undefined))
    );

    for (let i = 0; i < cellsWithTwoCandidates.length; i++) {
      for (let j = 0; j < cellsWithTwoCandidates[i].length; j++) {
        const pivot = cellsWithTwoCandidates[i][j];
        if (!pivot || !pivot.candidates) continue;

        const possibleRowPincers = SudokuSolver.possiblePincersFromLine(this.getRow(i), pivot);
        const possibleColumnPincers = SudokuSolver.possiblePincersFromLine(this.getColumn(j), pivot);
        const possibleBoxPincers = SudokuSolver.possiblePincersFromLine(this.getBoxFromRowColumnIndex(i, j), pivot);

        const fn = SudokuSolver.cartesianProductWithYWingPattern;
        const rowColumnProduct = fn(possibleRowPincers, possibleColumnPincers);
        const rowBoxProduct = fn(possibleRowPincers, possibleBoxPincers);
        const columnBoxProduct = fn(possibleColumnPincers, possibleBoxPincers);

        const validatePincer = [...rowColumnProduct, ...rowBoxProduct, ...columnBoxProduct];
        validatePincer.forEach((x) => {
          const pincers = x;
          const elimination: InputValueData[] = [];

          const p1Related = this.getAllRelatedCells(pincers[0]);
          const p2Related = this.getAllRelatedCells(pincers[1]);
          const intersection = this.getVirtualLinesIntersections(p1Related, p2Related).filter(
            (x) => !Sudoku.isSamePos(x, pivot)
          );
          intersection.forEach(({ rowIndex, columnIndex, candidates }) => {
            if (candidates?.[pincers[0].diff]) {
              elimination.push({ rowIndex, columnIndex, value: pincers[0].diff });
            }
          });

          result.push({ pivot, pincers, elimination });
        });
      }
    }

    return result;
  }

  getRemovalDueToYWing(): InputValueData[] {
    if (!this.isValid) return [];

    const result = this.getYWing();
    const elimination = result.map((x) => x.elimination).flat();
    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

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
    for (const key in x) {
      if (x[key as SudokuElement] !== y[key as SudokuElement]) return false;
    }
    return true;
  }

  static getCandidatesArr(candidates: Candidates): SudokuElement[] {
    const result: SudokuElement[] = [];

    for (const key in candidates) {
      if (candidates[key as SudokuElement]) result.push(key as SudokuElement);
    }

    return result;
  }
}

// // todo the swordfish may not need all rows/cols to have exactly 3 cells
// getSwordfish(): InputValueData[] {
//   if (!this.isValid) return [];

//   const rowResult = this.getXWingSwordfishHelper(this.getAllRows(), "row", "swordfish");
//   const columnResult = this.getXWingSwordfishHelper(this.getAllColumns(), "column", "swordfish");
//   const elimination = [...rowResult, ...columnResult].flatMap((x) => x.elimination);

//   return elimination;
// }
