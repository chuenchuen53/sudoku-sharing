import "lodash.combinations";
import _ from "lodash";

export default class CalcUtil {
  static xor = (a: boolean, b: boolean): boolean => {
    return a ? !b : b;
  };

  static combinations2<T>(arr: T[]): [T, T][] {
    const result: [T, T][] = [];

    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        result.push([arr[i], arr[j]]);
      }
    }

    return result;
  }

  static combinations3<T>(arr: T[]): [T, T, T][] {
    const result: [T, T, T][] = [];

    for (let i = 0; i < arr.length - 2; i++) {
      for (let j = i + 1; j < arr.length - 1; j++) {
        for (let k = j + 1; k < arr.length; k++) {
          result.push([arr[i], arr[j], arr[k]]);
        }
      }
    }

    return result;
  }

  static combinations4<T>(arr: T[]): [T, T, T, T][] {
    const result: [T, T, T, T][] = [];

    for (let i = 0; i < arr.length - 3; i++) {
      for (let j = i + 1; j < arr.length - 2; j++) {
        for (let k = j + 1; k < arr.length - 1; k++) {
          for (let m = k + 1; m < arr.length; m++) {
            result.push([arr[i], arr[j], arr[k], arr[m]]);
          }
        }
      }
    }

    return result;
  }

  static combinations<T>(arr: T[], size: number): T[][] {
    // @ts-ignore
    return _.combinations(arr, size);
  }

  // todo
  static cartesianProduct<T>(...args: T[][]): T[][] {
    // @ts-ignore
    return args.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));
  }
}
