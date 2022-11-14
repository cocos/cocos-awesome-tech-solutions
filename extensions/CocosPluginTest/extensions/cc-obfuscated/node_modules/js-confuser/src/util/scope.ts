import { isBlock } from "../traverse";

export function isLexicalScope(object) {
  return isBlock(object) || object.type == "SwitchCase";
}

export function getLexicalScope(object, parents) {
  return [object, ...parents].find((node) => isLexicalScope(node));
}
