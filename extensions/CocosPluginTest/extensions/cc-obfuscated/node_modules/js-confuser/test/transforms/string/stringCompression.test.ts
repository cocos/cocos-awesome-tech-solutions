import JsConfuser from "../../../src/index";

it("should work", async () => {
  var output = await JsConfuser(`input("Hello World")`, {
    target: "node",
    stringCompression: true,
  });

  var value,
    input = (x) => (value = x);

  eval(output);

  expect(value).toStrictEqual("Hello World");
});

it("should work on property keys", async () => {
  var code = `
  var myObject = {
    myKey: 100
  }

  TEST_VAR = myObject.myKey;
  `;

  var output = await JsConfuser(code, {
    target: "node",
    stringCompression: true,
  });

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
    stringCompression: true,
  });

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

  new MyClass();
  `;

  var output = await JsConfuser(code, {
    target: "node",
    stringCompression: true,
  });

  var TEST_VAR;
  eval(output);

  expect(TEST_VAR).toStrictEqual(100);
});
