import {
  AssignmentExpression,
  AssignmentPattern,
  AwaitExpression,
  BinaryExpression,
  BlockStatement,
  BreakStatement,
  ClassDeclaration,
  DebuggerStatement,
  FunctionDeclaration,
  FunctionExpression,
  Identifier,
  IfStatement,
  Literal,
  MemberExpression,
  MethodDefinition,
  ObjectExpression,
  Property,
  RegexLiteral,
  RestElement,
  SequenceExpression,
  SwitchDefaultCase,
  ThrowStatement,
  WithStatement,
} from "../../src/util/gen";

it("should return correct types", async () => {
  expect(BreakStatement("label")).toHaveProperty("type", "BreakStatement");
  expect(AwaitExpression(Identifier("test"))).toHaveProperty(
    "type",
    "AwaitExpression"
  );
  expect(AwaitExpression(Identifier("test"))).toHaveProperty(
    "type",
    "AwaitExpression"
  );
  expect(RegexLiteral("match", "")).toHaveProperty("type", "Literal");
  expect(SwitchDefaultCase([])).toHaveProperty("type", "SwitchCase");
  expect(
    MethodDefinition(
      Identifier("name"),
      FunctionExpression([], []),
      "method",
      false,
      false
    )
  ).toHaveProperty("type", "MethodDefinition");
  expect(ThrowStatement(Identifier("error"))).toHaveProperty(
    "type",
    "ThrowStatement"
  );
  expect(ThrowStatement(Identifier("error"))).toHaveProperty(
    "type",
    "ThrowStatement"
  );

  expect(ClassDeclaration(Identifier("className"), null, [])).toHaveProperty(
    "type",
    "ClassDeclaration"
  );

  expect(WithStatement(Identifier("variable"), [])).toHaveProperty(
    "type",
    "WithStatement"
  );

  expect(DebuggerStatement()).toHaveProperty("type", "DebuggerStatement");
  expect(RestElement(Identifier("array"))).toHaveProperty(
    "type",
    "RestElement"
  );
});

it("should throw when parameters are missing", async () => {
  expect(Identifier).toThrow();
  expect(() => Identifier("this")).toThrow();
  expect(() => Identifier("super")).toThrow();
  expect(() => Literal(undefined)).toThrow();

  expect(BlockStatement).toThrow();
  expect(() =>
    BinaryExpression("||", Identifier("left"), Identifier("right"))
  ).toThrow();

  expect(() =>
    BinaryExpression("||", Identifier("left"), Identifier("right"))
  ).toThrow();

  expect(Property).toThrow();
  expect(() => Property(Identifier("key"), null)).toThrow();

  expect(ObjectExpression).toThrow();
  expect(IfStatement).toThrow();
  expect(() => IfStatement(Identifier("test"), null)).toThrow();
  expect(() =>
    IfStatement(Identifier("test"), Identifier("notArray") as any)
  ).toThrow();
  expect(() =>
    IfStatement(Identifier("test"), [], Identifier("notArray") as any)
  ).toThrow();

  expect(() => FunctionDeclaration("test", [], null)).toThrow();
  expect(() => FunctionDeclaration("test", [], [[]] as any)).toThrow();
  expect(() => SequenceExpression(null)).toThrow();
  expect(() => SequenceExpression([])).toThrow();

  expect(() => MemberExpression(null, Identifier("target"), false)).toThrow();
  expect(() => MemberExpression(Identifier("object"), null, false)).toThrow();
  expect(() =>
    MemberExpression(Identifier("object"), Literal("stringKey"), false)
  ).toThrow();

  expect(() => AssignmentPattern(Identifier("object"), null)).toThrow();
  expect(() => AssignmentPattern(null, Identifier("defaultValue"))).toThrow();
  expect(() => WithStatement(null, [])).toThrow();
  expect(() => WithStatement([] as any, [])).toThrow();

  expect(() =>
    MemberExpression(Identifier("new"), Identifier("target"), false)
  ).toThrow();
});
