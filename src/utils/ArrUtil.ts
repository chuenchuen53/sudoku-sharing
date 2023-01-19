import cloneDeep from "lodash/cloneDeep";

type NonArrayObject = object & { length?: never };

export default class ArrUtil {
  static create2DArray<T extends string | number | boolean | NonArrayObject>(
    rows: number,
    columns: number,
    defaultValue: T
  ): T[][] {
    const array: T[][] = [];
    const defaultObject = JSON.stringify(typeof defaultValue === "object" ? defaultValue : {});
    for (let i = 0; i < rows; i++) {
      array[i] = [];
      for (let j = 0; j < columns; j++) {
        if (typeof defaultValue === "object") {
          array[i][j] = JSON.parse(defaultObject);
        } else {
          array[i][j] = defaultValue;
        }
      }
    }
    return array;
  }

  // static checkDuplicates<T extends string | number | undefined>(
  //   arr: T[]
  // ): { haveDuplicate: boolean; duplicatedElements: T[] } {
  //   const excludedUndefined = arr.filter((element) => element !== undefined);
  //   const haveDuplicate = excludedUndefined.some((element, index) => excludedUndefined.indexOf(element) !== index);
  //   const duplicatedElements = excludedUndefined.filter(
  //     (element, index) => excludedUndefined.indexOf(element) !== index
  //   );
  //   return { haveDuplicate, duplicatedElements };
  // }

  static cloneArr<T>(arr: T[]): T[] {
    return cloneDeep(arr);
  }

  static zip2<A, B>(a: A[], b: B[]): [A, B][] {
    const length = Math.min(a.length, b.length);
    const result: [A, B][] = Array(length);
    const aClone = ArrUtil.cloneArr(a);
    const bClone = ArrUtil.cloneArr(b);

    for (let i = 0; i < length; i++) {
      result[i] = [aClone[i], bClone[i]];
    }
    return result;
  }

  static zip3<A, B, C>(a: A[], b: B[], c: C[]): [A, B, C][] {
    const length = Math.min(a.length, b.length, c.length);
    const result: [A, B, C][] = Array(length);
    const aClone = ArrUtil.cloneArr(a);
    const bClone = ArrUtil.cloneArr(b);
    const cClone = ArrUtil.cloneArr(c);

    for (let i = 0; i < length; i++) {
      result[i] = [aClone[i], bClone[i], cClone[i]];
    }
    return result;
  }
}
