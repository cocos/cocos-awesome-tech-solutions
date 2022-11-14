import JsConfuser from "../../../src/index";

it("should run correctly", async () => {
  var code = `
  function TEST_FUNCTION(){
    input_test1(true) 
  }

  TEST_FUNCTION();
  `;

  var output = await JsConfuser(code, {
    target: "node",
    lock: { integrity: true, countermeasures: false },
  });

  expect(output).toContain("function");

  var value = "never_called";
  function input_test1(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toStrictEqual(true);
});

it("should not run when source code is modified", async () => {
  var code = `
  function TEST_FUNCTION(){
    input("Hello World") 
  }

  TEST_FUNCTION();
  
  `;

  var output = await JsConfuser(code, {
    target: "node",
    lock: { integrity: true, countermeasures: false },
  });

  expect(output).toContain("function");

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  // Change the "Hello World" to "Goodnight"
  output = output.replace("Hello World", "Goodnight");

  eval(output);

  expect(value).not.toEqual("Goodnight");

  expect(value).toStrictEqual("never_called");
});

it("should run countermeasures function when changed", async () => {
  var code = `
  function TEST_FUNCTION(){
    input("The code was never changed") 
  }

  function TEST_COUNTERMEASURES(){
    input("countermeasures")
  }

  TEST_FUNCTION();
  
  `;

  var output = await JsConfuser(code, {
    target: "node",
    lock: { integrity: true, countermeasures: "TEST_COUNTERMEASURES" },
  });

  expect(output).toContain("function");

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  // Change the "Hello World" to "Goodnight"
  output = output.replace(
    "The code was never changed",
    "The modified code was executed"
  );

  eval(output);

  expect(value).toStrictEqual("countermeasures");
});

it("should error when countermeasures function doesn't exist", async () => {
  var code = `
  function TEST_FUNCTION(){
    input("The code was never changed") 
  }

  TEST_FUNCTION();
  `;

  var errorCaught;
  try {
    var output = await JsConfuser(code, {
      target: "node",
      lock: { integrity: true, countermeasures: "TEST_COUNTERMEASURES" },
    });
  } catch (e) {
    errorCaught = e;
  }

  expect(errorCaught).toBeTruthy();
  expect(errorCaught.toString()).toContain(
    "Countermeasures function named 'TEST_COUNTERMEASURES' was not found."
  );
  expect(errorCaught.toString()).toContain("TEST_COUNTERMEASURES");
});

it("should work on High Preset", async () => {
  var output = await JsConfuser(`TEST_OUTPUT = ("Hello World")`, {
    target: "node",
    preset: "high",
    lock: {
      integrity: true,
    },
  });

  var TEST_OUTPUT;
  eval(output);

  expect(TEST_OUTPUT).toStrictEqual("Hello World");
});
