import Template from "../../templates/template";
import { walk } from "../../traverse";
import {
  BinaryExpression,
  Identifier,
  Literal,
  VariableDeclaration,
  VariableDeclarator,
} from "../../util/gen";
import { clone } from "../../util/insert";
import { getRandomInteger } from "../../util/random";
import Transform from "../transform";

/**
 * Does complex math to the state variable, after both CFF and CFO have run.
 *
 * The switch statements are ones with numbered cases and a simple discriminant.
 */
export default class SwitchCaseObfuscation extends Transform {
  constructor(o) {
    super(o);
  }

  match(object, parents) {
    return (
      object.type == "SwitchStatement" &&
      !object.cases.find(
        (x) =>
          !(
            x.test.type == "Literal" &&
            typeof x.test.value === "number" &&
            Math.abs(x.test.value) < 100_000
          )
      )
    );
  }

  transform(object, parents) {
    var types = new Set();
    walk(object.discriminant, [object, ...parents], (o, p) => {
      if (o.type) {
        if (
          object.$controlFlowFlattening &&
          o.type == "BinaryExpression" &&
          o.operator === "+"
        ) {
        } else {
          types.add(o.type);
        }
      }
    });

    types.delete("Identifier");
    if (types.size) {
      return;
    }

    var body = parents[0];
    var element = object;

    if (parents[0].type == "LabeledStatement") {
      body = parents[1];
      element = parents[0];
    }

    if (!Array.isArray(body)) {
      return;
    }

    var index = body.indexOf(element);
    if (index === -1) {
      return;
    }

    var factor = getRandomInteger(-150, 150);
    if (factor == 0) {
      factor = 2;
    }
    var offset = getRandomInteger(-250, 250);

    var newVar = this.getPlaceholder();

    var newStates = [];
    var max;
    object.cases.forEach((x) => {
      var current = x.test.value;
      var value = current * factor + offset;

      newStates.push(value);
      if (!max || Math.abs(value) > max) {
        max = Math.abs(value);
      }
    });

    if (max > 100_000) {
      return;
    }

    if (new Set(newStates).size !== newStates.length) {
      // not possible because of clashing case test
      return;
    }

    // State variable declaration
    body.splice(
      index,
      0,
      VariableDeclaration(
        VariableDeclarator(
          newVar,

          BinaryExpression(
            "+",
            BinaryExpression("*", clone(object.discriminant), Literal(factor)),
            Literal(offset)
          )
        )
      )
    );

    object.discriminant = Identifier(newVar);

    // possible so override
    object.cases.forEach((x, i) => {
      x.test = Literal(newStates[i]);
    });
  }
}
