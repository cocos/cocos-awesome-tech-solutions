"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createObject = createObject;
exports.remove$Properties = remove$Properties;

function createObject(keys, values) {
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


function remove$Properties(object) {
  let seen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : new Set();

  if (typeof object === "object" && object) {
    if (seen.has(object)) {// console.log(object);
      // throw new Error("Already seen");
    }

    seen.add(object);
    Object.keys(object).forEach(key => {
      if (key.charAt(0) == "$") {
        delete object[key];
      } else {
        remove$Properties(object[key], seen);
      }
    });
  }
}