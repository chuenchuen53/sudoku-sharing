import Sudoku from "./Sudoku";
import { VirtualLineType, type Position } from "./type";

export enum SudokuLine {
  ROW_0 = "ROW_0",
  ROW_1 = "ROW_1",
  ROW_2 = "ROW_2",
  ROW_3 = "ROW_3",
  ROW_4 = "ROW_4",
  ROW_5 = "ROW_5",
  ROW_6 = "ROW_6",
  ROW_7 = "ROW_7",
  ROW_8 = "ROW_8",
  COLUMN_0 = "COLUMN_0",
  COLUMN_1 = "COLUMN_1",
  COLUMN_2 = "COLUMN_2",
  COLUMN_3 = "COLUMN_3",
  COLUMN_4 = "COLUMN_4",
  COLUMN_5 = "COLUMN_5",
  COLUMN_6 = "COLUMN_6",
  COLUMN_7 = "COLUMN_7",
  COLUMN_8 = "COLUMN_8",
  BOX_0 = "BOX_0",
  BOX_1 = "BOX_1",
  BOX_2 = "BOX_2",
  BOX_3 = "BOX_3",
  BOX_4 = "BOX_4",
  BOX_5 = "BOX_5",
  BOX_6 = "BOX_6",
  BOX_7 = "BOX_7",
  BOX_8 = "BOX_8",
}

export type SudokuLineRow =
  | SudokuLine.ROW_0
  | SudokuLine.ROW_1
  | SudokuLine.ROW_2
  | SudokuLine.ROW_3
  | SudokuLine.ROW_4
  | SudokuLine.ROW_5
  | SudokuLine.ROW_6
  | SudokuLine.ROW_7
  | SudokuLine.ROW_8;

export type SudokuLineColumn =
  | SudokuLine.COLUMN_0
  | SudokuLine.COLUMN_1
  | SudokuLine.COLUMN_2
  | SudokuLine.COLUMN_3
  | SudokuLine.COLUMN_4
  | SudokuLine.COLUMN_5
  | SudokuLine.COLUMN_6
  | SudokuLine.COLUMN_7
  | SudokuLine.COLUMN_8;

export type SudokuLineBox =
  | SudokuLine.BOX_0
  | SudokuLine.BOX_1
  | SudokuLine.BOX_2
  | SudokuLine.BOX_3
  | SudokuLine.BOX_4
  | SudokuLine.BOX_5
  | SudokuLine.BOX_6
  | SudokuLine.BOX_7
  | SudokuLine.BOX_8;

export class SudokuLineUtil {
  private static readonly ROWS: SudokuLineRow[] = [
    SudokuLine.ROW_0,
    SudokuLine.ROW_1,
    SudokuLine.ROW_2,
    SudokuLine.ROW_3,
    SudokuLine.ROW_4,
    SudokuLine.ROW_5,
    SudokuLine.ROW_6,
    SudokuLine.ROW_7,
    SudokuLine.ROW_8,
  ];
  private static readonly COLUMNS: SudokuLineColumn[] = [
    SudokuLine.COLUMN_0,
    SudokuLine.COLUMN_1,
    SudokuLine.COLUMN_2,
    SudokuLine.COLUMN_3,
    SudokuLine.COLUMN_4,
    SudokuLine.COLUMN_5,
    SudokuLine.COLUMN_6,
    SudokuLine.COLUMN_7,
    SudokuLine.COLUMN_8,
  ];
  private static readonly BOXES: SudokuLineBox[] = [
    SudokuLine.BOX_0,
    SudokuLine.BOX_1,
    SudokuLine.BOX_2,
    SudokuLine.BOX_3,
    SudokuLine.BOX_4,
    SudokuLine.BOX_5,
    SudokuLine.BOX_6,
    SudokuLine.BOX_7,
    SudokuLine.BOX_8,
  ];

  private constructor() {}

  public static lineTypeAndIndex(line: SudokuLine): { virtualLineType: VirtualLineType; lineIndex: number } {
    let virtualLineType: VirtualLineType;
    let lineIndex: number;

    switch (line) {
      case SudokuLine.ROW_0:
      case SudokuLine.ROW_1:
      case SudokuLine.ROW_2:
      case SudokuLine.ROW_3:
      case SudokuLine.ROW_4:
      case SudokuLine.ROW_5:
      case SudokuLine.ROW_6:
      case SudokuLine.ROW_7:
      case SudokuLine.ROW_8:
        virtualLineType = VirtualLineType.ROW;
        break;
      case SudokuLine.COLUMN_0:
      case SudokuLine.COLUMN_1:
      case SudokuLine.COLUMN_2:
      case SudokuLine.COLUMN_3:
      case SudokuLine.COLUMN_4:
      case SudokuLine.COLUMN_5:
      case SudokuLine.COLUMN_6:
      case SudokuLine.COLUMN_7:
      case SudokuLine.COLUMN_8:
        virtualLineType = VirtualLineType.COLUMN;
        break;
      case SudokuLine.BOX_0:
      case SudokuLine.BOX_1:
      case SudokuLine.BOX_2:
      case SudokuLine.BOX_3:
      case SudokuLine.BOX_4:
      case SudokuLine.BOX_5:
      case SudokuLine.BOX_6:
      case SudokuLine.BOX_7:
      case SudokuLine.BOX_8:
        virtualLineType = VirtualLineType.BOX;
        break;
    }

    switch (line) {
      case SudokuLine.ROW_0:
      case SudokuLine.COLUMN_0:
      case SudokuLine.BOX_0:
        lineIndex = 0;
        break;
      case SudokuLine.ROW_1:
      case SudokuLine.COLUMN_1:
      case SudokuLine.BOX_1:
        lineIndex = 1;
        break;
      case SudokuLine.ROW_2:
      case SudokuLine.COLUMN_2:
      case SudokuLine.BOX_2:
        lineIndex = 2;
        break;
      case SudokuLine.ROW_3:
      case SudokuLine.COLUMN_3:
      case SudokuLine.BOX_3:
        lineIndex = 3;
        break;
      case SudokuLine.ROW_4:
      case SudokuLine.COLUMN_4:
      case SudokuLine.BOX_4:
        lineIndex = 4;
        break;
      case SudokuLine.ROW_5:
      case SudokuLine.COLUMN_5:
      case SudokuLine.BOX_5:
        lineIndex = 5;
        break;
      case SudokuLine.ROW_6:
      case SudokuLine.COLUMN_6:
      case SudokuLine.BOX_6:
        lineIndex = 6;
        break;
      case SudokuLine.ROW_7:
      case SudokuLine.COLUMN_7:
      case SudokuLine.BOX_7:
        lineIndex = 7;
        break;
      case SudokuLine.ROW_8:
      case SudokuLine.COLUMN_8:
      case SudokuLine.BOX_8:
        lineIndex = 8;
        break;
    }

    return { virtualLineType, lineIndex };
  }

  public static sudokuLine(virtualLineType: VirtualLineType, lineIndex: number): SudokuLine {
    switch (virtualLineType) {
      case VirtualLineType.ROW:
        return SudokuLineUtil.ROWS[lineIndex];
      case VirtualLineType.COLUMN:
        return SudokuLineUtil.COLUMNS[lineIndex];
      case VirtualLineType.BOX:
        return SudokuLineUtil.BOXES[lineIndex];
    }
  }

  public static sudokuLineFromPosition(virtualLineType: VirtualLineType, position: Position): SudokuLine {
    switch (virtualLineType) {
      case VirtualLineType.ROW:
        return SudokuLineUtil.ROWS[position.rowIndex];
      case VirtualLineType.COLUMN:
        return SudokuLineUtil.COLUMNS[position.columnIndex];
      case VirtualLineType.BOX:
        return SudokuLineUtil.BOXES[Sudoku.getBoxIndex(position.rowIndex, position.columnIndex)];
    }
  }

  public static allPositionsInLine(line: SudokuLine): Position[] {
    if (SudokuLineUtil.ROWS.some((row) => row === line)) {
      return SudokuLineUtil.allPositionsInRow(line as unknown as SudokuLineRow);
    } else if (SudokuLineUtil.COLUMNS.some((column) => column === line)) {
      return SudokuLineUtil.allPositionsInColumn(line as unknown as SudokuLineColumn);
    }
    return SudokuLineUtil.allPositionsInBox(line as unknown as SudokuLineBox);
  }

  public static allPositionsInRow(row: SudokuLineRow): Position[] {
    const rowIndex = SudokuLineUtil.lineTypeAndIndex(row).lineIndex;
    const positions: Position[] = new Array(9);
    for (let columnIndex = 0; columnIndex < 9; columnIndex++) {
      positions[columnIndex] = { rowIndex, columnIndex };
    }
    return positions;
  }

  public static allPositionsInColumn(column: SudokuLineColumn): Position[] {
    const columnIndex = SudokuLineUtil.lineTypeAndIndex(column).lineIndex;
    const positions: Position[] = new Array(9);
    for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
      positions[rowIndex] = { rowIndex, columnIndex };
    }
    return positions;
  }

  public static allPositionsInBox(box: SudokuLineBox): Position[] {
    const boxIndex = SudokuLineUtil.lineTypeAndIndex(box).lineIndex;
    const positions: Position[] = new Array(9);
    const firstRowIndex = Sudoku.boxFirstLineIndex(boxIndex, VirtualLineType.ROW);
    const firstColumnIndex = Sudoku.boxFirstLineIndex(boxIndex, VirtualLineType.COLUMN);
    for (let rowIndex = 0; rowIndex < 3; rowIndex++) {
      for (let columnIndex = 0; columnIndex < 3; columnIndex++) {
        positions[rowIndex * 3 + columnIndex] = { rowIndex: firstRowIndex + rowIndex, columnIndex: firstColumnIndex + columnIndex };
      }
    }
    return positions;
  }

  public static lineNameForDisplay(line: SudokuLine): string {
    const { virtualLineType, lineIndex } = SudokuLineUtil.lineTypeAndIndex(line);
    return `${virtualLineType.toLowerCase()} ${lineIndex + 1}`;
  }
}
