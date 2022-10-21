export default class ArrayUtils {
  static create2DArray<T extends string | number | boolean | Object>(
    rows: number,
    cols: number,
    defaultValue: T
  ): T[][] {
    const array: T[][] = [];
    const defaultObject = JSON.stringify(typeof defaultValue === "object" ? defaultValue : {});
    for (let i = 0; i < rows; i++) {
      array[i] = [];
      for (let j = 0; j < cols; j++) {
        if (typeof defaultValue === "object") {
          array[i][j] = JSON.parse(defaultObject);
        } else {
          array[i][j] = defaultValue;
        }
      }
    }
    return array;
  }

  static checkDuplicates<T extends string | number | undefined>(
    arr: T[]
  ): { haveDuplicate: boolean; duplicatedElements: T[] } {
    const excludedUndefined = arr.filter((element) => element !== undefined);
    const haveDuplicate = excludedUndefined.some((element, index) => excludedUndefined.indexOf(element) !== index);
    const duplicatedElements = excludedUndefined.filter(
      (element, index) => excludedUndefined.indexOf(element) !== index
    );
    return { haveDuplicate, duplicatedElements };
  }
}
