import JsConfuser from "../../../src/index";

it("should fix destructuring in assignment expressions", async () => {
  var code = `[TEST_VARIABLE] = [100];`;

  var output = await JsConfuser(code, { target: "browser", es5: true });

  var TEST_VARIABLE;

  eval(output);

  expect(TEST_VARIABLE).toStrictEqual(100);
});

it("should fix destructuring in a sequence of assignment expressions", async () => {
  var code = `([TEST_VARIABLE] = [100], [TEST_VARIABLE_2] = [50]);`;

  var output = await JsConfuser(code, { target: "browser", es5: true });

  var TEST_VARIABLE;
  var TEST_VARIABLE_2;

  eval(output);

  expect(TEST_VARIABLE).toStrictEqual(100);
  expect(TEST_VARIABLE_2).toStrictEqual(50);
});

it("should fix destructuring with empty elements", async () => {
  var code = `[, TEST_VARIABLE] = [100, 10];`;

  var output = await JsConfuser(code, { target: "browser", es5: true });

  var TEST_VARIABLE;

  eval(output);

  expect(TEST_VARIABLE).toStrictEqual(10);
});

it("should fix destructuring in parameters", async () => {
  var code = `
  
  TEST_FUNCTION = function({key}){
    TEST_VARIABLE = key;
  }
  
  `;

  var output = await JsConfuser(code, { target: "browser", es5: true });

  var TEST_VARIABLE;
  var TEST_FUNCTION;

  eval(output);

  TEST_FUNCTION({ key: 64 });

  expect(TEST_VARIABLE).toStrictEqual(64);
});

it("should fix destructuring in shorthand arrow function parameters", async () => {
  var code = `
  TEST_FUNCTION = ({key})=>TEST_VARIABLE=key;
  `;

  var output = await JsConfuser(code, { target: "browser", es5: true });

  var TEST_VARIABLE;
  var TEST_FUNCTION;

  eval(output);

  TEST_FUNCTION({ key: 64 });

  expect(TEST_VARIABLE).toStrictEqual(64);
});

it("should fix destructuring in variable declarations", async () => {
  var code = `
  
  var {TEST_KEY} = {TEST_KEY: 50};

  TEST_VARIABLE = TEST_KEY;
  
  `;

  var output = await JsConfuser(code, { target: "browser", es5: true });

  var TEST_VARIABLE;

  eval(output);

  expect(TEST_VARIABLE).toStrictEqual(50);
});

it("should fix destructuring with rest elements", async () => {
  var code = `[...TEST_VARIABLE] = [1, 2, 3, 4, 5];`;

  var output = await JsConfuser(code, { target: "browser", es5: true });

  var TEST_VARIABLE;

  eval(output);

  expect(TEST_VARIABLE).toStrictEqual([1, 2, 3, 4, 5]);
});

it("should fix destructuring with default values", async () => {
  var code = `var {key: TEST_KEY = 50} = {key: undefined}; TEST_VARIABLE = TEST_KEY; `;

  var output = await JsConfuser(code, { target: "browser", es5: true });

  var TEST_VARIABLE;

  eval(output);

  expect(TEST_VARIABLE).toStrictEqual(50);
});

it("should fix destructuring inside the try...catch clause", async () => {
  var code = `
  try {

    throw {message: 100};

    // Why can you even do this?
  } catch ({message}) {
    
    TEST_VARIABLE = message;
  }
  `;

  var output = await JsConfuser(code, { target: "browser", es5: true });

  var TEST_VARIABLE;

  eval(output);

  expect(TEST_VARIABLE).toStrictEqual(100);
});
