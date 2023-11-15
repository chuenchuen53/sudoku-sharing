import { expect, describe, it } from "vitest";
import ArrUtil from "../core/utils/ArrUtil";

describe("ArrUtil", () => {
  it("ArrUtil.create2DArray", () => {
    const arr1 = ArrUtil.create2DArray(3, 3, () => 0);
    expect(arr1).toStrictEqual([
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ]);

    const arr2 = ArrUtil.create2DArray(3, 3, () => "0");
    expect(arr2).toStrictEqual([
      ["0", "0", "0"],
      ["0", "0", "0"],
      ["0", "0", "0"],
    ]);

    const arr3 = ArrUtil.create2DArray(3, 3, () => true);
    expect(arr3).toStrictEqual([
      [true, true, true],
      [true, true, true],
      [true, true, true],
    ]);

    const arr4 = ArrUtil.create2DArray(2, 2, () => ({ a: 1 }));
    expect(arr4).toStrictEqual([
      [{ a: 1 }, { a: 1 }],
      [{ a: 1 }, { a: 1 }],
    ]);

    const arr5 = ArrUtil.create2DArray(3, 2, () => ({ a: 1, b: { c: 2 } }));
    expect(arr5).toStrictEqual([
      [
        { a: 1, b: { c: 2 } },
        { a: 1, b: { c: 2 } },
      ],
      [
        { a: 1, b: { c: 2 } },
        { a: 1, b: { c: 2 } },
      ],
      [
        { a: 1, b: { c: 2 } },
        { a: 1, b: { c: 2 } },
      ],
    ]);
  });

  it("ArrUtil.create2DArray", () => {
    const arr = ArrUtil.create2DArray(2, 2, () => ({ a: 1 }));
    arr[0][0].a = 2;
    arr[0][1].a = 5;
    arr[1][0].a = 3;
    expect(arr).toStrictEqual([
      [{ a: 2 }, { a: 5 }],
      [{ a: 3 }, { a: 1 }],
    ]);
  });

  it("ArrUtil.cloneArr", () => {
    const arr = [1, 2, 3];
    const clone = ArrUtil.cloneArr(arr);
    expect(clone).toStrictEqual(arr);

    clone[0] = 4;
    clone[1] = 5;
    clone[2] = 6;
    expect(arr).toStrictEqual([1, 2, 3]);
    expect(clone).toStrictEqual([4, 5, 6]);
  });

  it("ArrUtil.cloneArr", () => {
    const arr = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    const clone = ArrUtil.cloneArr(arr);
    expect(clone).toStrictEqual(arr);

    clone[0][0] = 11;
    clone[0][1] = 12;
    clone[0][2] = 13;
    clone[1][0] = 14;
    clone[1][1] = 15;
    clone[1][2] = 16;
    clone[2][0] = 17;
    clone[2][1] = 18;
    clone[2][2] = 19;
    expect(arr).toStrictEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    expect(clone).toStrictEqual([
      [11, 12, 13],
      [14, 15, 16],
      [17, 18, 19],
    ]);
  });
});
