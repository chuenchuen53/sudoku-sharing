export default class CalcUtil {
  static xor = (a: boolean, b: boolean): boolean => {
    return a ? !b : b;
  };

  static combinations1<T>(arr: T[]): [T][] {
    return arr.map((v) => [v]);
  }

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

  static combinations<T>(arr: T[], size: 1 | 2 | 3 | 4): [T][] | [T, T][] | [T, T, T][] | [T, T, T, T][] {
    switch (size) {
      case 1:
        return CalcUtil.combinations1(arr);
      case 2:
        return CalcUtil.combinations2(arr);
      case 3:
        return CalcUtil.combinations3(arr);
      case 4:
        return CalcUtil.combinations4(arr);
    }
  }

  static combinationsWithSubset<T>(arr: T[], size: 1 | 2 | 3 | 4): T[][] {
    const result: T[][] = [];

    for (let i = 1; i <= size; i++) {
      result.push(...CalcUtil.combinations(arr, i as 1 | 2 | 3 | 4));
    }

    return result;
  }

  // todo
  static cartesianProduct<T>(...args: T[][]): T[][] {
    // @ts-ignore
    return args.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));
  }
}
