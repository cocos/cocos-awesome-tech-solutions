"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseJS;
exports.parseSnippet = parseSnippet;
exports.parseSync = parseSync;

var assert = _interopRequireWildcard(require("assert"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

const acorn = require("acorn");
/**
 * Uses `acorn` to parse Javascript Code. Returns an AST tree.
 * @param code
 * @returns
 */


async function parseJS(code) {
  assert.ok(typeof code === "string", "code must be a string");

  try {
    var parsed = parseSync(code);
    return parsed;
  } catch (e) {
    throw e;
  }
}
/**
 * Parses a snippet code. Returns an AST Tree.
 * @param code
 * @returns
 */


function parseSnippet(code) {
  return acorn.parse(code, {
    ecmaVersion: "latest",
    allowReturnOutsideFunction: true,
    sourceType: "module"
  });
}
/**
 * Parses synchronously. Attempts to parse as a es-module, then fallbacks to a script.
 * @param code
 * @returns
 */


function parseSync(code) {
  try {
    return acorn.parse(code, {
      ecmaVersion: "latest",
      sourceType: "module"
    });
  } catch (e) {
    return acorn.parse(code, {
      ecmaVersion: "latest",
      sourceType: "script"
    });
  }
}