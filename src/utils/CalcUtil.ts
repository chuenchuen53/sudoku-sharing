import "lodash.combinations";
import _ from "lodash";

export default class CalcUtil {
  static xor = (a: boolean, b: boolean): boolean => {
    return a ? !b : b;
  };

  static combinations<T>(arr: T[], size: number): T[][] {
    // @ts-ignore
    return _.combinations(arr, size);
  }

  static cartesianProduct<T extends number | string>(...args: T[][]): T[][] {
    return args.reduce((acc, cur) => acc.flatMap((d) => cur.map((e) => [d, e].flat())), [] as T[][]);
  }
}
