import { isObject } from "util";
import JsConfuser from "../../src/index";

it("should middleman function calls", async () => {
  var code = `
  
    function TEST_FUNCTION(arg){
      input(10);
    }

    TEST_FUNCTION(10);
  `;

  var output = await JsConfuser(code, { target: "browser", dispatcher: true });

  function input(x) {
    expect(x).toStrictEqual(10);
  }

  expect(output).not.toContain("function TEST_FUNCTION(");
  eval(output);
});

it("should not middleman functions relying on arguments identifier", async () => {
  var code = `
  
  function TEST_FUNCTION(){
    var arg = arguments[0];
  }

  TEST_FUNCTION(10);
`;

  var output = await JsConfuser(code, { target: "browser", dispatcher: true });

  expect(output).toContain("function TEST_FUNCTION(");
});

it("should not middleman functions relying on this identifier", async () => {
  var code = `
  
  function TEST_FUNCTION(){
    this.key = 1;
  }

  TEST_FUNCTION(10);
`;

  var output = await JsConfuser(code, { target: "browser", dispatcher: true });

  expect(output).toContain("function TEST_FUNCTION(");
});

it("should work with nested functions", async () => {
  var code = `
  
  function TEST_FUNCTION(){
    function TEST_NESTED_FUNCTION(){
      input(10)
    }

    TEST_NESTED_FUNCTION()
  }

  TEST_FUNCTION();
`;

  var output = await JsConfuser(code, { target: "browser", dispatcher: true });
  function input(x) {
    expect(x).toStrictEqual(10);
  }

  expect(output).not.toContain("function TEST_FUNCTION(");
  eval(output);
});

it("should work with nested functions and parameters", async () => {
  var code = `
  
  function TEST_FUNCTION(x){
    function TEST_NESTED_FUNCTION(y){
      input(y)
    }

    TEST_NESTED_FUNCTION(x)
  }

  TEST_FUNCTION(10);
`;

  var output = await JsConfuser(code, { target: "browser", dispatcher: true });
  function input(x) {
    expect(x).toStrictEqual(10);
  }

  expect(output).not.toContain("function TEST_FUNCTION(");
  eval(output);
});

it("should work with nested functions and return values", async () => {
  var code = `
  
  function TEST_FUNCTION(){
    function TEST_NESTED_FUNCTION(){
      return 10;
    }

    return TEST_NESTED_FUNCTION()
  }

  input(TEST_FUNCTION());
`;

  var output = await JsConfuser(code, { target: "browser", dispatcher: true });
  function input(x) {
    expect(x).toStrictEqual(10);
  }

  expect(output).not.toContain("function TEST_FUNCTION(");
  eval(output);
});

it("should work with nested and sibling functions and return values", async () => {
  var code = `

  function TEST_FUNCTION_2(){
    function TEST_NESTED_FUNCTION(){
      return 10;
    }

    return TEST_NESTED_FUNCTION()
  }
  
  function TEST_FUNCTION(){
    return TEST_FUNCTION_2();
  }

  input(TEST_FUNCTION());
`;

  var output = await JsConfuser(code, { target: "browser", dispatcher: true });
  function input(x) {
    expect(x).toStrictEqual(10);
  }

  expect(output).not.toContain("function TEST_FUNCTION(");
  eval(output);
});

it("should work with referencing the function itself", async () => {
  var code = `


  
  function TEST_FUNCTION(x){
    return x;
  }

  var fn = TEST_FUNCTION;

  input(fn(10));
`;

  var output = await JsConfuser(code, { target: "browser", dispatcher: true });
  function input(x) {
    expect(x).toStrictEqual(10);
  }

  expect(output).not.toContain("function TEST_FUNCTION(");
  eval(output);
});

it("should work with the spread operator on arguments", async () => {
  var code = `

  function TEST_FUNCTION(x, y, z){
    return x + y + z;
  }

  input(TEST_FUNCTION(...[2, 10, 8]));
`;

  var output = await JsConfuser(code, { target: "browser", dispatcher: true });
  function input(x) {
    expect(x).toStrictEqual(20);
  }

  expect(output).not.toContain("function TEST_FUNCTION(");
  eval(output);
});

it("should work with the spread operator on parameters", async () => {
  var code = `


  
  function TEST_FUNCTION(...a){
    return a[0] + a[1] + a[2];
  }

  input(TEST_FUNCTION(2, 10, 8));
`;

  var output = await JsConfuser(code, { target: "browser", dispatcher: true });
  function input(x) {
    expect(x).toStrictEqual(20);
  }

  expect(output).not.toContain("function TEST_FUNCTION(");
  eval(output);
});

it("should work with the spread operator on both arguments and parameters", async () => {
  var code = `

  
  function TEST_FUNCTION(...a){
    return a[0] + a[1] + a[2];
  }

  input(TEST_FUNCTION(...[2, 10, 8]));
`;

  var output = await JsConfuser(code, { target: "browser", dispatcher: true });
  function input(x) {
    expect(x).toStrictEqual(20);
  }

  expect(output).not.toContain("function TEST_FUNCTION(");
  eval(output);
});

it("should work with Stack", async () => {
  var code = `

  function TEST_FUNCTION_2(){
    function TEST_NESTED_FUNCTION(){
      return 10;
    }

    return TEST_NESTED_FUNCTION()
  }
  
  function TEST_FUNCTION(){
    var fn = TEST_FUNCTION_2;
    return fn();
  }

  input(TEST_FUNCTION());
`;

  var output = await JsConfuser(code, {
    target: "browser",
    dispatcher: true,
    stack: true,
  });

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  expect(output).not.toContain("function TEST_FUNCTION(");
  eval(output);

  expect(value).toStrictEqual(10);
});

it("should work with Control Flow Flattening", async () => {
  var code = `

  function TEST_FUNCTION_2(){
    function TEST_NESTED_FUNCTION(){
      return 10;
    }

    return TEST_NESTED_FUNCTION()
  }
  
  function TEST_FUNCTION(){
    var fn = TEST_FUNCTION_2;
    return fn();
  }

  input(TEST_FUNCTION());
`;

  var output = await JsConfuser(code, {
    target: "browser",
    dispatcher: true,
    controlFlowFlattening: true,
  });

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  expect(output).not.toContain("function TEST_FUNCTION(");
  eval(output);

  expect(value).toStrictEqual(10);
});

// https://github.com/MichaelXF/js-confuser/issues/26
it("should apply to every level of the code", async () => {
  var code = `
  function OUTER(){
    function INNER(){
      return 100;
    }

    return INNER();
  }

  input(OUTER());
  `;

  var output = await JsConfuser(code, { target: "node", dispatcher: true });

  expect(output).not.toContain("OUTER");
  expect(output).not.toContain("INNER");

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toStrictEqual(100);
});
