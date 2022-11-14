import { ok } from "assert";
import { ObfuscateOrder } from "../../order";
import { walk } from "../../traverse";
import { Location, Node } from "../../util/gen";
import { getIdentifierInfo } from "../../util/identifiers";
import {
  getVarContext,
  isVarContext,
  getLexContext,
  isContext,
  isLexContext,
  getDefiningContext,
} from "../../util/insert";
import { isValidIdentifier } from "../../util/compare";
import Transform from "../transform";
import { reservedIdentifiers } from "../../constants";
import { ComputeProbabilityMap } from "../../probability";
import VariableAnalysis from "./variableAnalysis";

/**
 * Rename variables to randomly generated names.
 *
 * - Attempts to re-use already generated names in nested scopes.
 */
export default class RenameVariables extends Transform {
  // Generator object
  gen: any;

  // Names already used
  generated: string[];

  // Map of Context->Object of changes
  changed: Map<Node, { [name: string]: string }>;

  // Ref to VariableAnalysis data
  variableAnalysis: VariableAnalysis;

  constructor(o) {
    super(o, ObfuscateOrder.RenameVariables);

    this.changed = new Map();

    this.variableAnalysis = new VariableAnalysis(o);
    this.before.push(this.variableAnalysis);
    this.gen = this.getGenerator();
    this.generated = [];
  }

  match(object, parents) {
    return isContext(object);
  }

  transform(object, parents) {
    var isGlobal = object.type == "Program";
    var type = isGlobal
      ? "root"
      : isVarContext(object)
      ? "var"
      : isLexContext(object)
      ? "lex"
      : undefined;

    ok(type);

    var newNames = Object.create(null);

    var defined = this.variableAnalysis.defined.get(object) || new Set();
    var references = this.variableAnalysis.references.get(object) || new Set();

    if (!defined && !this.changed.has(object)) {
      this.changed.set(object, Object.create(null));
      return;
    }

    var possible = new Set();

    if (this.generated.length && !isGlobal) {
      var allReferences = new Set(references || []);
      var nope = new Set(defined);
      walk(object, [], (o, p) => {
        var ref = this.variableAnalysis.references.get(o);
        if (ref) {
          ref.forEach((x) => allReferences.add(x));
        }

        var def = this.variableAnalysis.defined.get(o);
        if (def) {
          def.forEach((x) => allReferences.add(x));
        }
      });

      var passed = new Set();
      parents.forEach((p) => {
        var changes = this.changed.get(p);
        if (changes) {
          Object.keys(changes).forEach((x) => {
            var name = changes[x];

            if (!allReferences.has(x)) {
              passed.add(name);
            } else {
              nope.add(name);
            }
          });
        }
      });

      nope.forEach((x) => passed.delete(x));

      possible = passed;
    }

    defined.forEach((name) => {
      if (
        (isGlobal && !name.startsWith("__p_")
          ? ComputeProbabilityMap(this.options.renameGlobals, (x) => x, name)
          : true) &&
        ComputeProbabilityMap(
          this.options.renameVariables,
          (x) => x,
          name,
          isGlobal
        )
      ) {
        // Fix 2. Ensure global names aren't overridden
        var newName;
        do {
          if (possible.size) {
            var first = possible.values().next().value;
            possible.delete(first);
            newName = first;
          } else {
            // Fix 1. Use `generateIdentifier` over `gen.generate()` so Integrity can get unique variable names
            var g = this.generateIdentifier();

            newName = g;
            this.generated.push(g);
          }
        } while (this.variableAnalysis.globals.has(newName));

        newNames[name] = newName;
      } else {
        newNames[name] = name;
      }
    });

    this.changed.set(object, newNames);

    walk(object, parents, (o, p) => {
      if (o.type == "Identifier") {
        if (
          reservedIdentifiers.has(o.name) ||
          this.options.globalVariables.has(o.name)
        ) {
          return;
        }

        var info = getIdentifierInfo(o, p);

        if (info.spec.isExported) {
          return;
        }

        if (!info.spec.isReferenced) {
          return;
        }

        var contexts = [o, ...p].filter((x) => isContext(x));
        var newName = null;

        for (var check of contexts) {
          if (
            this.variableAnalysis.defined.has(check) &&
            this.variableAnalysis.defined.get(check).has(o.name)
          ) {
            if (this.changed.has(check) && this.changed.get(check)[o.name]) {
              newName = this.changed.get(check)[o.name];
              break;
            }
          }
        }

        if (newName && typeof newName === "string") {
          if (o.$renamed) {
            return;
          }

          // console.log(o.name, "->", newName);
          o.name = newName;
          o.$renamed = true;
        }
      }
    });
  }
}
