import { walk } from "../traverse";
import { Node } from "./gen";
import { getBlockBody, isFunction } from "./insert";

export function isEquivalent(first: Node, second: Node) {
  var extra = {
    start: 1,
    end: 1,
    loc: 1,
  };

  function removeExtra(obj) {
    if (typeof obj === "object") {
      for (var property in obj) {
        if (obj && obj.hasOwnProperty(property)) {
          if (typeof obj[property] == "object") {
            removeExtra(obj[property]);
          } else {
            if (extra[property]) {
              delete obj[property];
            }
          }
        }
      }
    }

    return obj;
  }
  return (
    JSON.stringify(removeExtra(first)) == JSON.stringify(removeExtra(second))
  );
}
/**
 * Statements that allowed `break;` and `continue;` statements
 * @param object
 */
export function isLoop(object: Node) {
  return [
    "SwitchStatement",
    "WhileStatement",
    "DoWhileStatement",
    "ForStatement",
    "ForInStatement",
    "ForOfStatement",
  ].includes(object.type);
}

export function isValidIdentifier(name: string): boolean {
  if (typeof name !== "string") {
    return false;
  }
  if (name.includes(".") || name.includes(" ")) {
    return false;
  }

  var x = name.match(/^[A-z$_][A-z0-9$_]*/);
  return x && x[0] == name;
}

export function isInsideType(
  type: string,
  object: Node,
  parents: Node[]
): boolean {
  return [object, ...parents].some((x) => x.type == type);
}

export function isDirective(object: Node, parents: Node[]) {
  var dIndex = parents.findIndex((x) => x.directive);
  if (dIndex == -1) {
    return false;
  }

  return parents[dIndex].expression == (parents[dIndex - 1] || object);
}

export function isIndependent(object: Node, parents: Node[]) {
  if (object.type == "Literal") {
    return true;
  }

  var parent = parents[0];

  if (object.type == "Identifier") {
    var set = new Set(["null", "undefined"]);
    if (set.has(object.name)) {
      return true;
    }
    if (parent.type == "Property") {
      if (!parent.computed && parent.key == object) {
        return true;
      }
    }

    return false;
  }

  if (
    object.type == "ArrayExpression" ||
    object.type == "ObjectExpression" ||
    object.type == "Property"
  ) {
    var allowIt = true;
    walk(object, parents, ($object, $parents) => {
      if (object != $object) {
        if (!Array.isArray($object) && !isIndependent($object, $parents)) {
          allowIt = false;
        }
      }
    });

    return allowIt;
  }

  return false;
}

var primitiveIdentifiers = new Set(["undefined", "NaN"]);

/**
 * booleans, numbers, string, null, undefined, NaN, infinity
 *
 * Types:
 * - `Literal` with typeof `node.value` = `"number" | "string" | "boolean"`
 * - `Identifier` with `name` = `"undefined" | "NaN"`
 *
 *
 * @param node
 * @returns
 */
export function isPrimitive(node: Node) {
  if (node.type == "Literal") {
    if (node.value === null) {
      return true;
    } else if (typeof node.value === "number") {
      return true;
    } else if (typeof node.value === "string") {
      return true;
    } else if (typeof node.value === "boolean") {
      return true;
    }
  } else if (node.type == "Identifier") {
    return primitiveIdentifiers.has(node.name);
  }

  return false;
}
