import { Node } from "./util/gen";
import { validateChain } from "./util/identifiers";

/**
 * A block refers to any object that has a **`.body`** property where code is nested.
 *
 * Types: `BlockStatement`, `Program`
 *
 * @param object
 * @param parents
 */
export function getBlock(object: any, parents: any[]) {
  if (!Array.isArray(parents)) {
    throw new Error("parents must be an array");
  }
  return [object, ...parents].find((node) => isBlock(node));
}

/**
 * Must have a **`.body`** property and be an array.
 *
 * - "BlockStatement"
 * - "Program"
 *
 * @param object
 */
export function isBlock(object: any) {
  return (
    object && (object.type == "BlockStatement" || object.type == "Program")
  );
}

export type EnterCallback = (
  object: Node,
  parents: Node[]
) => ExitCallback | "EXIT" | void;
export type ExitCallback = () => void;

export function walk(
  object: Node | Node[],
  parents: Node[],
  onEnter: EnterCallback,
  seen = new Set<Node>()
): "EXIT" | void {
  if (typeof object === "object" && object) {
    if (seen.has(object as any)) {
      console.log(object);
      throw new Error("Already seen: " + (object as any).type);
    }
    seen.add(object as any);

    var newParents: Node[] = [object as Node, ...parents];

    if (!Array.isArray(object)) {
      validateChain(object, parents);
    }

    // 1. Call `onEnter` function and remember any onExit callback returned
    var onExit = onEnter(object as Node, parents);

    // 2. Traverse children
    if (Array.isArray(object)) {
      var copy = [...object];
      for (var element of copy) {
        if (walk(element, newParents, onEnter) === "EXIT") {
          return "EXIT";
        }
      }
      copy.forEach((x) => {});
    } else {
      var keys = Object.keys(object);
      for (var key of keys) {
        if (!key.startsWith("$")) {
          if (walk(object[key], newParents, onEnter) === "EXIT") {
            return "EXIT";
          }
        }
      }
    }

    if (onExit === "EXIT") {
      return "EXIT";
    }

    // 3. Done with children, call `onExit` callback
    if (onExit) {
      onExit();
    }
  }
}

/**
 * The bare-bones walker.
 *
 * - Recursively traverse an AST object.
 * - Calls the `onEnter` function with:
 * - - `object` - The current node
 * - - `parents` - Array of ancestors `[closest, ..., root]`
 * - The `onEnter` callback can return an `onExit` callback for that node.
 *
 * - *Note*: Does not validate the property names.
 *
 * @param tree
 * @param onEnter
 */
export default function traverse(tree, onEnter: EnterCallback) {
  walk(tree, [], onEnter);
}
