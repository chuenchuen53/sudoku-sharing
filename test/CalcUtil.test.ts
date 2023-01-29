import { expect, describe, it } from "vitest";
import CalcUtil from "../src/utils/CalcUtil";

describe("CalcUtil", () => {
  it("CalcUtil.combination1 test 1", () => {
    const arr = ["a", "b", "c", "d", "e"];
    const comb = CalcUtil.combinations1(arr);

    expect(comb).toStrictEqual([["a"], ["b"], ["c"], ["d"], ["e"]]);
  });

  it("CalcUtil.combination1 test 2", () => {
    const arr = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 3, name: "c" },
    ];
    const comb = CalcUtil.combinations1(arr);

    expect(comb).toStrictEqual([[{ id: 1, name: "a" }], [{ id: 2, name: "b" }], [{ id: 3, name: "c" }]]);
  });

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
    const arr = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 3, name: "c" },
    ];
    const comb = CalcUtil.combinations2(arr);

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

  it("CalcUtil.combination3 test 1", () => {
    const arr = ["a", "b", "c", "d", "e"];
    const comb = CalcUtil.combinations3(arr);

    expect(comb).toStrictEqual([
      ["a", "b", "c"],
      ["a", "b", "d"],
      ["a", "b", "e"],
      ["a", "c", "d"],
      ["a", "c", "e"],
      ["a", "d", "e"],
      ["b", "c", "d"],
      ["b", "c", "e"],
      ["b", "d", "e"],
      ["c", "d", "e"],
    ]);
  });

  it("CalcUtil.combination3 test 2", () => {
    const arr = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 3, name: "c" },
      { id: 4, name: "c" },
    ];
    const comb = CalcUtil.combinations3(arr);

    expect(comb).toStrictEqual([
      [
        { id: 1, name: "a" },
        { id: 2, name: "b" },
        { id: 3, name: "c" },
      ],
      [
        { id: 1, name: "a" },
        { id: 2, name: "b" },
        { id: 4, name: "c" },
      ],
      [
        { id: 1, name: "a" },
        { id: 3, name: "c" },
        { id: 4, name: "c" },
      ],
      [
        { id: 2, name: "b" },
        { id: 3, name: "c" },
        { id: 4, name: "c" },
      ],
    ]);
  });

  it("CalcUtil.combination4 test 1", () => {
    const arr = ["a", "b", "c", "d", "e"];
    const comb = CalcUtil.combinations4(arr);

    expect(comb).toStrictEqual([
      ["a", "b", "c", "d"],
      ["a", "b", "c", "e"],
      ["a", "b", "d", "e"],
      ["a", "c", "d", "e"],
      ["b", "c", "d", "e"],
    ]);
  });

  it("CalcUtil.combination4 test 2", () => {
    const arr = [
      { id: 1, name: "a" },
      { id: 2, name: "b" },
      { id: 3, name: "c" },
      { id: 4, name: "c" },
      { id: 5, name: "c" },
    ];
    const comb = CalcUtil.combinations4(arr);

    expect(comb).toStrictEqual([
      [
        { id: 1, name: "a" },
        { id: 2, name: "b" },
        { id: 3, name: "c" },
        { id: 4, name: "c" },
      ],
      [
        { id: 1, name: "a" },
        { id: 2, name: "b" },
        { id: 3, name: "c" },
        { id: 5, name: "c" },
      ],
      [
        { id: 1, name: "a" },
        { id: 2, name: "b" },
        { id: 4, name: "c" },
        { id: 5, name: "c" },
      ],
      [
        { id: 1, name: "a" },
        { id: 3, name: "c" },
        { id: 4, name: "c" },
        { id: 5, name: "c" },
      ],
      [
        { id: 2, name: "b" },
        { id: 3, name: "c" },
        { id: 4, name: "c" },
        { id: 5, name: "c" },
      ],
    ]);
  });

  it("CalcUtil.combinationsWithSubset test 1", () => {
    const arr = ["a", "b", "c", "d", "e"];
    const comb = CalcUtil.combinationsWithSubset(arr, 1);

    expect(comb).toStrictEqual([["a"], ["b"], ["c"], ["d"], ["e"]]);
  });

  it("CalcUtil.combinationsWithSubset test 2", () => {
    const arr = ["a", "b", "c", "d", "e"];
    const comb = CalcUtil.combinationsWithSubset(arr, 2);

    expect(comb).toStrictEqual([
      ["a"],
      ["b"],
      ["c"],
      ["d"],
      ["e"],
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

  it("CalcUtil.combinationsWithSubset test 3", () => {
    const arr = ["a", "b", "c", "d", "e"];
    const comb = CalcUtil.combinationsWithSubset(arr, 3);

    expect(comb).toStrictEqual([
      ["a"],
      ["b"],
      ["c"],
      ["d"],
      ["e"],
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
      ["a", "b", "c"],
      ["a", "b", "d"],
      ["a", "b", "e"],
      ["a", "c", "d"],
      ["a", "c", "e"],
      ["a", "d", "e"],
      ["b", "c", "d"],
      ["b", "c", "e"],
      ["b", "d", "e"],
      ["c", "d", "e"],
    ]);
  });

  it("CalcUtil.combinationsWithSubset test 4", () => {
    const arr = ["a", "b", "c", "d", "e"];
    const comb = CalcUtil.combinationsWithSubset(arr, 4);

    expect(comb).toStrictEqual([
      ["a"],
      ["b"],
      ["c"],
      ["d"],
      ["e"],
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
      ["a", "b", "c"],
      ["a", "b", "d"],
      ["a", "b", "e"],
      ["a", "c", "d"],
      ["a", "c", "e"],
      ["a", "d", "e"],
      ["b", "c", "d"],
      ["b", "c", "e"],
      ["b", "d", "e"],
      ["c", "d", "e"],
      ["a", "b", "c", "d"],
      ["a", "b", "c", "e"],
      ["a", "b", "d", "e"],
      ["a", "c", "d", "e"],
      ["b", "c", "d", "e"],
    ]);
  });
});
