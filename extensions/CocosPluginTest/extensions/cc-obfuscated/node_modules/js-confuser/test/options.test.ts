import JsConfuser from "../src/index";

it("should accept percentages", async () => {
  var output = await JsConfuser(`var TEST_VARIABLE;`, {
    target: "node",
    renameGlobals: true,
    renameVariables: true,
    stringConcealing: 0.5,
  });

  expect(output).not.toContain("TEST_VARIABLE");
});

it("should accept probability arrays", async () => {
  var output = await JsConfuser(`var TEST_VARIABLE;`, {
    target: "node",
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: ["hexadecimal", "mangled"], // half hexadecimal, half randomized
  });

  expect(output).not.toContain("TEST_VARIABLE");
});

it("should accept probability maps", async () => {
  var output = await JsConfuser(`var TEST_VARIABLE;`, {
    target: "node",
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: {
      // 25% each
      hexadecimal: 0.25,
      randomized: 0.25,
      mangled: 0.25,
      number: 0.25,
    },
  });

  expect(output).not.toContain("TEST_VARIABLE");
});

it("should work with compact false", async () => {
  var output = await JsConfuser(`var TEST_VARIABLE;`, {
    target: "node",
    renameGlobals: true,
    renameVariables: true,
    compact: false,
  });

  expect(output).not.toContain("TEST_VARIABLE");
});

it("should work with indent set to 2 spaces", async () => {
  var output = await JsConfuser(`var TEST_VARIABLE;`, {
    target: "node",
    renameGlobals: true,
    renameVariables: true,
    compact: false,
    indent: 2,
  });

  expect(output).not.toContain("TEST_VARIABLE");
});

it("should work with debugComments enabled", async () => {
  var output = await JsConfuser(`var TEST_VARIABLE;`, {
    target: "node",
    renameGlobals: true,
    renameVariables: true,
    compact: false,
    indent: 2,
    debugComments: true,
  });

  expect(output).not.toContain("TEST_VARIABLE");
});
