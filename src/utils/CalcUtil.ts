export default class CalcUtil {
  static combination<T>(array: T[]) {
    const result: [T, T][] = [];
    // skip the last element directly
    for (let i = 0; i < array.length - 1; i++) {
      for (let j = i + 1; j < array.length; j++) {
        result.push([array[i], array[j]]);
      }
    }

    return result;
  }
}
