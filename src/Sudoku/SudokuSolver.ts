import CalcUtil from "../utils/CalcUtil";
import Sudoku from "./Sudoku";
import { VirtualLineType } from "./type";
import type {
  UniqueMissingResult,
  RowColumn,
  SolveStats,
  EliminationStrategySetting,
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

const defaultEliminationStrategySetting = (): EliminationStrategySetting => ({
  lockedCandidates: 1,
  nakedPairs: 2,
  nakedTriplets: 3,
  nakedQuads: 4,
  hiddenPairs: 5,
  hiddenTriplets: 6,
  hiddenQuads: 7,
  xWing: 8,
  yWing: 9,
  // swordfish: 10,
});

export default class SudokuSolver extends Sudoku {
  public elementMissing: ElementMissing;
  public stats: SolveStats;
  public eliminationStrategySetting: EliminationStrategySetting;

  constructor(clues: InputClues) {
    super(clues);
    this.elementMissing = this.updateElementMissing();
    this.stats = SudokuSolver.statsTemplate();
    this.eliminationStrategySetting = defaultEliminationStrategySetting();
  }

  static numberOfCandidates(candidates: Candidates): number {
    const entries = Object.entries(candidates);
    return entries.reduce((acc, [_, value]) => (value ? acc + 1 : acc), 0);
  }

  static getUniqueMissingFromVirtualLines(virtualLines: VirtualLine[]): UniqueMissingResult[] {
    const result: UniqueMissingResult[] = [];
    const missingArr = virtualLines.map((x) => Sudoku.missingInVirtualLine(x));

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const missing = missingArr[i];
      const uniqueCandidate = SudokuSolver.getUniqueCandidate(missing);
      if (uniqueCandidate) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const cell = virtualLine.find((x) => !x.clue && !x.inputValue)!;
        result.push({ virtualLine, uniqueCandidate, cell });
      }
    }

    return result;
  }

  static getUniqueCandidate(candidates: Candidates): SudokuElement | null {
    const entries = Object.entries(candidates);
    const candidatesArr = entries.filter(([_, value]) => value) as [SudokuElement, boolean][];
    return candidatesArr.length === 1 ? candidatesArr[0][0] : null;
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
        if (!cell.candidates || cell.clue || cell.inputValue) return;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        Sudoku.loopCandidates((sudokuElement) => cell.candidates![sudokuElement] && candidatesCount[sudokuElement]++);
      });
      Object.entries(candidatesCount).forEach(([key, count]) => {
        if (count !== 1) return;
        const sudokuElement = key as SudokuElement;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const cell = virtualLine.find((x) => x.candidates?.[sudokuElement])!;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (SudokuSolver.numberOfCandidates(cell.candidates!) === 1) return; // naked single
        result.push({ rowIndex: cell.rowIndex, columnIndex: cell.columnIndex, value: sudokuElement });
      });
    });
    return Sudoku.removeDuplicatedInputValueData(result);
  }

  static isCandidateExtendedTheSet(candidates: Candidates, superset: SudokuElement[]): boolean {
    for (const key in candidates) {
      const sudokuElement = key as SudokuElement;
      if (candidates[sudokuElement] && !superset.includes(sudokuElement)) return false;
    }

    return true;
  }

  static getMultipleNakedFromVirtualLines(
    virtualLines: VirtualLine[],
    sizeOfCandidate: 3 | 4
  ): NakedPairsTripletsQuadsResult[] {
    const result: NakedPairsTripletsQuadsResult[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const emptyCells = virtualLine.filter((x) => !x.clue && !x.inputValue);
      const missingInVirtualLine = Sudoku.missingInVirtualLine(virtualLine);
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

  static getHiddenMultipleFromVirtualLines(
    virtualLines: VirtualLine[],
    sizeOfCandidate: 2 | 3 | 4
  ): HiddenMultipleFromVirtualLinesResult[] {
    const result: HiddenMultipleFromVirtualLinesResult[] = [];

    for (let i = 0; i < virtualLines.length; i++) {
      const virtualLine = virtualLines[i];
      const emptyCells = virtualLine.filter((x) => !x.clue && !x.inputValue);
      const missingInVirtualLine = Sudoku.missingInVirtualLine(virtualLine);
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

  static statsTemplate: () => SolveStats = () => ({
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
  });

  static sameCandidates(x: Candidates, y: Candidates): boolean {
    for (const key in x) {
      if (x[key as SudokuElement] !== y[key as SudokuElement]) return false;
    }
    return true;
  }

  static getCandidatesArr(candidates: Candidates): SudokuElement[] {
    const result: SudokuElement[] = [];
    Sudoku.loopCandidates((sudokuElement) => {
      if (candidates[sudokuElement]) result.push(sudokuElement);
    });
    return result;
  }

  static getNakedPairsFromVirtualLines(virtualLines: VirtualLine[]): NakedPairsTripletsQuadsResult[] {
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

  static getXWingSwordfishFromVirtualLines(
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

  setBasicCandidates(): void {
    for (let i = 0; i < this.grid.length; i++) {
      for (let j = 0; j < this.grid[i].length; j++) {
        if (this.grid[i][j].clue || this.grid[i][j].inputValue) continue;

        const boxIndex = Sudoku.getBoxIndex(i, j);
        const missingInRow = this.elementMissing[VirtualLineType.ROW][i];
        const missingInColumn = this.elementMissing[VirtualLineType.COLUMN][j];
        const missingInBox = this.elementMissing[VirtualLineType.BOX][boxIndex];
        const candidates = Sudoku.candidatesFactory(false);

        for (const key in candidates) {
          const sudokuElement = key as SudokuElement;
          if (missingInRow[sudokuElement] && missingInColumn[sudokuElement] && missingInBox[sudokuElement]) {
            candidates[sudokuElement] = true;
          }
        }

        this.setCandidates(i, j, candidates);
      }
    }
  }

  getUniqueMissing(): UniqueMissingResult[] {
    const rowResult = SudokuSolver.getUniqueMissingFromVirtualLines(this.getAllRows());
    const columnResult = SudokuSolver.getUniqueMissingFromVirtualLines(this.getAllColumns());
    const boxResult = SudokuSolver.getUniqueMissingFromVirtualLines(this.getAllBoxes());

    const combined = [...rowResult, ...columnResult, ...boxResult];
    const result = combined.filter((x, ix) => combined.findIndex((y) => SudokuSolver.isSamePos(x.cell, y.cell)) === ix);
    return result;
  }

  setUniqueMissing(): boolean {
    const result = this.getUniqueMissing();
    const inputValues: InputValueData[] = result.map((x) => ({
      rowIndex: x.cell.rowIndex,
      columnIndex: x.cell.columnIndex,
      value: x.uniqueCandidate,
    }));
    this.setInputValues(inputValues);
    this.addStatsInputCount$UniqueMissing(inputValues.length);
    return Boolean(inputValues.length);
  }

  getNakedSingles(): InputValueData[] {
    const result: InputValueData[] = [];
    this.loopGrid((rowIndex, columnIndex, cell) => {
      if (!cell.candidates || cell.clue || cell.inputValue) return;
      const candidatesArr = SudokuSolver.getCandidatesArr(cell.candidates);
      if (candidatesArr.length === 1) result.push({ rowIndex, columnIndex, value: candidatesArr[0] });
    });
    return result;
  }

  setNakedSingles(): boolean {
    const nakedSingles = this.getNakedSingles();
    if (!nakedSingles.length) return false;
    this.setInputValues(nakedSingles);
    this.addStatsInputCount$NakedSingle(nakedSingles.length);
    return true;
  }

  getHiddenSingles(): InputValueData[] {
    const rowResult = SudokuSolver.getHiddenSingleFromVirtualLines(this.getAllRows());
    const columnResult = SudokuSolver.getHiddenSingleFromVirtualLines(this.getAllColumns());
    const boxResult = SudokuSolver.getHiddenSingleFromVirtualLines(this.getAllBoxes());
    return Sudoku.removeDuplicatedInputValueData([...rowResult, ...columnResult, ...boxResult]);
  }

  setHiddenSingles(): boolean {
    const hiddenSingles = this.getHiddenSingles();
    if (!hiddenSingles.length) return false;
    this.setInputValues(hiddenSingles);
    this.addStatsInputCount$HiddenSingle(hiddenSingles.length);
    return true;
  }

  rowColumnLockInBox(type: RowColumn, index: number): InputValueData[] {
    const result: InputValueData[] = [];
    const virtualLine = type === VirtualLineType.ROW ? this.getRow(index) : this.getColumn(index);
    const missing = Sudoku.missingInVirtualLine(virtualLine);
    const relatedBoxes = this.getAllRelatedBoxesInRowOrColumn(type, index);

    for (const key in missing) {
      const sudokuElement = key as SudokuElement;
      if (!missing[sudokuElement]) continue;

      const boxesContainedTheElement = relatedBoxes.filter((box) =>
        box.some(
          ({ rowIndex, columnIndex, candidates }) =>
            (type === VirtualLineType.ROW ? rowIndex : columnIndex) === index && candidates?.[sudokuElement]
        )
      );
      if (boxesContainedTheElement.length !== 1) continue;

      const lockedBox = boxesContainedTheElement[0];
      lockedBox.forEach(({ rowIndex, columnIndex, candidates }) => {
        if ((type === VirtualLineType.ROW ? rowIndex : columnIndex) !== index && candidates?.[sudokuElement]) {
          result.push({ rowIndex, columnIndex, value: sudokuElement });
        }
      });
    }

    return result;
  }

  boxLockInRowColumn(type: RowColumn, boxIndex: number): InputValueData[] {
    const result: InputValueData[] = [];
    const missing = Sudoku.missingInVirtualLine(this.getBoxFromBoxIndex(boxIndex));
    const relatedLines = this.getAllRelatedRowsOrColumnsInBox(type, boxIndex);
    const box = this.getBoxFromBoxIndex(boxIndex);

    for (const key in missing) {
      const sudokuElement = key as SudokuElement;
      if (!missing[sudokuElement]) continue;

      const cellsContainTheElement = box.filter((x) => x.candidates?.[sudokuElement]);
      if (cellsContainTheElement.length === 0) continue;

      const allInSameLine = cellsContainTheElement.every((x) =>
        type === VirtualLineType.ROW
          ? x.rowIndex === cellsContainTheElement[0].rowIndex
          : x.columnIndex === cellsContainTheElement[0].columnIndex
      );
      if (allInSameLine) {
        const lineIndex =
          type === VirtualLineType.ROW ? cellsContainTheElement[0].rowIndex : cellsContainTheElement[0].columnIndex;
        const virtualLine = relatedLines.find(
          (x) => (type === VirtualLineType.ROW ? x[0].rowIndex : x[0].columnIndex) === lineIndex
        );
        virtualLine?.forEach(({ rowIndex, columnIndex, candidates }) => {
          if (Sudoku.getBoxIndex(rowIndex, columnIndex) !== boxIndex && candidates?.[sudokuElement]) {
            result.push({ rowIndex, columnIndex, value: sudokuElement });
          }
        });
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

    const combined: InputValueData[] = [
      ...rowLockInBox.flat(),
      ...columnLockInBox.flat(),
      ...boxLockInRow.flat(),
      ...boxLockInColumn.flat(),
    ];
    return Sudoku.removeDuplicatedInputValueData(combined);
  }

  removeCandidatesDueToLockedCandidates(): number {
    const removals = this.getRemovalDueToLockedCandidates();
    const count = this.removeElementInCandidates(removals);
    this.addStatsEliminationCount$LockedCandidates(count);
    return count;
  }

  getRemovalDueToNakedPairs(): InputValueData[] {
    if (!this.isValid) return [];

    const rowResult = SudokuSolver.getNakedPairsFromVirtualLines(this.getAllRows());
    const columnResult = SudokuSolver.getNakedPairsFromVirtualLines(this.getAllColumns());
    const boxResult = SudokuSolver.getNakedPairsFromVirtualLines(this.getAllBoxes());
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToNakedPairs(): number {
    const removals = this.getRemovalDueToNakedPairs();
    const count = this.removeElementInCandidates(removals);
    this.addStatsEliminationCount$NakedPairs(count);
    return count;
  }

  getRemovalDueToNakedTriplets(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 3;
    const rowResult = SudokuSolver.getMultipleNakedFromVirtualLines(this.getAllRows(), size);
    const columnResult = SudokuSolver.getMultipleNakedFromVirtualLines(this.getAllColumns(), size);
    const boxResult = SudokuSolver.getMultipleNakedFromVirtualLines(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToNakedTriplets(): number {
    const removals = this.getRemovalDueToNakedTriplets();
    const count = this.removeElementInCandidates(removals);
    this.addStatsEliminationCount$NakedTriplets(count);
    return count;
  }

  getRemovalDueToNakedQuads(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 4;
    const rowResult = SudokuSolver.getMultipleNakedFromVirtualLines(this.getAllRows(), size);
    const columnResult = SudokuSolver.getMultipleNakedFromVirtualLines(this.getAllColumns(), size);
    const boxResult = SudokuSolver.getMultipleNakedFromVirtualLines(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToNakedQuads(): number {
    const removals = this.getRemovalDueToNakedQuads();
    const count = this.removeElementInCandidates(removals);
    this.addStatsEliminationCount$NakedQuads(count);
    return count;
  }

  getRemovalDueToHiddenPairs(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 2;
    const rowResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.getAllRows(), size);
    const columnResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.getAllColumns(), size);
    const boxResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToHiddenPairs(): number {
    const removals = this.getRemovalDueToHiddenPairs();
    const count = this.removeElementInCandidates(removals);
    this.addStatsEliminationCount$HiddenPairs(count);
    return count;
  }

  getRemovalDueToHiddenTriplets(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 3;
    const rowResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.getAllRows(), size);
    const columnResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.getAllColumns(), size);
    const boxResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToHiddenTriplets(): number {
    const removals = this.getRemovalDueToHiddenTriplets();
    const count = this.removeElementInCandidates(removals);
    this.addStatsEliminationCount$HiddenTriplets(count);
    return count;
  }

  getRemovalDueToHiddenQuads(): InputValueData[] {
    if (!this.isValid) return [];

    const size = 4;
    const rowResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.getAllRows(), size);
    const columnResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.getAllColumns(), size);
    const boxResult = SudokuSolver.getHiddenMultipleFromVirtualLines(this.getAllBoxes(), size);
    const elimination = [...rowResult, ...columnResult, ...boxResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToHiddenQuads(): number {
    const removals = this.getRemovalDueToHiddenQuads();
    const count = this.removeElementInCandidates(removals);
    this.addStatsEliminationCount$HiddenQuads(count);
    return count;
  }

  getRemovalDueToXWing(): InputValueData[] {
    if (!this.isValid) return [];

    const allRows = this.getAllRows();
    const allColumns = this.getAllColumns();

    const rowResult = SudokuSolver.getXWingSwordfishFromVirtualLines(VirtualLineType.ROW, allRows, allColumns);
    const columnResult = SudokuSolver.getXWingSwordfishFromVirtualLines(VirtualLineType.COLUMN, allColumns, allRows);
    const elimination = [...rowResult, ...columnResult].flatMap((x) => x.elimination);

    return Sudoku.removeDuplicatedInputValueData(elimination);
  }

  removeCandidatesDueToXWing(): number {
    const removals = this.getRemovalDueToXWing();
    const count = this.removeElementInCandidates(removals);
    this.addStatsEliminationCount$XWing(count);
    return count;
  }

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
          const intersection = Sudoku.virtualLinesIntersections(p1Related, p2Related).filter(
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

  removeCandidatesDueToYWing(): number {
    const removals = this.getRemovalDueToYWing();
    const count = this.removeElementInCandidates(removals);
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

    if (this.removeCandidatesDueToLockedCandidates() && this.trySolveByCandidates()) return this.trySolve();
    if (this.removeCandidatesDueToNakedPairs() && this.trySolveByCandidates()) return this.trySolve();
    if (this.removeCandidatesDueToNakedTriplets() && this.trySolveByCandidates()) return this.trySolve();
    if (this.removeCandidatesDueToNakedQuads() && this.trySolveByCandidates()) return this.trySolve();
    if (this.removeCandidatesDueToHiddenPairs() && this.trySolveByCandidates()) return this.trySolve();
    if (this.removeCandidatesDueToHiddenTriplets() && this.trySolveByCandidates()) return this.trySolve();
    if (this.removeCandidatesDueToHiddenQuads() && this.trySolveByCandidates()) return this.trySolve();
    if (this.removeCandidatesDueToXWing() && this.trySolveByCandidates()) return this.trySolve();
    if (this.removeCandidatesDueToYWing() && this.trySolveByCandidates()) return this.trySolve();

    return this.solved;
  }

  private updateElementMissing() {
    const fn = (line: VirtualLine[]) => line.map((x) => Sudoku.missingInVirtualLine(x));
    this.elementMissing = {
      [VirtualLineType.ROW]: fn(this.getAllRows()),
      [VirtualLineType.COLUMN]: fn(this.getAllColumns()),
      [VirtualLineType.BOX]: fn(this.getAllBoxes()),
    };

    return this.elementMissing;
  }

  private loopGrid(fn: (rowIndex: number, columnIndex: number, cell: Cell, row?: Cell[]) => void): void {
    for (let rowIndex = 0; rowIndex < this.grid.length; rowIndex++) {
      const row = this.grid[rowIndex];
      for (let columnIndex = 0; columnIndex < row.length; columnIndex++) {
        const cell = row[columnIndex];
        fn(rowIndex, columnIndex, cell, row);
      }
    }
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
