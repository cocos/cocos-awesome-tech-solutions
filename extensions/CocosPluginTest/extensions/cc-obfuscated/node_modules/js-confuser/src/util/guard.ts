import { Node } from "./gen";

export function isStringLiteral(node: Node) {
  return (
    node.type === "Literal" && typeof node.value === "string" && !node.regex
  );
}
