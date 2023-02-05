import { expect, describe, it } from "vitest";
import ArrUtil from "../src/utils/ArrUtil";

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

  it("ArrUtil.zip2", () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];
    const zip = ArrUtil.zip2(arr1, arr2);
    expect(zip).toStrictEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  it("ArrUtil.zip2", () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6, 7];
    const zip = ArrUtil.zip2(arr1, arr2);
    expect(zip).toStrictEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  it("ArrUtil.zip2", () => {
    const arr1 = ["a", "b", "c"];
    const arr2 = [{ a: 1 }, { b: 2 }, { c: 3 }];
    const zip = ArrUtil.zip2(arr1, arr2);
    expect(zip).toStrictEqual([
      ["a", { a: 1 }],
      ["b", { b: 2 }],
      ["c", { c: 3 }],
    ]);

    arr2[0].a = 4;
    arr2[1].b = 5;
    arr2[2].c = 6;

    expect(zip).toStrictEqual([
      ["a", { a: 1 }],
      ["b", { b: 2 }],
      ["c", { c: 3 }],
    ]);

    const fnTest = zip.map((x) => x[0]);
    expect(fnTest).toStrictEqual(arr1);
  });

  it("ArrUtil.zip3", () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6];
    const arr3 = [7, 8, 9];
    const zip = ArrUtil.zip3(arr1, arr2, arr3);
    expect(zip).toStrictEqual([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
    ]);
  });

  it("ArrUtil.zip3", () => {
    const arr1 = [1, 2, 3];
    const arr2 = [4, 5, 6, 7];
    const arr3 = [7, 8, 9, 10, 11];
    const zip = ArrUtil.zip3(arr1, arr2, arr3);
    expect(zip).toStrictEqual([
      [1, 4, 7],
      [2, 5, 8],
      [3, 6, 9],
    ]);
  });

  it("ArrUtil.zip3", () => {
    const arr1 = ["a", "b", "c"];
    const arr2 = [{ a: 1 }, { b: 2 }, { c: 3 }];
    const arr3 = [true, false, true];
    const zip = ArrUtil.zip3(arr1, arr2, arr3);
    expect(zip).toStrictEqual([
      ["a", { a: 1 }, true],
      ["b", { b: 2 }, false],
      ["c", { c: 3 }, true],
    ]);

    arr2[0].a = 4;
    arr2[1].b = 5;
    arr2[2].c = 6;

    expect(zip).toStrictEqual([
      ["a", { a: 1 }, true],
      ["b", { b: 2 }, false],
      ["c", { c: 3 }, true],
    ]);

    const fnTest = zip.map((x) => x[0]);
    expect(fnTest).toStrictEqual(arr1);
  });
});
