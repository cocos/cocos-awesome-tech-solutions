import JsConfuser from "../../../src/index";

it("should reuse released names", async () => {
  var output = await JsConfuser(
    `
  var a = "Hello World";
  TEST_VAR_1 = a;
  var b = "Name Recycling"
  TEST_VAR_2 = b;
  `,
    {
      target: "node",
      nameRecycling: true,
      renameGlobals: true,
    }
  );

  expect(output).not.toContain("b=");
  expect(output).not.toContain("b;");

  var TEST_VAR_1, TEST_VAR_2;

  eval(output);

  expect(TEST_VAR_1).toStrictEqual("Hello World");
  expect(TEST_VAR_2).toStrictEqual("Name Recycling");
});

it("should not reuse released names when in nested context", async () => {
  var output = await JsConfuser(
    `
  var fn = function(){
    TEST_VAR_3 = b;
  }

  var a = "Hello World";
  TEST_VAR_1 = a;
  var b = "Name Recycling"
  TEST_VAR_2 = b;

  fn()

  `,
    {
      target: "node",
      nameRecycling: true,
      renameGlobals: true,
    }
  );

  expect(output).toContain("b=");

  var TEST_VAR_1, TEST_VAR_2, TEST_VAR_3;

  eval(output);

  expect(TEST_VAR_1).toStrictEqual("Hello World");
  expect(TEST_VAR_2).toStrictEqual("Name Recycling");
  expect(TEST_VAR_3).toStrictEqual("Name Recycling");
});

it("should convert function declarations to assignment expressions", async () => {
  var output = await JsConfuser(
    `
  var a = "Hello World";
  TEST_VAR_1 = a;
  function b(){
    TEST_VAR_2 = "Name Recycling"
  }
  b()
  `,
    {
      target: "node",
      nameRecycling: true,
      renameGlobals: true,
    }
  );

  expect(output).not.toContain("b()");
  expect(output).toContain("a=function()");

  var TEST_VAR_1, TEST_VAR_2;

  eval(output);

  expect(TEST_VAR_1).toStrictEqual("Hello World");
  expect(TEST_VAR_2).toStrictEqual("Name Recycling");
});

it("should convert class declarations to assignment expressions", async () => {
  var output = await JsConfuser(
    `
  var a = "Hello World";
  TEST_VAR_1 = a;
  class b {
    constructor(){
      TEST_VAR_2 = "Name Recycling"
    }
  }
  var c = new b()
  `,
    {
      target: "node",
      nameRecycling: true,
      renameGlobals: true,
    }
  );

  var TEST_VAR_1, TEST_VAR_2;

  eval(output);

  expect(TEST_VAR_1).toStrictEqual("Hello World");
  expect(TEST_VAR_2).toStrictEqual("Name Recycling");
});

it("should convert variable declarations with multiple declarators properly", async () => {
  var output = await JsConfuser(
    `
  var a = "Hello World", b;
  TEST_VAR_1 = a;
  var c = "Name Recycling", d = "JsConfuser";
  TEST_VAR_2 = c;
  TEST_VAR_3 = d;
  `,
    {
      target: "node",
      nameRecycling: true,
      renameGlobals: true,
    }
  );

  var TEST_VAR_1, TEST_VAR_2, TEST_VAR_3;

  eval(output);

  expect(TEST_VAR_1).toStrictEqual("Hello World");
  expect(TEST_VAR_2).toStrictEqual("Name Recycling");
  expect(TEST_VAR_3).toStrictEqual("JsConfuser");
});

it("should convert variable declarations in for loop initializers properly", async () => {
  var output = await JsConfuser(
    `
  var a = "Hello World";
  TEST_VAR_1 = a;
  for ( var b = 0; b < 1; b++ ) {
    TEST_VAR_2 = "Number: " + b;
  }
  `,
    {
      target: "node",
      nameRecycling: true,
      renameGlobals: true,
    }
  );

  expect(output).toContain("for(a=0");

  var TEST_VAR_1, TEST_VAR_2;

  eval(output);

  expect(TEST_VAR_1).toStrictEqual("Hello World");
  expect(TEST_VAR_2).toStrictEqual("Number: 0");
});
