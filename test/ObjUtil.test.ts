import { expect, describe, it } from "vitest";
import ObjUtil from "../src/utils/ObjUtil";

describe("ObjUtil", () => {
  it("ObjUtil.boolObjEquality", () => {
    const obj1 = {
      "1": true,
      "2": false,
      "3": true,
      "4": false,
      "5": true,
      "6": false,
      "7": true,
      "8": false,
      "9": true,
    };

    const obj2 = {
      "1": true,
      "2": false,
      "3": true,
      "4": false,
      "5": true,
      "6": false,
      "7": true,
      "8": false,
      "9": true,
    };

    const obj3 = {
      "5": true,
      "6": false,
      "7": true,
      "8": false,
      "9": true,
      "1": true,
      "2": false,
      "3": true,
      "4": false,
    };

    const obj4 = {
      "1": true,
      "2": false,
      "3": true,
      "4": false,
      "5": true,
      "6": false,
      "7": true,
      "8": false,
    };

    const obj5 = {
      "1": false,
      "2": false,
      "3": true,
      "4": false,
      "5": true,
      "6": false,
      "7": true,
      "8": false,
      "9": true,
    };

    expect(ObjUtil.boolObjEquality(obj1, obj2)).toBe(true);
    expect(ObjUtil.boolObjEquality(obj1, obj3)).toBe(true);
    expect(ObjUtil.boolObjEquality(obj1, obj4)).toBe(false);
    expect(ObjUtil.boolObjEquality(obj1, obj5)).toBe(false);
  });
});
