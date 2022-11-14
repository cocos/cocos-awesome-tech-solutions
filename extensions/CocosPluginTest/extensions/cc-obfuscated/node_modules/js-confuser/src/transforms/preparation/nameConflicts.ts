import { reservedIdentifiers } from "../../constants";
import { Node } from "../../util/gen";
import {
  getDefiningIdentifier,
  getIdentifierInfo,
} from "../../util/identifiers";
import Transform from "../transform";

export class NameMappingAnalysis extends Transform {
  names: Map<string, Set<Node>>;

  constructor(o) {
    super(o);

    this.names = new Map();
  }

  match(object, parents) {
    return object.type == "Identifier" && !reservedIdentifiers.has(object.name);
  }

  transform(object, parents) {
    var info = getIdentifierInfo(object, parents);

    if (info.spec.isReferenced && !info.spec.isDefined) {
      object.$definedAt = getDefiningIdentifier(object, parents);
    }

    if (info.spec.isDefined) {
      if (!this.names.has(object.name)) {
        this.names.set(object.name, new Set([object]));
      } else {
        this.names.get(object.name).add(object);
      }
    }
  }
}

/**
 * Renames variables & removes conflicts.
 *
 * - This helps transformations like `Dispatcher` not replace re-declared identifiers.
 */
export default class NameConflicts extends Transform {
  nameMappingAnalysis: NameMappingAnalysis;

  changes: Map<Node, string>;
  references: Map<Node, Set<Node>>;

  constructor(o) {
    super(o);

    this.before.push((this.nameMappingAnalysis = new NameMappingAnalysis(o)));
    this.changes = new Map();
    this.references = new Map();
  }

  match(object, parents) {
    return (
      object.type == "Identifier" &&
      !reservedIdentifiers.has(object.name) &&
      !this.options.globalVariables.has(object.name)
    );
  }

  transform(object: Node, parents: Node[]) {
    var info = getIdentifierInfo(object, parents);

    if (info.isMethodDefinition) {
      return;
    }

    if (object.$definedAt) {
      object.name = this.changes.get(object.$definedAt[0]) || object.name;

      if (!this.references.has(object.$definedAt[0])) {
        this.references.set(object.$definedAt[0], new Set([object]));
      } else {
        this.references.get(object.$definedAt[0]).add(object);
      }
    } else if (info.spec.isDefined) {
      var set = this.nameMappingAnalysis.names.get(object.name);
      if (set && set.size > 1) {
        var index = Array.from(set).indexOf(object);

        var newName = "_".repeat(index) + object.name;

        if (index > 4 || this.nameMappingAnalysis.names.has(newName)) {
          newName = this.getPlaceholder() + "_" + object.name;
        }

        object.name = newName;
        this.changes.set(object, newName);
        if (this.references.has(object)) {
          this.references.get(object).forEach((ref) => {
            ref.name = newName;
          });
        }
      }
    }
  }
}
