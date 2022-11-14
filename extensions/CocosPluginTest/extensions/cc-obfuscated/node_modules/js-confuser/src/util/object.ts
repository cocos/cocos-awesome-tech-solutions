export function createObject(
  keys: string[],
  values: any[]
): { [key: string]: any } {
  if (keys.length != values.length) {
    throw new Error("length mismatch");
  }

  var newObject = {};

  keys.forEach((x, i) => {
    newObject[x] = values[i];
  });

  return newObject;
}

/**
 * Removes all `$`-prefixed properties on a deeply nested object.
 *
 * - Modifies the object.
 */
export function remove$Properties(object: any, seen = new Set<Node>()) {
  if (typeof object === "object" && object) {
    if (seen.has(object)) {
      // console.log(object);
      // throw new Error("Already seen");
    }
    seen.add(object);

    Object.keys(object).forEach((key) => {
      if (key.charAt(0) == "$") {
        delete object[key];
      } else {
        remove$Properties(object[key], seen);
      }
    });
  }
}
