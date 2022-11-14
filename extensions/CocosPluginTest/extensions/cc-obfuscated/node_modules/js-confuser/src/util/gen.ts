import { ok } from "assert";
import { isValidIdentifier } from "./compare";

export type Type =
  | "Identifier"
  | "Literal"
  | "VariableDeclaration"
  | "VariableDeclarator"
  | "IfStatement"
  | "SwitchStatement"
  | "SwitchCase"
  | "FunctionDeclaration"
  | "ClassDeclaration"
  | "ClassExpression"
  | "ClassBody"
  | "BlockStatement"
  | "Program"
  | "ThisExpression"
  | "Super"
  | "ForInStatement"
  | "ForOfStatement"
  | "WhileStatement"
  | "DoWhileStatement"
  | "UnaryExpression"
  | "ExpressionStatement"
  | "AssignmentExpression"
  | "NewExpression"
  | "CallExpression"
  | "ArrayPattern"
  | "LogicalExpression"
  | "BinaryExpression"
  | "UpdateExpression"
  | "ThrowStatement"
  | "MethodDefinition"
  | "LabeledStatement";

export type Node = { type: string; [key: string]: any };

/**
 * 0. First index is the Node.
 * 1. Second index is the parents as an array.
 */
export type Location = [Node, Node[]];

/**
 * Eval Callbacks are called once all transformations are done.
 *
 * - Called with object, and parents.
 */
export type EvalCallback = {
  $eval: (object: Node, parents: Node[]) => void;
  [key: string]: any;
};

/**
 * - 0. First index is the Node.
 * - ...1 Parent nodes.
 */
export type Chain = Node[];

export function Literal(value: string | number | boolean): Node {
  if (typeof value === "undefined") {
    throw new Error("value is undefined");
  }
  if (typeof value == "number" && value < 0) {
    return UnaryExpression("-", Literal(Math.abs(value)));
  }
  ok(value === value, "NaN value is disallowed");

  return {
    type: "Literal",
    value: value,
  };
}

export function RegexLiteral(pattern: string, flags: string) {
  return {
    type: "Literal",
    regex: {
      pattern,
      flags,
    },
  };
}

export function Identifier(name: string) {
  if (!name) {
    throw new Error("name is null/empty");
  }
  if (name == "this") {
    throw new Error("Use ThisExpression");
  }
  if (name == "super") {
    throw new Error("Use Super");
  }
  return {
    type: "Identifier",
    name: name.toString(),
  };
}

export function BlockStatement(body: Node[]) {
  if (!Array.isArray(body)) {
    throw new Error("not array");
  }
  return {
    type: "BlockStatement",
    body: body,
  };
}

export function LogicalExpression(operator: string, left: Node, right: Node) {
  return {
    type: "LogicalExpression",
    operator,
    left,
    right,
  };
}

export function BinaryExpression(operator: string, left: Node, right: Node) {
  if (operator == "||" || operator == "&&") {
    throw new Error("invalid operator, use LogicalExpression");
  }
  return {
    type: "BinaryExpression",
    operator,
    left,
    right,
  };
}

export function ThisExpression() {
  return { type: "ThisExpression" };
}

export function SwitchCase(test: any, consequent: Node[]) {
  ok(test === null || test);
  ok(Array.isArray(consequent));
  return {
    type: "SwitchCase",
    test,
    consequent,
  };
}

export function SwitchDefaultCase(consequent: Node[]) {
  return SwitchCase(null, consequent);
}

export function LabeledStatement(label: string, body: Node) {
  return {
    type: "LabeledStatement",
    label: Identifier(label),
    body: body,
  };
}

export function SwitchStatement(discriminant: any, cases: Node[]) {
  return {
    type: "SwitchStatement",
    discriminant: discriminant,
    cases: cases,
  };
}

export function BreakStatement(label?: string) {
  return {
    type: "BreakStatement",
    label: label ? Identifier(label) : null,
  };
}

export function Property(key: Node, value: Node, computed = false) {
  if (!key) {
    throw new Error("key is undefined");
  }
  if (!value) {
    throw new Error("value is undefined");
  }
  return {
    type: "Property",
    key: key,
    computed: computed,
    value: value,
    kind: "init",
    method: false,
    shorthand: false,
  };
}

export function ObjectExpression(properties: Node[]) {
  if (!properties) {
    throw new Error("properties is null");
  }
  return {
    type: "ObjectExpression",
    properties: properties,
  };
}

export function VariableDeclarator(id: string | Node, init: Node = null) {
  if (typeof id === "string") {
    id = Identifier(id);
  }
  return {
    type: "VariableDeclarator",
    id,
    init,
  };
}

export function VariableDeclaration(
  declarations: Node | Node[],
  kind: "var" | "const" | "let" = "var"
) {
  if (!Array.isArray(declarations)) {
    declarations = [declarations];
  }

  ok(Array.isArray(declarations));
  ok(declarations.length);

  ok(!declarations.find((x) => x.type == "ExpressionStatement"));

  return {
    type: "VariableDeclaration",
    declarations: declarations,
    kind: kind,
  };
}

export function ForStatement(
  variableDeclaration: any,
  test: any,
  update: any,
  body: any[]
) {
  ok(variableDeclaration);
  ok(test);
  ok(update);
  return {
    type: "ForStatement",
    init: variableDeclaration,
    test: test,
    update: update,
    body: BlockStatement(body),
  };
}

export function WhileStatement(test: any, body: Node[]) {
  ok(test);
  return {
    type: "WhileStatement",
    test,
    body: BlockStatement(body),
  };
}

export function IfStatement(
  test: Node,
  consequent: Node[],
  alternate: Node[] | null = null
): Node {
  if (!test) {
    throw new Error("test is undefined");
  }

  if (!consequent) {
    throw new Error("consequent undefined, use empty array instead");
  }

  if (!Array.isArray(consequent)) {
    throw new Error(
      "consequent needs to be array, found " + (consequent as any).type
    );
  }

  if (alternate && !Array.isArray(alternate)) {
    throw new Error(
      "alternate needs to be array, found " + (alternate as any).type
    );
  }

  return {
    type: "IfStatement",
    test: test,
    consequent: BlockStatement(consequent),
    alternate: alternate ? BlockStatement(alternate) : null,
  };
}

export function FunctionExpression(params: Node[], body: any[]) {
  ok(Array.isArray(params), "params should be an array");

  return {
    type: "FunctionExpression",
    id: null,
    params: params,
    body: BlockStatement(body),
    generator: false,
    expression: false,
    async: false,
  };
}

/**
 * ```js
 * function name(p[0], p[1], p[2], ...p[4]){
 *     body[0];
 *     body[1]...
 * }
 * ```
 * @param name
 * @param params
 * @param body
 */
export function FunctionDeclaration(
  name: string,
  params: Node[],
  body: Node[]
) {
  if (!body) {
    throw new Error("undefined body");
  }
  if (body && Array.isArray(body[0])) {
    throw new Error("nested array");
  }
  ok(Array.isArray(params), "params should be an array");
  return {
    type: "FunctionDeclaration",
    id: Identifier(name),
    params: params,
    body: BlockStatement(body),
    generator: false,
    expression: false,
    async: false,
  };
}

export function DebuggerStatement() {
  return {
    type: "DebuggerStatement",
  };
}

export function ReturnStatement(argument: Node = null) {
  if (argument) {
    ok(argument.type, "Argument should be a node");
  }
  return {
    type: "ReturnStatement",
    argument: argument,
  };
}

export function AwaitExpression(argument: Node) {
  ok(argument.type, "Argument should be a node");
  return {
    type: "AwaitExpression",
    argument,
  };
}

export function ConditionalExpression(
  test: Node,
  consequent: Node,
  alternate: Node
) {
  ok(test);
  ok(consequent);
  ok(alternate);
  return {
    type: "ConditionalExpression",
    test,
    consequent,
    alternate,
  };
}

export function ExpressionStatement(expression: Node) {
  ok(expression.type);
  return {
    type: "ExpressionStatement",
    expression: expression,
  } as Node;
}

export function UnaryExpression(operator: string, argument: Node) {
  ok(typeof operator === "string");
  ok(argument.type);

  return {
    type: "UnaryExpression",
    operator,
    argument,
  } as Node;
}

export function UpdateExpression(
  operator: string,
  argument: Node,
  prefix = false
) {
  return {
    type: "UpdateExpression",
    operator,
    argument,
    prefix,
  } as Node;
}

export function SequenceExpression(expressions: Node[]) {
  if (!expressions) {
    throw new Error("expressions undefined");
  }
  if (!expressions.length) {
    throw new Error("expressions length = 0");
  }
  return {
    type: "SequenceExpression",
    expressions: expressions,
  };
}

export function MemberExpression(
  object: Node,
  property: Node,
  computed = true
) {
  if (!object) {
    throw new Error("object undefined");
  }
  if (!property) {
    throw new Error("property undefined");
  }
  if (!computed && property.type == "Literal") {
    throw new Error("literal must be computed property");
  }
  if (object.name == "new" && property.name == "target") {
    throw new Error("new.target is a MetaProperty");
  }
  return {
    type: "MemberExpression",
    computed: computed,
    object: object,
    property: property,
  };
}

export function CallExpression(callee: Node, args: Node[]) {
  ok(Array.isArray(args), "args should be an array");
  return {
    type: "CallExpression",
    callee: callee,
    arguments: args,
  };
}

export function NewExpression(callee: Node, args: Node[]) {
  return {
    type: "NewExpression",
    callee,
    arguments: args,
  };
}

export function AssignmentExpression(
  operator: string,
  left: Node,
  right: Node
) {
  return {
    type: "AssignmentExpression",
    operator: operator,
    left: left,
    right: right,
  };
}

export function ArrayPattern(elements: Node[]) {
  ok(Array.isArray(elements));
  return {
    type: "ArrayPattern",
    elements: elements,
  };
}

export function ArrayExpression(elements: Node[]) {
  ok(Array.isArray(elements));
  return {
    type: "ArrayExpression",
    elements,
  };
}

export function AssignmentPattern(left: Node, right: Node) {
  ok(left);
  ok(right);
  return {
    type: "AssignmentPattern",
    left: left,
    right: right,
  };
}

export function AddComment(node: Node, text: string) {
  if ((node as any).leadingComments) {
    (node as any).leadingComments.push({
      type: "Block",
      value: text,
    });
  } else {
    Object.assign(node, {
      leadingComments: [
        {
          type: "Block",
          value: text,
        },
      ],
    });
  }

  return node;
}

export function MethodDefinition(
  identifier: Node,
  functionExpression: Node,
  kind: "method" | "constructor" | "get" | "set",
  isStatic = true,
  computed = false
) {
  return {
    type: "MethodDefinition",
    key: identifier,
    computed: computed,
    value: functionExpression,
    kind: kind,
    static: isStatic,
  } as Node;
}

export function ClassDeclaration(
  id: Node,
  superClass: Node = null,
  body: Node[] = []
) {
  return {
    type: "ClassDeclaration",
    id: id,
    superClass: superClass,
    body: {
      type: "ClassBody",
      body: body,
    },
  } as Node;
}

export function ThrowStatement(argument: Node) {
  return {
    type: "ThrowStatement",
    argument: argument,
  } as Node;
}

export function WithStatement(object: Node, body: Node[]) {
  ok(object, "object");
  ok(object.type, "object should be node");

  return {
    type: "WithStatement",
    object,
    body: BlockStatement(body),
  };
}

/**
 * `fn(...args)`
 * @param argument
 * @returns
 */
export function SpreadElement(argument: Node) {
  return {
    type: "SpreadElement",
    argument,
  };
}

/**
 * `function fn(...params){}`
 * @param argument
 * @returns
 */
export function RestElement(argument: Node) {
  return {
    type: "RestElement",
    argument,
  };
}

export function CatchClause(param: Node = null, body) {
  return {
    type: "CatchClause",
    param: param,
    body: BlockStatement(body),
  };
}

export function TryStatement(body: Node[], handler: Node, finallyBody: Node[]) {
  ok(handler);
  ok(handler.type == "CatchClause");
  return {
    type: "TryStatement",
    block: BlockStatement(body),
    handler: handler,
    finalizer: finallyBody ? BlockStatement(finallyBody) : null,
  };
}
