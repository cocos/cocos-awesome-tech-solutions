import JsConfuser from "../../../src/index";

it("should hide global names (such as Math)", async () => {
  var code = `
  var TEST_RESULT = Math.floor(10.1);
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    globalConcealing: true,
  });

  expect(output).not.toContain("Math.floor");
  expect(output).not.toContain("=Math");
  expect(output).toContain("['Math']");
  expect(output).toContain("window");
});

it("should not rename global variables", async () => {
  var code = `
  var Math = 50;

  console.log(Math);
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    globalConcealing: true,
  });

  expect(output).toContain("log'](Math)");
});
