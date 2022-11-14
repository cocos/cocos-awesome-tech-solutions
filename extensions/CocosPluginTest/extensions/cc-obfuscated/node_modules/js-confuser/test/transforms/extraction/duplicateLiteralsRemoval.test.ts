import JsConfuser from "../../../src/index";

it("should remove duplicate literals", async () => {
  var code = `
  
  var TEST_ARRAY = [5,5];
  `;

  var output = await JsConfuser(code, {
    target: "node",
    duplicateLiteralsRemoval: true,
  });

  expect(output).not.toContain("5,5");
  expect(output).toContain("5");
});

it("should remove duplicate literals and execute correctly", async () => {
  var code = `
  
  TEST_ARRAY = [5,5];
  `;

  var output = await JsConfuser(code, {
    target: "node",
    duplicateLiteralsRemoval: true,
  });

  expect(output).not.toContain("5,5");
  expect(output).toContain("5");

  var TEST_ARRAY;

  eval(output);

  expect(TEST_ARRAY).toEqual([5, 5]);
});

it("should remove 'undefined' and 'null' values", async () => {
  var code = `
  
  TEST_ARRAY = [undefined,undefined,null,null];
  `;

  var output = await JsConfuser(code, {
    target: "node",
    duplicateLiteralsRemoval: true,
  });

  expect(output).not.toContain("undefined,undefined");
  expect(output).toContain("undefined");

  expect(output).not.toContain("null,null");
  expect(output).toContain("null");

  var TEST_ARRAY;

  eval(output);

  expect(TEST_ARRAY).toEqual([undefined, undefined, null, null]);
});

it("should not remove empty strings", async () => {
  var code = `
  
  TEST_ARRAY = ['','','',''];
  `;

  var output = await JsConfuser(code, {
    target: "node",
    duplicateLiteralsRemoval: true,
  });

  expect(output).toContain("'','','',''");

  var TEST_ARRAY;

  eval(output);

  expect(TEST_ARRAY).toEqual(["", "", "", ""]);
});

it("should work with NaN values", async () => {
  var code = `
  
  TEST_ARRAY = [NaN];
  `;

  var output = await JsConfuser(code, {
    target: "node",
    duplicateLiteralsRemoval: true,
  });

  var TEST_ARRAY;

  eval(output);

  expect(TEST_ARRAY[0] === TEST_ARRAY[0]).toStrictEqual(false);
});

it("should work on property keys", async () => {
  var code = `
  var myObject = {
    myKey: 100
  }

  var myObject2 = {
    myKey: 50
  }

  TEST_VAR = myObject.myKey;
  `;

  var output = await JsConfuser(code, {
    target: "node",
    duplicateLiteralsRemoval: true,
  });

  expect(output).toContain("]:100");

  var TEST_VAR;
  eval(output);

  expect(TEST_VAR).toStrictEqual(100);
});

it("should work on class keys", async () => {
  var code = `
  class MyClass {
    myMethod(){
      return 100;
    }
  }

  var myObject = new MyClass();

  TEST_VAR = myObject.myMethod();
  `;

  var output = await JsConfuser(code, {
    target: "node",
    duplicateLiteralsRemoval: true,
  });

  expect(output).toContain("](){return 100}");

  var TEST_VAR;
  eval(output);

  expect(TEST_VAR).toStrictEqual(100);
});

it("should not encode constructor key", async () => {
  var code = `
  class MyClass {
    constructor(){
      TEST_VAR = 100;
    }
  }

  class MyClass2 {
    constructor(){
      TEST_VAR = 50;
    }
  }

  new MyClass();
  `;

  var output = await JsConfuser(code, {
    target: "node",
    duplicateLiteralsRemoval: true,
  });

  var TEST_VAR;
  eval(output);

  expect(TEST_VAR).toStrictEqual(100);
});
