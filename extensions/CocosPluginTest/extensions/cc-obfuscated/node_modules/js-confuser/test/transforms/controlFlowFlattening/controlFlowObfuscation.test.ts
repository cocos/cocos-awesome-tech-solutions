import JsConfuser from "../../../src/index";

it("should obfuscate for loops (ControlFlowObfuscation)", async () => {
  var code = `
    var array = [];

    for ( var i = 1; i <= 10; i++ ) {
      array.push(i);
    }

    input(array);
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    controlFlowFlattening: true,
  });

  expect(output).toContain("switch");

  function input(array) {
    expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  }

  eval(output);
});

it("should obfuscate while loops (ControlFlowObfuscation)", async () => {
  var code = `
    var array = [];
    var i = 1;

    while ( i <= 10 ) {
      array.push(i);
      i++
    }

    input(array);
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    controlFlowFlattening: true,
  });

  expect(output).toContain("switch");

  function input(array) {
    expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  }

  eval(output);
});

it("should work with break statements (ControlFlowObfuscation)", async () => {
  var code = `

    var TEST_ARRAY = [];

    for ( var i =1; true; i++ ) {
      if ( i == 11 ) {
        break;
      }
      TEST_ARRAY.push(i);
    }

    input(TEST_ARRAY);
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    controlFlowFlattening: true,
  });

  expect(output).toContain("switch");
  expect(output).toContain("while");

  function input(array) {
    expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  }

  eval(output);
});

it("should not obfuscate code with `let` (Lexically bound variables, ControlFlowObfuscation)", async () => {
  var code = `
  var array=[];
  for ( let i =1; i <= 10; i++ ) {
    array.push(i);
  }

    input(array);
  `;

  var output = await JsConfuser(code, {
    target: "node",
    controlFlowFlattening: true,
  });

  expect(output).not.toContain("switch");
});
