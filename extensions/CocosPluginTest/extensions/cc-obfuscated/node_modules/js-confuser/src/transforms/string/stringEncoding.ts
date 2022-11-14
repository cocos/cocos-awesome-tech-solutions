import Transform from "../transform";
import { choice } from "../../util/random";
import { ObfuscateOrder } from "../../order";
import { isDirective } from "../../util/compare";
import { isModuleSource } from "./stringConcealing";

function pad(x: string, len: number): string {
  while (x.length < len) {
    x = "0" + x;
  }
  return x;
}

function even(x: string) {
  if (x.length % 2 != 0) {
    return "0" + x;
  }
  return x;
}

function toHexRepresentation(str: string) {
  var escapedString = "";
  str.split("").forEach((char) => {
    var code = char.charCodeAt(0);
    if (code < 128) {
      escapedString += "\\x" + even(pad(code.toString(16), 2));
    } else {
      escapedString += char;
    }
  });

  return escapedString;
}

function toUnicodeRepresentation(str: string) {
  var escapedString = "";
  str.split("").forEach((char) => {
    var code = char.charCodeAt(0);
    if (code < 128) {
      escapedString += "\\u" + even(pad(code.toString(16), 4));
    } else {
      escapedString += char;
    }
  });

  return escapedString;
}

/**
 * [String Encoding](https://docs.jscrambler.com/code-integrity/documentation/transformations/string-encoding) transforms a string into an encoded representation.
 *
 * - Potency Low
 * - Resilience Low
 * - Cost Low
 */
export default class StringEncoding extends Transform {
  seen: Set<Node>;

  constructor(o) {
    super(o, ObfuscateOrder.StringEncoding);
  }

  apply(tree) {
    this.seen = new Set();
    super.apply(tree);
  }

  match(object, parents) {
    return (
      object.type == "Literal" &&
      typeof object.value === "string" &&
      !isModuleSource(object, parents) &&
      !isDirective(object, parents)
    );
  }

  transform(object, parents) {
    // Todo fix circular json problems
    if (this.seen.has(object)) {
      return;
    }
    this.seen.add(object);

    var type = choice(["hexadecimal", "unicode"]);

    var escapedString = (
      type == "hexadecimal" ? toHexRepresentation : toUnicodeRepresentation
    )(object.value);

    // escodegen tries to escape backslashes, here is a work-around
    this.replace(object, {
      type: "Identifier",
      name: `'${escapedString}'`,
    });
  }
}
