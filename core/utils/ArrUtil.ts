import cloneDeep from "lodash/cloneDeep";

export default class ArrUtil {
  static create2DArray<T extends string | number | boolean | (object & { length?: never }) | undefined>(
    rows: number,
    columns: number,
    fn: (row: number, column: number) => T,
  ): T[][] {
    const array: T[][] = new Array(rows);
    for (let i = 0; i < rows; i++) {
      array[i] = new Array(columns);
      for (let j = 0; j < columns; j++) {
        array[i][j] = fn(i, j);
      }
    }
    return array;
  }

  static cloneArr<T>(arr: T[]): T[] {
    return cloneDeep(arr);
  }
}
