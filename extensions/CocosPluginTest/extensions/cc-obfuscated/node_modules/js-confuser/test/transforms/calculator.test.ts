import JsConfuser from "../../src/index";

it("should hide binary expressions", async () => {
  var code = `5 + 5`;

  var output = await JsConfuser(code, { target: "browser", calculator: true });

  expect(output).not.toContain("5+5");
  expect(output).not.toContain("5 + 5");
  expect(output).toContain("switch");
});

it("should result with correct values", async () => {
  var code = `input(5 + 5)`;

  var output = await JsConfuser(code, { target: "browser", calculator: true });

  function input(x) {
    expect(x).toStrictEqual(10);
  }

  eval(output);
});

it("should execute property with complex operations", async () => {
  var code = `input((40 * 35 + 4) * 4 + 2)`;

  var output = await JsConfuser(code, { target: "browser", calculator: true });

  var value;
  function input(x) {
    value = x;
  }

  eval(output);

  expect(value).toStrictEqual(5618);
});
