import {
  ArrayExpression,
  AssignmentExpression,
  CallExpression,
  Identifier,
  MemberExpression,
  Node,
  ThisExpression,
  VariableDeclaration,
  VariableDeclarator,
} from "../../util/gen";
import { prepend } from "../../util/insert";
import Transform from "../transform";

// fn(...args) -> fn.apply(this, [...args])
export default class AntiSpreadOperator extends Transform {
  constructor(o) {
    super(o);
  }

  match(object, parents) {
    return (
      object.type == "CallExpression" &&
      object.arguments.find((x) => x.type == "SpreadElement")
    );
  }

  transform(object: Node, parents: Node[]) {
    return () => {
      var ref;

      if (object.callee.type == "MemberExpression") {
        ref = this.getPlaceholder();

        object.callee.object = AssignmentExpression("=", Identifier(ref), {
          ...object.callee.object,
        });
        prepend(
          parents[parents.length - 1],
          VariableDeclaration(VariableDeclarator(ref))
        );
      }

      this.replace(
        object,
        CallExpression(
          MemberExpression({ ...object.callee }, Identifier("apply"), false),
          [
            ref ? Identifier(ref) : ThisExpression(),
            ArrayExpression(object.arguments),
          ]
        )
      );
    };
  }
}
