import "lodash.combinations";
import _ from "lodash";

export default class CalcUtil {
  static combinations<T>(arr: T[], size: number): T[][] {
    // @ts-ignore
    return _.combinations(arr, size);
  }
}
