import Transform from "../transform";
import {
  Node,
  Literal,
  Identifier,
  MemberExpression,
  BlockStatement,
  ReturnStatement,
  CallExpression,
  ObjectExpression,
  ArrayExpression,
  ThisExpression,
  Property,
} from "../../util/gen";
import { clone, getBlockBody, prepend } from "../../util/insert";
import { isBlock, getBlock, walk } from "../../traverse";
import Template from "../../templates/template";
import { ObfuscateOrder } from "../../order";
import { ok } from "assert";
import { reservedKeywords } from "../../constants";
import AntiDestructuring from "./antiDestructuring";
import AntiTemplate from "./antiTemplate";
import AntiClass from "./antiClass";
import AntiES6Object from "./antiES6Object";
import AntiSpreadOperator from "./antiSpreadOperator";

/**
 * `Const` and `Let` are not allowed in ES5.
 */
class AntiConstLet extends Transform {
  constructor(o) {
    super(o);
  }

  match(object, parents) {
    return object.type == "VariableDeclaration" && object.kind != "var";
  }

  transform(object) {
    object.kind = "var";
  }
}

/**
 * Converts arrow functions
 */
export class AntiArrowFunction extends Transform {
  constructor(o) {
    super(o);
  }

  match(object, parents) {
    return object.type == "ArrowFunctionExpression";
  }

  transform(object, parents) {
    return () => {
      var usesThis = false;

      if (object.body.type != "BlockStatement" && object.expression) {
        object.body = BlockStatement([ReturnStatement(clone(object.body))]);
        object.expression = false;
      }

      walk(object.body, [object, ...parents], (o, p) => {
        if (p.filter((x) => isBlock(x))[0] == object.body) {
          if (
            o.type == "ThisExpression" ||
            (o.type == "Identifier" && o.name == "this")
          ) {
            usesThis = true;
          }
        }
      });

      ok(object.body.type == "BlockStatement", "Should be a BlockStatement");
      ok(Array.isArray(object.body.body), "Body should be an array");
      ok(
        !object.body.body.find((x) => Array.isArray(x)),
        "All elements should be statements"
      );

      object.type = "FunctionExpression";
      object.expression = false;

      if (usesThis) {
        this.objectAssign(
          object,
          CallExpression(
            MemberExpression(clone(object), Identifier("bind"), false),
            [ThisExpression()]
          )
        );
      }
    };
  }
}

class FixedExpressions extends Transform {
  constructor(o) {
    super(o);
  }

  match(object, parents) {
    return true;
  }

  transform(object, parents) {
    return () => {
      if (
        object.type == "ForStatement" &&
        object.init.type == "ExpressionStatement"
      ) {
        object.init = object.init.expression;
      }

      if (object.type == "MemberExpression") {
        if (!object.computed && object.property.type == "Identifier") {
          if (reservedKeywords.has(object.property.name)) {
            object.property = Literal(object.property.name);
            object.computed = true;
          }
        }
      }

      if (object.type == "Property") {
        if (!object.computed && object.key.type == "Identifier") {
          if (reservedKeywords.has(object.key.name)) {
            object.key = Literal(object.key.name);
          }
        }
      }
    };
  }
}

export default class ES5 extends Transform {
  constructor(o) {
    super(o, ObfuscateOrder.ES5);

    this.before.push(new AntiClass(o));
    this.before.push(new AntiTemplate(o));
    this.before.push(new AntiSpreadOperator(o));
    this.before.push(new AntiES6Object(o));
    this.before.push(new AntiArrowFunction(o));
    this.before.push(new AntiDestructuring(o));
    this.before.push(new AntiConstLet(o));

    this.concurrent.push(new FixedExpressions(o));
  }

  match(object: Node, parents: Node[]) {
    return object.type == "Program";
  }

  transform(object: Node, parents: Node[]) {
    var block = getBlock(object, parents);

    getBlockBody(block).splice(
      0,
      0,
      ...Template(`
    !Array.prototype.forEach ? Array.prototype.forEach = function (callback, thisArg) {
      thisArg = thisArg;
      for (var i = 0; i < this.length; i++) {
          callback.call(thisArg, this[i], i, this);
      }
    } : 0;
  
    !Array.prototype.map ? Array.prototype.map = function (callback, thisArg) {
      thisArg = thisArg;
      var array=[];
      for (var i = 0; i < this.length; i++) {
        array.push( callback.call(thisArg, this[i], i, this) );
      }
      return array;
    } : 0;

    !Array.prototype.reduce ? Array.prototype.reduce = function(fn, initial) {
      var values = this;
      if ( typeof initial === "undefined" ) {
        initial = 0;
      }

      values.forEach(function(item, index){
        initial = fn(initial, item, index, this);
      });

      return initial;
    } : 0;
  `).compile()
    );
  }
}
