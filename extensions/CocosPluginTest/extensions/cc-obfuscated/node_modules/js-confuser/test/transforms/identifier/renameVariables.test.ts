import JsConfuser from "../../../src/index";

test("Variant #1: Rename variables properly", async () => {
  var code = "var TEST_VARIABLE = 1;";
  var output = await JsConfuser(code, {
    target: "browser",
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: "mangled",
  });

  expect(output.split("var ")[1].split("=")[0]).not.toEqual("TEST_VARIABLE");
  expect(output).not.toContain("TEST_VARIABLE");
});

test("Variant #2: Don't rename global accessors", async () => {
  var code = `
  var TEST_VARIABLE = 1;
  success(TEST_VARIABLE); // success should not be renamed
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: "mangled",
  });

  expect(output).toContain("success");
  expect(output).not.toContain("TEST_VARIABLE");

  var passed = false;
  function success() {
    passed = true;
  }
  eval(output);

  expect(passed).toStrictEqual(true);
});

test("Variant #3: Rename shadowed variables properly", async () => {
  var code = `
  var TEST_VARIABLE = 1;
  
  function run(){
    var TEST_VARIABLE = 10;
    input(TEST_VARIABLE);
  }

  run();
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: "mangled",
  });

  var value = false;
  function input(valueIn) {
    value = valueIn;
  }
  eval(output);

  expect(value).toStrictEqual(10);
});

test("Variant #4: Don't rename member properties", async () => {
  var code = `

    var TEST_OBJECT = { TEST_PROPERTY: 100 }

    input(TEST_OBJECT.TEST_PROPERTY); // "TEST_PROPERTY" should not be renamed
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: "mangled",
  });

  expect(output).toContain("TEST_PROPERTY");

  var value = false;
  function input(valueIn) {
    value = valueIn;
  }
  eval(output);

  expect(value).toStrictEqual(100);
});

test("Variant #5: Handle variable defined with let (1)", async () => {
  var code = `

    // lexically bound
    let TEST_OBJECT = { TEST_PROPERTY: 100 }

    input(TEST_OBJECT.TEST_PROPERTY); // "TEST_PROPERTY" should not be renamed
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: "mangled",
  });

  var value = false;
  function input(valueIn) {
    value = valueIn;
  }
  eval(output);

  expect(value).toStrictEqual(100);
});

test("Variant #6: Handle variable defined with let (2)", async () => {
  var code = `

    // lexically bound
    let TEST_OBJECT = { TEST_PROPERTY: "UPPER_VALUE" }
    if ( true ) {
      let TEST_OBJECT = { TEST_PROPERTY: 100 }
      input(TEST_OBJECT.TEST_PROPERTY); // "TEST_PROPERTY" should not be renamed
    }

  `;

  var output = await JsConfuser(code, {
    target: "browser",
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: "mangled",
  });

  var value = false;
  function input(valueIn) {
    value = valueIn;
  }
  eval(output);

  expect(value).toStrictEqual(100);
});

test("Variant #7: Handle variable defined with let (3)", async () => {
  var code = `

    // lexically bound
    let TEST_OBJECT = { TEST_PROPERTY: "UPPER_VALUE" }
    if ( true ) {
      let TEST_OBJECT = { TEST_PROPERTY: 100 }
      input(TEST_OBJECT.TEST_PROPERTY); // "TEST_PROPERTY" should not be renamed
    }

  `;

  var output = await JsConfuser(code, {
    target: "browser",
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: "mangled",
  });

  expect(output).not.toContain("TEST_OBJECT");
  expect(output).toContain("TEST_PROPERTY");
  expect(output).toContain("input");
  expect(output).toContain("let a");
  expect(typeof output.split("let a")[1]).toStrictEqual("string");

  var value = false;
  function input(valueIn) {
    value = valueIn;
  }
  eval(output);

  expect(value).toStrictEqual(100);
});

test("Variant #8: Don't rename null (reservedIdentifiers)", async () => {
  var code = `
    input(null)
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    renameVariables: true,
    renameGlobals: true,
  });

  var value = false;
  function input(valueIn) {
    value = valueIn;
  }
  eval(output);

  expect(value).toStrictEqual(null);
});

test("Variant #9: Don't rename exported names", async () => {
  var code = `
    export function abc(){

    }
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    renameVariables: true,
    renameGlobals: true,
  });

  expect(output).toContain("abc");
});

test("Variant #10: Call renameVariables callback properly (variables)", async () => {
  var code = `
    var myVariable = 1;
  `;

  var input = [];

  var output = await JsConfuser(code, {
    target: "browser",
    renameGlobals: true,
    renameVariables: (name, isTopLevel) => {
      input = [name, isTopLevel];
    },
  });

  expect(input).toEqual(["myVariable", true]);
});

test("Variant #11: Call renameVariables callback properly (variables, nested)", async () => {
  var code = `
    (function(){
      var myVariable = 1;
    })();
  `;

  var input = [];

  var output = await JsConfuser(code, {
    target: "browser",
    renameGlobals: true,
    renameVariables: (name, isTopLevel) => {
      input = [name, isTopLevel];
    },
  });

  expect(input).toEqual(["myVariable", false]);
});

test("Variant #12: Call renameVariables callback properly (function declaration)", async () => {
  var code = `
    function myFunction(){

    }
  `;

  var input = [];

  var output = await JsConfuser(code, {
    target: "browser",
    renameGlobals: true,
    renameVariables: (name, isTopLevel) => {
      input = [name, isTopLevel];
    },
  });

  expect(input).toEqual(["myFunction", true]);
});

test("Variant #13: Allow excluding custom variables from being renamed", async () => {
  var code = `
    var myVariable1 = 1;
    var myVariable2 = 1;
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    renameVariables: (name, isTopLevel) => {
      return name !== "myVariable1";
    },
    renameGlobals: true,
  });

  expect(output).toContain("myVariable1");
  expect(output).not.toContain("myVariable2");
});

test("Variant #14: should not break global variable references", async () => {
  /**
   * In this case `b` is a global variable,
   *
   * "mangled" names are a,b,c,d...
   *
   * therefore make sure `b` is NOT used as it breaks program
   */
  var code = `
  var a = "";

  function myFunction(param1, param2){
      b(param1);
  }

  myFunction("Hello World");
  `;

  var output = await JsConfuser(code, {
    target: "node",
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: "mangled",
  });

  expect(output).not.toContain("b(b)");

  var value;
  function b(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toStrictEqual("Hello World");
});

test("Variant #15: Function parameter default value", async () => {
  /**
   * In this case `b` is a global variable,
   *
   * "mangled" names are a,b,c,d...
   *
   * therefore make sure `b` is NOT used as it breaks program
   */
  var code = `
   var a = "Filler Variables";
   var b = "Hello World";
   var c = "Another incorrect string";
 
   function myFunction(param1 = ()=>{
     return b;
   }){
    var b = param1();
    if(false){
      a,c;
    }
    input(b);
   }
 
   myFunction();
   `;

  var output = await JsConfuser(code, {
    target: "node",
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: "mangled",
  });

  var value;
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toStrictEqual("Hello World");
});

// https://github.com/MichaelXF/js-confuser/issues/24
test("Variant #16: Function with multiple parameters and a default value", async () => {
  var code = `
  function FuncA(param1, param2 = FuncB){
    param2()
  }
  
  function FuncB(){
    input("Success!");
  }
  
  FuncA();
   `;

  var output = await JsConfuser(code, {
    target: "node",
    renameVariables: true,
    renameGlobals: true,
    identifierGenerator: "mangled",
  });

  var value;
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toStrictEqual("Success!");
});
