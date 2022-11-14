"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getLexicalScope = getLexicalScope;
exports.isLexicalScope = isLexicalScope;

var _traverse = require("../traverse");

function isLexicalScope(object) {
  return (0, _traverse.isBlock)(object) || object.type == "SwitchCase";
}

function getLexicalScope(object, parents) {
  return [object, ...parents].find(node => isLexicalScope(node));
}