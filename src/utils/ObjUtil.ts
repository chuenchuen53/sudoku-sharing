interface OneLayerObj {
  [x: string]: boolean;
}

export default class OjbUtils {
  static shallowEquality(obj1: OneLayerObj, obj2: OneLayerObj): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
      return false;
    }
    for (let i = 0; i < keys1.length; i++) {
      const key = keys1[i];
      if (obj1[key] !== obj2[key]) {
        return false;
      }
    }
    return true;
  }
}
