"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _gen = require("../../util/gen");

var _insert = require("../../util/insert");

var _transform = _interopRequireDefault(require("../transform"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// fn(...args) -> fn.apply(this, [...args])
class AntiSpreadOperator extends _transform.default {
  constructor(o) {
    super(o);
  }

  match(object, parents) {
    return object.type == "CallExpression" && object.arguments.find(x => x.type == "SpreadElement");
  }

  transform(object, parents) {
    return () => {
      var ref;

      if (object.callee.type == "MemberExpression") {
        ref = this.getPlaceholder();
        object.callee.object = (0, _gen.AssignmentExpression)("=", (0, _gen.Identifier)(ref), { ...object.callee.object
        });
        (0, _insert.prepend)(parents[parents.length - 1], (0, _gen.VariableDeclaration)((0, _gen.VariableDeclarator)(ref)));
      }

      this.replace(object, (0, _gen.CallExpression)((0, _gen.MemberExpression)({ ...object.callee
      }, (0, _gen.Identifier)("apply"), false), [ref ? (0, _gen.Identifier)(ref) : (0, _gen.ThisExpression)(), (0, _gen.ArrayExpression)(object.arguments)]));
    };
  }

}

exports.default = AntiSpreadOperator;