import { expect, describe, it } from "vitest";
import CalcUtil from "../src/utils/CalcUtil";

describe("CalcUtil", () => {
  it("CalcUtil.combination2 test 1", () => {
    const arr = ["a", "b", "c", "d", "e"];
    const comb = CalcUtil.combinations2(arr);

    expect(comb).toStrictEqual([
      ["a", "b"],
      ["a", "c"],
      ["a", "d"],
      ["a", "e"],
      ["b", "c"],
      ["b", "d"],
      ["b", "e"],
      ["c", "d"],
      ["c", "e"],
      ["d", "e"],
    ]);
  });

  it("CalcUtil.combination2 test 2", () => {
    const arr1 = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 3, name: "c" },
    ];
    const comb = CalcUtil.combinations2(arr1);

    expect(comb).toStrictEqual([
      [
        { id: 1, name: "a" },
        { id: 2, name: "b" },
      ],
      [
        { id: 1, name: "a" },
        { id: 3, name: "c" },
      ],
      [
        { id: 2, name: "b" },
        { id: 3, name: "c" },
      ],
    ]);
  });
});
