"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _gen = require("../../util/gen");

var _transform = _interopRequireDefault(require("../transform"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class ChoiceFlowObfuscation extends _transform.default {
  constructor(o) {
    super(o);
  }

  match(object, parents) {
    return object.type == "IfStatement";
  }

  transform(object, parents) {
    return () => {
      var body = parents[0];
      var element = object;

      if (parents[0].type == "LabeledStatement") {
        body = parents[1];
        element = parents[0];
      }

      var before = [];
      var isNested = parents[0].type == "IfStatement" && parents[0].alternate === object;

      if (!isNested && (!Array.isArray(body) || body.indexOf(element) === -1)) {
        return;
      }

      var result = this.getPlaceholder();
      before.push((0, _gen.VariableDeclaration)((0, _gen.VariableDeclarator)(result)));
      var yesBody = object.consequent ? object.consequent.type == "BlockStatement" ? [...object.consequent.body] : [object.consequent] : [];
      yesBody.unshift((0, _gen.ExpressionStatement)((0, _gen.AssignmentExpression)("=", (0, _gen.Identifier)(result), (0, _gen.Literal)(1))));
      var noBody = object.alternate ? object.alternate.type == "BlockStatement" ? [...object.alternate.body] : [object.alternate] : [];
      noBody.unshift((0, _gen.ExpressionStatement)((0, _gen.AssignmentExpression)("=", (0, _gen.Identifier)(result), (0, _gen.Literal)(1))));
      var elseTest = (0, _gen.UnaryExpression)("!", (0, _gen.Identifier)(result));
      var newObject = (0, _gen.TryStatement)([(0, _gen.IfStatement)({ ...object.test
      }, [(0, _gen.ThrowStatement)((0, _gen.Identifier)(result))])], (0, _gen.CatchClause)((0, _gen.Identifier)(this.getPlaceholder()), yesBody), [(0, _gen.IfStatement)(elseTest, noBody)]);

      if (isNested) {
        this.replace(object, (0, _gen.BlockStatement)([...before, { ...newObject
        }]));
      } else {
        body.splice(body.indexOf(element), 0, ...before);
        this.replace(object, newObject);
      }
    };
  }

}

exports.default = ChoiceFlowObfuscation;