"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isStringLiteral = isStringLiteral;

function isStringLiteral(node) {
  return node.type === "Literal" && typeof node.value === "string" && !node.regex;
}