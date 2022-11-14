import {
  AssignmentExpression,
  BlockStatement,
  CatchClause,
  ExpressionStatement,
  Identifier,
  IfStatement,
  Literal,
  ThrowStatement,
  TryStatement,
  UnaryExpression,
  VariableDeclaration,
  VariableDeclarator,
} from "../../util/gen";
import Transform from "../transform";

export default class ChoiceFlowObfuscation extends Transform {
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

      var isNested =
        parents[0].type == "IfStatement" && parents[0].alternate === object;

      if (!isNested && (!Array.isArray(body) || body.indexOf(element) === -1)) {
        return;
      }

      var result = this.getPlaceholder();
      before.push(VariableDeclaration(VariableDeclarator(result)));

      var yesBody = object.consequent
        ? object.consequent.type == "BlockStatement"
          ? [...object.consequent.body]
          : [object.consequent]
        : [];

      yesBody.unshift(
        ExpressionStatement(
          AssignmentExpression("=", Identifier(result), Literal(1))
        )
      );

      var noBody = object.alternate
        ? object.alternate.type == "BlockStatement"
          ? [...object.alternate.body]
          : [object.alternate]
        : [];

      noBody.unshift(
        ExpressionStatement(
          AssignmentExpression("=", Identifier(result), Literal(1))
        )
      );

      var elseTest = UnaryExpression("!", Identifier(result));

      var newObject = TryStatement(
        [IfStatement({ ...object.test }, [ThrowStatement(Identifier(result))])],
        CatchClause(Identifier(this.getPlaceholder()), yesBody),
        [IfStatement(elseTest, noBody)]
      );

      if (isNested) {
        this.replace(object, BlockStatement([...before, { ...newObject }]));
      } else {
        body.splice(body.indexOf(element), 0, ...before);
        this.replace(object, newObject);
      }
    };
  }
}
