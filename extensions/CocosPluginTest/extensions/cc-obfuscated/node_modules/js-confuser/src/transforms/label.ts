import Transform from "./transform";
import { Identifier, LabeledStatement } from "../util/gen";
import { walk } from "../traverse";
import { clone } from "../util/insert";
import { isLoop } from "../util/compare";

/**
 * Ensures every break; statement has a label to point to.
 *
 * This is because Control Flow Flattening adds For Loops which label-less break statements point to the nearest,
 * when they actually need to point to the original statement.
 */
export default class Label extends Transform {
  constructor(o) {
    super(o);
  }

  match(object, parents) {
    return (
      isLoop(object) ||
      (object.type == "BlockStatement" &&
        parents[0] &&
        parents[0].type == "LabeledStatement" &&
        parents[0].body === object)
    );
  }

  transform(object, parents) {
    return () => {
      var currentLabel =
        parents[0].type == "LabeledStatement" && parents[0].label.name;

      var label = currentLabel || this.getPlaceholder();

      walk(object, parents, (o, p) => {
        if (o.type == "BreakStatement" || o.type == "ContinueStatement") {
          function isContinuableStatement(x) {
            return isLoop(x) && x.type !== "SwitchStatement";
          }
          function isBreakableStatement(x) {
            return isLoop(x) || (o.label && x.type == "BlockStatement");
          }

          var fn =
            o.type == "ContinueStatement"
              ? isContinuableStatement
              : isBreakableStatement;

          var loop = p.find(fn);
          if (object == loop) {
            if (!o.label) {
              o.label = Identifier(label);
            }
          }
        }
      });

      // Append label statement as this loop has none
      if (!currentLabel) {
        this.replace(object, LabeledStatement(label, { ...object }));
      }
    };
  }
}
