import JsConfuser from "../../../src/index";

it("should convert arrow functions to function expressions", async () => {
  var code = `var arrow = ()=>"Hello World"`;

  var output = await JsConfuser(code, { target: "browser", es5: true });

  expect(output).not.toContain("=>");
});

it("should convert arrow functions and work", async () => {
  var code = `arrow = ()=>this;`;

  var output = await JsConfuser(code, { target: "browser", es5: true });

  // Ensure arrow function is gone
  expect(output).not.toContain("=>");

  expect(output).toContain("function");

  var arrow;

  eval(output);

  expect(typeof arrow).toStrictEqual("function");
  expect(arrow()).toBeTruthy();
});

it("should fix let/const", async () => {
  var code = `let TEST_VARIABLE = 100;`;

  var output = await JsConfuser(code, { target: "browser", es5: true });

  expect(output).not.toContain("let");
});

it("should fix let with RenameVariables", async () => {
  var code = `
  
  if ( true ) {
    let TEST_VARIABLE = 100;
  }

  var check;
  try {
    TEST_VARIABLE
  } catch ( e ) {
    check = true;
  }

  input(check)

  `;

  var output = await JsConfuser(code, {
    target: "browser",
    es5: true,
    renameVariables: true,
  });

  expect(output).not.toContain("let");

  var value = "never_called";
  function input(x) {
    value = x;
  }

  eval(output);
  expect(value).toStrictEqual(true);
});

it("should add forEach polyfill", async () => {
  var code = `
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    es5: true,
  });

  expect(output).toContain("forEach");
});

it("should fix reserved keywords when used in properties", async () => {
  var code = `
  TEST_VARIABLE = {for: 1};
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    es5: true,
    minify: true,
  });

  expect(output).toContain("'for'");
});

it("should fix reserved keywords when used in member expressions", async () => {
  var code = `
  TEST_VARIABLE.for = 1;
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    es5: true,
    minify: true,
  });

  expect(output).toContain("['for']");
});
