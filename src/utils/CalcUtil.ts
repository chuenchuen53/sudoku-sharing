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

  // todo
  static cartesianProduct<T>(...args: T[][]): T[][] {
    // @ts-ignore
    return args.reduce((a, b) => a.flatMap((d) => b.map((e) => [d, e].flat())));
  }
}
