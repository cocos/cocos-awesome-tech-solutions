"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _template = _interopRequireDefault(require("../../templates/template"));

var _gen = require("../../util/gen");

var _insert = require("../../util/insert");

var _transform = _interopRequireDefault(require("../transform"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class AntiTemplate extends _transform.default {
  constructor(o) {
    super(o);

    _defineProperty(this, "makerFn", void 0);
  }

  match(object, parents) {
    return object.type == "TemplateLiteral" || object.type == "TaggedTemplateExpression";
  }

  transform(object, parents) {
    return () => {
      if (object.type == "TemplateLiteral") {
        if (parents[0].type == "TaggedTemplateExpression" && parents[0].quasi == object) {
          return;
        }

        if (object.quasis.length == 1 && object.expressions.length == 0) {
          this.replace(object, (0, _gen.Literal)(object.quasis[0].value.cooked));
        } else {
          var binaryExpression = null;
          object.quasis.forEach((q, i) => {
            var expr = object.expressions[i];
            var str = (0, _gen.Literal)(q.value.cooked);

            if (!binaryExpression) {
              binaryExpression = (0, _gen.BinaryExpression)("+", str, expr);
            } else {
              if (expr) {
                binaryExpression.right = (0, _gen.BinaryExpression)("+", binaryExpression.right, (0, _gen.BinaryExpression)("+", str, expr));
              } else {
                binaryExpression.right = (0, _gen.BinaryExpression)("+", binaryExpression.right, str);
              }
            }
          });
          this.replace(object, binaryExpression);
        }
      } else if (object.type == "TaggedTemplateExpression") {
        var literal = object.quasi;

        if (!this.makerFn) {
          this.makerFn = "es6_template" + this.getPlaceholder();
          (0, _insert.prepend)(parents[parents.length - 1], (0, _template.default)("\n          function {name}(arr, raw){\n            arr.raw = raw;\n            return arr;\n          }\n          ").single({
            name: this.makerFn
          }));
        }

        this.replace(object, (0, _gen.CallExpression)(object.tag, [(0, _gen.CallExpression)((0, _gen.Identifier)(this.makerFn), [(0, _gen.ArrayExpression)(literal.quasis.map(x => (0, _gen.Literal)(x.value.cooked))), (0, _gen.ArrayExpression)(literal.quasis.map(x => (0, _gen.Literal)(x.value.raw)))]), ...literal.expressions]));
      }
    };
  }

}

exports.default = AntiTemplate;