"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _transform = _interopRequireDefault(require("./transform"));

var _gen = require("../util/gen");

var _traverse = require("../traverse");

var _compare = require("../util/compare");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Ensures every break; statement has a label to point to.
 *
 * This is because Control Flow Flattening adds For Loops which label-less break statements point to the nearest,
 * when they actually need to point to the original statement.
 */
class Label extends _transform.default {
  constructor(o) {
    super(o);
  }

  match(object, parents) {
    return (0, _compare.isLoop)(object) || object.type == "BlockStatement" && parents[0] && parents[0].type == "LabeledStatement" && parents[0].body === object;
  }

  transform(object, parents) {
    return () => {
      var currentLabel = parents[0].type == "LabeledStatement" && parents[0].label.name;
      var label = currentLabel || this.getPlaceholder();
      (0, _traverse.walk)(object, parents, (o, p) => {
        if (o.type == "BreakStatement" || o.type == "ContinueStatement") {
          function isContinuableStatement(x) {
            return (0, _compare.isLoop)(x) && x.type !== "SwitchStatement";
          }

          function isBreakableStatement(x) {
            return (0, _compare.isLoop)(x) || o.label && x.type == "BlockStatement";
          }

          var fn = o.type == "ContinueStatement" ? isContinuableStatement : isBreakableStatement;
          var loop = p.find(fn);

          if (object == loop) {
            if (!o.label) {
              o.label = (0, _gen.Identifier)(label);
            }
          }
        }
      }); // Append label statement as this loop has none

      if (!currentLabel) {
        this.replace(object, (0, _gen.LabeledStatement)(label, { ...object
        }));
      }
    };
  }

}

exports.default = Label;