import JsConfuser from "../../src/index";

it("should group variable declarations together", async () => {
  var code = `
  var a = 0;
  var b = 1;
  `;

  var output = await JsConfuser(code, { target: "browser", minify: true });

  expect(output).toContain("var a=0,b=1");
});

it("should remove block statements when not necessary", async () => {
  var code = `
  while(condition){
    doStuff();
  }
  `;

  var output = await JsConfuser(code, { target: "browser", minify: true });

  expect(output).not.toContain("{");
  expect(output).toContain("doStuff()");
});

it("should shorten guaranteed returns", async () => {
  var code = `
  function TEST_FUNCTION(){
    if ( condition ) {
      return 1;
    } else {
      return 0;
    }
  }
  `;

  var output = await JsConfuser(code, { target: "browser", minify: true });

  expect(output).not.toContain("if");
  expect(output).toContain("?");
});

it("should shorten guaranteed assignment expressions", async () => {
  var code = `
  function TEST_FUNCTION(){
    var value;
    if ( condition ) {
      value = 1;
    } else {
      value = 0;
    }
  }
  `;

  var output = await JsConfuser(code, { target: "browser", minify: true });

  expect(output).not.toContain("if");
  expect(output).toContain("value=");
  expect(output).toContain("?");
});

it("should convert eligible functions to arrow functions", async () => {
  var code = `
  function FN(){
    return 1;
  }
  input( FN() )
  `;

  var output = await JsConfuser(code, { target: "browser", minify: true });

  expect(output).toContain("=>");

  var value = "never_called",
    input = (x) => (value = x);

  eval(output);

  expect(value).toStrictEqual(1);
});

it("should not convert lower functions to arrow functions", async () => {
  var code = `
  input( FN() )
  function FN(){
    return 1;
  }
  `;

  var output = await JsConfuser(code, { target: "browser", minify: true });

  expect(output).not.toContain("=>");

  var value = "never_called",
    input = (x) => (value = x);

  eval(output);

  expect(value).toStrictEqual(1);
});

it("should work when shortening nested if-statements", async () => {
  var code = `
  var a = false;
  var b = true;
  if( a ) {
    if ( b ) {

    }
  } else {
    input(10)
  }
  `;

  var output = await JsConfuser(code, { target: "browser", minify: true });

  expect(output).not.toContain("=>");

  var value = "never_called",
    input = (x) => (value = x);

  eval(output);

  expect(value).toStrictEqual(10);
});

test("Variant #8: Shorten simple array destructuring", async () => {
  // Valid
  var output = await JsConfuser(`var [x] = [1]`, {
    target: "node",
    minify: true,
  });

  expect(output).toContain("var x=1");

  // Invalid
  var output2 = await JsConfuser(`var [x, y] = [1]`, {
    target: "node",
    minify: true,
  });

  expect(output2).toContain("var [x,y]");
});

test("Variant #9: Shorten simple object destructuring", async () => {
  // Valid
  var output = await JsConfuser(`var {x} = {x: 1}`, {
    target: "node",
    minify: true,
  });

  expect(output).toContain("var x=1");

  // Valid
  var output2 = await JsConfuser(`var {['x']: y} = {x: 1}`, {
    target: "node",
    minify: true,
  });

  expect(output2).toContain("var y=1");

  // Invalid
  var output3 = await JsConfuser(`var {x,y} = {x:1}`, {
    target: "node",
    minify: true,
  });

  expect(output3).toContain("var {x:x,y:y}");

  // Invalid
  var output4 = await JsConfuser(`var {y} = {x:1}`, {
    target: "node",
    minify: true,
  });

  expect(output4).toContain("var {y:y}");
});

test("Variant #10: Shorten booleans", async () => {
  // Valid
  var output = await JsConfuser(`var x = true;`, {
    target: "node",
    minify: true,
  });

  expect(output).toContain("var x=!0");

  // Valid
  var output2 = await JsConfuser(`var x = false`, {
    target: "node",
    minify: true,
  });

  expect(output2).toContain("var x=!1");
});

test("Variant #11: Shorten 'undefined' to 'void 0'", async () => {
  // Valid
  var output = await JsConfuser(`x = undefined;`, {
    target: "node",
    minify: true,
  });

  expect(output).toContain("x=void 0");

  // Valid
  var output2 = await JsConfuser(`var x = {undefined: 1}`, {
    target: "node",
    minify: true,
  });

  expect(output2).toContain("var x={[void 0]:1}");
});

test("Variant #11: Shorten 'Infinity' to 1/0", async () => {
  // Valid
  var output = await JsConfuser(`var x = Infinity;`, {
    target: "node",
    minify: true,
  });

  expect(output).toContain("var x=1/0");

  // Valid
  var output2 = await JsConfuser(`var x = {Infinity: 1}`, {
    target: "node",
    minify: true,
  });

  expect(output2).toContain("var x={[1/0]:1}");
});

test("Variant #12: Shorten '!false' to 'true'", async () => {
  // Valid
  var output = await JsConfuser(`var x = !false;`, {
    target: "node",
    minify: true,
  });

  expect(output).toContain("var x=true");
});

test("Variant #13: Shorten 'false ? a : b' to 'b'", async () => {
  // Valid
  var output = await JsConfuser(`var x = false ? 10 : 15;`, {
    target: "node",
    minify: true,
  });

  expect(output).toContain("var x=15");
});

test("Variant #14: Shorten 'var x = undefined' to 'var x'", async () => {
  // Valid
  var output = await JsConfuser(`var x = undefined`, {
    target: "node",
    minify: true,
  });

  expect(output).toContain("var x");
  expect(output).not.toContain("var x=");
});

test("Variant #15: Removing implied 'return'", async () => {
  // Valid
  var output = await JsConfuser(
    `
  function MyFunction(){ 
    var output = "Hello World";
    console.log(output);
    return;
  } 
  
  MyFunction();
  `,
    { target: "node", minify: true }
  );

  expect(output).not.toContain("return");

  // Invalid
  // https://github.com/MichaelXF/js-confuser/issues/34
  var output2 = await JsConfuser(
    `
  function greet(){ 
    if(true){ 
      console.log("return"); 
      return; 
    }

    var output = "should not show!"; console.log(output); 
  } 
  
  greet();
  `,
    { target: "browser", minify: true }
  );

  expect(output2).toContain("return");
});
