import JsConfuser from "../../../src/index";

test("Variant #1: Move variable 'y' to top", async () => {
  var code = `
    var x = 10;
    var y = 15;
    TEST_VARIABLE = x + y;
  `;

  var output = await JsConfuser.obfuscate(code, {
    target: "node",
    movedDeclarations: true,
  });

  expect(output).toContain("var y;");
  expect(output).toContain("y=15");

  var TEST_VARIABLE;
  eval(output);

  expect(TEST_VARIABLE).toStrictEqual(25);
});

test("Variant #2: Move variable 'y' and 'z' to top", async () => {
  var code = `
    var x = 10;
    var y = 15;
    var z = 5;
    TEST_VARIABLE = x + y + z;
  `;

  var output = await JsConfuser.obfuscate(code, {
    target: "node",
    movedDeclarations: true,
  });

  expect(output).toContain("var y,z");
  expect(output).toContain("y=15");
  expect(output).toContain("z=5");

  var TEST_VARIABLE;
  eval(output);

  expect(TEST_VARIABLE).toStrictEqual(30);
});

test("Variant #2: Don't move 'y' (destructuring)", async () => {
  var code = `
    var x = 10;
    var [y] = [15];
    TEST_VARIABLE = x + y;
  `;

  var output = await JsConfuser.obfuscate(code, {
    target: "node",
    movedDeclarations: true,
  });

  expect(output).toContain("var [y]=[15];");

  var TEST_VARIABLE;
  eval(output);

  expect(TEST_VARIABLE).toStrictEqual(25);
});

test("Variant #3: Don't move 'y' (nested lexical scope)", async () => {
  var code = `
    var x = 10;
    var y = 15;

    (function(){
      y = 10;
    })();

    TEST_VARIABLE = x + y;
  `;

  var output = await JsConfuser.obfuscate(code, {
    target: "node",
    movedDeclarations: true,
  });

  expect(output).toContain("var y=15");

  var TEST_VARIABLE;
  eval(output);

  expect(TEST_VARIABLE).toStrictEqual(20);
});

test("Variant #4: Move 'y' (for statement initializer)", async () => {
  var code = `
    var x = 10;
    for ( var y = 0; y < 15; y++ ) {

    } // y ends as 15
    TEST_VARIABLE = x + y;
  `;

  var output = await JsConfuser.obfuscate(code, {
    target: "node",
    movedDeclarations: true,
  });

  expect(output).not.toContain("var y=0;");

  var TEST_VARIABLE;
  eval(output);

  expect(TEST_VARIABLE).toStrictEqual(25);
});

test("Variant #5: Move 'y' (for-in left-hand initializer)", async () => {
  var code = `
    var x = 10;
    for ( var y in [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15] ) {

    } // y ends as "15"
    TEST_VARIABLE = x + parseInt(y);
  `;

  var output = await JsConfuser.obfuscate(code, {
    target: "node",
    movedDeclarations: true,
  });

  expect(output).not.toContain("var y in");
  expect(output).toContain("y in");

  var TEST_VARIABLE;
  eval(output);

  expect(TEST_VARIABLE).toStrictEqual(25);
});

test("Variant #6: Don't move const or let variables", async () => {
  var code = `
    var fillerExpr;

    let x = 10;
    const y = 15;

    TEST_VARIABLE = x + y;
  `;

  var output = await JsConfuser.obfuscate(code, {
    target: "node",
    movedDeclarations: true,
  });

  expect(output).toContain("let x=10");
  expect(output).toContain("const y=15");

  var TEST_VARIABLE;
  eval(output);

  expect(TEST_VARIABLE).toStrictEqual(25);
});
