import Transform from "./transform";
import { ObfuscateOrder } from "../order";
import { ExitCallback } from "../traverse";
import { Identifier, Node } from "../util/gen";

export default class HexadecimalNumbers extends Transform {
  constructor(o) {
    super(o, ObfuscateOrder.HexadecimalNumbers);
  }

  match(object: Node, parents: Node[]): boolean {
    return (
      object.type === "Literal" &&
      typeof object.value === "number" &&
      Math.floor(object.value) === object.value
    );
  }

  transform(object: Node, parents: Node[]): void | ExitCallback {
    return () => {
      // Technically, a Literal will never be negative because it's supposed to be inside a UnaryExpression with a "-" operator.
      // This code handles it regardless
      var isNegative = object.value < 0;
      var hex = Math.abs(object.value).toString(16);

      var newStr = (isNegative ? "-" : "") + "0x" + hex;

      this.replace(object, Identifier(newStr));
    };
  }
}
