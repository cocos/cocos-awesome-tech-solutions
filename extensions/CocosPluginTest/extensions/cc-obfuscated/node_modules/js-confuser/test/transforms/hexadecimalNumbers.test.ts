import JsConfuser from "../../src/index";

test("Variant #1: Positive integer to hexadecimal", async () => {
  var output = await JsConfuser.obfuscate(`TEST_VAR = 10;`, {
    target: "node",
    hexadecimalNumbers: true,
  });

  expect(output).toContain("0xa");
  expect(output).not.toContain("10");

  var TEST_VAR;

  eval(output);

  expect(TEST_VAR).toStrictEqual(10);
});

test("Variant #2: Negative integer to hexadecimal", async () => {
  var output = await JsConfuser.obfuscate(`TEST_VAR = -10;`, {
    target: "node",
    hexadecimalNumbers: true,
  });

  expect(output).toContain("-0xa");
  expect(output).not.toContain("-10");

  var TEST_VAR;

  eval(output);

  expect(TEST_VAR).toStrictEqual(-10);
});

test("Variant #3: Don't change floats", async () => {
  var output = await JsConfuser.obfuscate(`var TEST_VAR = [15.5, -75.9];`, {
    target: "node",
    hexadecimalNumbers: true,
  });

  expect(output).toContain("15.5");
  expect(output).toContain("-75.9");
  expect(output).not.toContain("0x");
});

test("Variant #4: Work even on large numbers", async () => {
  var output = await JsConfuser.obfuscate(
    `TEST_VAR = 10000000000000000000000000000;`,
    {
      target: "node",
      hexadecimalNumbers: true,
    }
  );

  expect(output).toContain("0x204fce5e3e25020000000000");

  var TEST_VAR;

  eval(output);

  expect(TEST_VAR).toStrictEqual(10000000000000000000000000000);
});
