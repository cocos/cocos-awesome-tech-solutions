import { ok } from "assert";
import { reservedIdentifiers } from "../../constants";
import { walk } from "../../traverse";
import { isValidIdentifier } from "../../util/compare";
import { Node } from "../../util/gen";
import { getIdentifierInfo } from "../../util/identifiers";
import {
  getDefiningContext,
  getVarContext,
  getLexContext,
  isContext,
  getReferencingContexts,
} from "../../util/insert";
import Transform from "../transform";

/**
 * Keeps track of what identifiers are defined and referenced in each context.
 */
export default class VariableAnalysis extends Transform {
  /**
   * Node being the context.
   */
  defined: Map<Node, Set<string>>;

  /**
   * Context->Nodes referenced (does not include nested)
   */
  references: Map<Node, Set<string>>;

  /**
   * Set of global identifiers to never be redefined
   */
  globals: Set<string>;

  /**
   * Set of identifers that are defined within the program
   */
  notGlobals: Set<string>;

  constructor(o) {
    super(o);

    this.defined = new Map();
    this.references = new Map();
    this.globals = new Set();
    this.notGlobals = new Set();
  }

  match(object, parents) {
    return isContext(object);
  }

  transform(object, parents) {
    walk(object, parents, (o, p) => {
      if (o.type == "Identifier") {
        var name = o.name;
        ok(typeof name === "string");
        if (!isValidIdentifier(name)) {
          return;
        }

        if (reservedIdentifiers.has(name)) {
          return;
        }
        if (this.options.globalVariables.has(name)) {
          return;
        }

        var info = getIdentifierInfo(o, p);
        if (!info.spec.isReferenced) {
          return;
        }

        if (info.spec.isExported) {
          return;
        }

        var isDefined = info.spec.isDefined;

        // Keep track of defined names within the program
        if (isDefined) {
          this.notGlobals.add(o.name);
          this.globals.delete(o.name);
        } else if (!this.notGlobals.has(o.name)) {
          this.globals.add(o.name);
        }

        var definingContexts = info.spec.isDefined
          ? [getDefiningContext(o, p)]
          : getReferencingContexts(o, p, info);

        ok(definingContexts.length);

        definingContexts.forEach((definingContext) => {
          ok(
            isContext(definingContext),
            `${definingContext.type} is not a context`
          );

          if (isDefined) {
            // Add to defined Map
            if (!this.defined.has(definingContext)) {
              this.defined.set(definingContext, new Set());
            }
            this.defined.get(definingContext).add(name);
            this.references.has(definingContext) &&
              this.references.get(definingContext).delete(name);
          } else {
            // Add to references Map
            if (
              !this.defined.has(definingContext) ||
              !this.defined.get(definingContext).has(name)
            ) {
              if (!this.references.has(definingContext)) {
                this.references.set(definingContext, new Set());
              }
              this.references.get(definingContext).add(name);
            }
          }
        });
      }
    });
  }
}
