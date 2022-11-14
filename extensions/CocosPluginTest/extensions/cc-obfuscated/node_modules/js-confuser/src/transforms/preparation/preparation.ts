/**
 * The file contains all preparation transformations
 */
import Transform from "../transform";

import {
  BlockStatement,
  Identifier,
  LabeledStatement,
  Literal,
  Location,
  Node,
  ReturnStatement,
} from "../../util/gen";
import { ObfuscateOrder } from "../../order";
import { getIndexDirect, clone, getFunction } from "../../util/insert";
import { ok } from "assert";
import { getIdentifierInfo } from "../../util/identifiers";
import { walk } from "../../traverse";
import Label from "../label";
import NameConflicts from "./nameConflicts";
import AntiDestructuring from "../es5/antiDestructuring";
import { OPERATOR_PRECEDENCE } from "../../precedence";
import { isLoop } from "../../util/compare";

/**
 * People use shortcuts and its harder to parse.
 *
 * - `if (a) b()` -> `if (a) { b() }`
 * - Ensures all bodies are `BlockStatement`, not individual expression statements
 */
class Block extends Transform {
  constructor(o) {
    super(o);
  }

  match(object, parents) {
    return !Array.isArray(object);
  }

  transform(object, parents) {
    switch (object.type) {
      case "IfStatement":
        if (object.consequent.type != "BlockStatement") {
          object.consequent = BlockStatement([clone(object.consequent)]);
        }
        if (object.alternate && object.alternate.type != "BlockStatement") {
          object.alternate = BlockStatement([clone(object.alternate)]);
        }
        break;

      case "WhileStatement":
      case "WithStatement":
      case "ForStatement":
      case "ForOfStatement":
      case "ForInStatement":
        if (object.body.type != "BlockStatement") {
          object.body = BlockStatement([clone(object.body)]);
        }
        break;

      case "ArrowFunctionExpression":
        if (object.body.type !== "BlockStatement" && object.expression) {
          object.body = BlockStatement([ReturnStatement(clone(object.body))]);
          object.expression = false;
        }
        break;
    }
  }
}

class ExplicitIdentifiers extends Transform {
  constructor(o) {
    super(o);
  }

  match(object, parents) {
    return object.type == "Identifier";
  }

  transform(object, parents) {
    if (object.name === "eval") {
      var fn = getFunction(object, parents);
      if (fn) {
        fn.$requiresEval = true;
      }
    }

    var info = getIdentifierInfo(object, parents);
    if (info.isPropertyKey || info.isAccessor) {
      var propIndex = parents.findIndex(
        (x) => x.type == "MethodDefinition" || x.type == "Property"
      );
      if (propIndex !== -1) {
        if (
          parents[propIndex].type == "MethodDefinition" &&
          parents[propIndex].kind == "constructor"
        ) {
          return;
        }
      }

      this.log(object.name, "->", `'${object.name}'`);

      this.replace(object, Literal(object.name));
      parents[0].computed = true;
      parents[0].shorthand = false;
    }
  }
}

class ExplicitDeclarations extends Transform {
  constructor(o) {
    super(o);
  }

  match(object, parents) {
    return object.type == "VariableDeclaration";
  }

  transform(object, parents) {
    // for ( var x in ... ) {...}
    var forIndex = parents.findIndex(
      (x) => x.type == "ForInStatement" || x.type == "ForOfStatement"
    );
    if (
      forIndex != -1 &&
      parents[forIndex].left == (parents[forIndex - 1] || object)
    ) {
      object.declarations.forEach((x) => {
        x.init = null;
      });
      return;
    }

    var body = parents[0];
    if (isLoop(body) || body.type == "LabeledStatement") {
      return;
    }

    if (body.type == "ExportNamedDeclaration") {
      return;
    }

    if (!Array.isArray(body)) {
      this.error(new Error("body is " + body.type));
    }

    if (object.declarations.length > 1) {
      // Make singular

      var index = body.indexOf(object);
      if (index == -1) {
        this.error(new Error("index is -1"));
      }

      var after = object.declarations.slice(1);

      body.splice(
        index + 1,
        0,
        ...after.map((x) => {
          return {
            type: "VariableDeclaration",
            declarations: [clone(x)],
            kind: object.kind,
          };
        })
      );

      object.declarations.length = 1;
    }
  }
}

export default class Preparation extends Transform {
  constructor(o) {
    super(o, ObfuscateOrder.Preparation);

    this.before.push(new Block(o));
    this.before.push(new Label(o));
    this.before.push(new ExplicitIdentifiers(o));
    this.before.push(new ExplicitDeclarations(o));

    if (this.options.es5) {
      this.before.push(new AntiDestructuring(o));
    }

    // this.before.push(new NameConflicts(o));
  }

  match() {
    return false;
  }
}
