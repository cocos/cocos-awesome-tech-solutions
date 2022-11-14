import JsConfuser from "../../../src/index";

test("Variant #1: Execute in the correct order (ControlFlowFlattening)", async () => {
  var code = `
    var array = [];

    array.push(1);
    array.push(2);
    array.push(3);
    array.push(4);
    array.push(5);
    array.push(6);
    array.push(7);
    array.push(8);
    array.push(9);
    array.push(10);

    input(array);
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    controlFlowFlattening: true,
  });

  function input(array) {
    expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  }

  eval(output);
});

test("Variant #2: Obfuscate for loops (ControlFlowObfuscation)", async () => {
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

test("Variant #3: Obfuscate while loops (ControlFlowObfuscation)", async () => {
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

test("Variant #4: Work with break statements", async () => {
  var code = `

    var TEST_ARRAY = [];

    for ( var i =1; i < 50; i++ ) {
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

test("Variant #5: Don't obfuscate code with `let` (Lexically bound variables, ControlFlowFlattening)", async () => {
  var code = `
  let array = [];

    array.push(1);
    array.push(2);
    array.push(3);
    array.push(4);
    array.push(5);
    array.push(6);
    array.push(7);
    array.push(8);
    array.push(9);
    array.push(10);

    input(array);
  `;

  var output = await JsConfuser(code, {
    target: "node",
    controlFlowFlattening: true,
  });

  expect(output).not.toContain("switch");
});

test("Variant #6: Don't obfuscate code with `let` (Lexically bound variables, ControlFlowObfuscation)", async () => {
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

test("Variant #7: Accept percentages", async () => {
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
    controlFlowFlattening: 0.5,
  });

  // expect(output).toContain("switch");
  // expect(output).toContain("while");

  function input(array) {
    expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  }

  eval(output);
});

it("Variant #8: Work when obfuscated multiple times", async () => {
  var code = `
    var array = [];
    var i = 1;

    while ( i <= 10 ) {
      array.push(i);
      i++
    }

    input(array);
  `; // [1,2,3,4,5,6,7,8,9,10]

  var output = await JsConfuser(code, {
    target: "node",
    controlFlowFlattening: true,
  });

  var doublyObfuscated = await JsConfuser(output, {
    target: "node",
    controlFlowFlattening: true,
  });

  // expect(output).toContain("switch");
  // expect(output).toContain("while");

  function input(array) {
    expect(array).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  }

  eval(doublyObfuscated);
});

test("Variant #9: Don't entangle floats or NaN", async () => {
  var output = await JsConfuser(
    `
      function TEST_FUNCTION(){
        
        var a = NaN;
        var b = 10.01;
        var c = 15.01;
        var d = "MyString";
        input(b + c)
      }
      
      TEST_FUNCTION()
    `,
    {
      target: "node",
      controlFlowFlattening: true,
    }
  );

  expect(output).toContain("10.01");
  expect(output).toContain("15.01");
  expect(output).toContain("NaN");
  expect(output).toContain("MyString");

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);
  expect(value).toStrictEqual(25.02);
});

test("Variant #10: Correctly entangle property keys", async () => {
  var output = await JsConfuser(
    `
      function TEST_FUNCTION(){
        
        var obj = {
          10: 10,
          9: 9,
          8: 8,
          7: 7,
          6: 6,
          5: 5,
          4: 4,
          3: 3,
          2: 2,
          1: 1,
        }

        var ten = obj["5"] + obj["3"] + obj["2"];

        input(ten)
      }
      
      TEST_FUNCTION()
    `,
    {
      target: "node",
      controlFlowFlattening: true,
    }
  );

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);
  expect(value).toStrictEqual(10);
});

test("Variant #11: Flatten nested if statements", async () => {
  var output = await JsConfuser(
    `
    TEST_ARRAY = [];

    if(true){
      TEST_ARRAY.push(1);
    } else {
      TEST_ARRAY.push(-1);
    }

    if(true){
      TEST_ARRAY.push(2);
    }

    if(false){
      TEST_ARRAY.push(-1);
    }

    if(true){
      TEST_ARRAY.push(3);
      if(true){
        TEST_ARRAY.push(4);
      } else {
      TEST_ARRAY.push(-1);
      }
      TEST_ARRAY.push(5);
    }
    var fillerExpr1;
    var fillerExpr2;
    var fillerExpr3;
    var fillerExpr4;
    var fillerExpr5;
    `,
    {
      target: "node",
      controlFlowFlattening: true,
    }
  );

  var TEST_ARRAY;

  eval(output);
  expect(TEST_ARRAY).toStrictEqual([1, 2, 3, 4, 5]);
});

test("Variant #12: Flatten nested for loops", async () => {
  var output = await JsConfuser(
    `
    TEST_ARRAY = [];

    for ( var i = -5; i < 0; i++ ) {
      var o = 0;
      for ( var j = 1; j < 4; j++ ) {
        o += j;
      }

      // o is 6
      TEST_ARRAY.push(i + o);
    }
    var fillerExpr1;
    var fillerExpr2;
    var fillerExpr3;
    var fillerExpr4;
    var fillerExpr5;
    `,
    {
      target: "node",
      controlFlowFlattening: true,
    }
  );

  expect(output).not.toContain("for(var i)");
  expect(output).not.toContain("for(var j)");

  var TEST_ARRAY;

  eval(output);
  expect(TEST_ARRAY).toStrictEqual([1, 2, 3, 4, 5]);
});

test("Variant #13: Flatten nested while loops", async () => {
  var output = await JsConfuser(
    `
    TEST_ARRAY = [];

    var i = -5
    while ( i < 0 ) {
      var o = 0;
      var j = 1;

      while( j < 4 ){
        o += j;

        j++;
      }

      // o is 6
      TEST_ARRAY.push(i + o);
      i++;
    }
    var fillerExpr1;
    var fillerExpr2;
    var fillerExpr3;
    var fillerExpr4;
    var fillerExpr5;
    `,
    {
      target: "node",
      controlFlowFlattening: true,
    }
  );

  var TEST_ARRAY;

  expect(output).not.toContain("while(i<0)");
  expect(output).not.toContain("while(j<4)");

  eval(output);
  expect(TEST_ARRAY).toStrictEqual([1, 2, 3, 4, 5]);
});

test("Variant #14: Flatten nested switch statements", async () => {
  var output = await JsConfuser(
    `
    TEST_ARRAY = [];
    
    var i = 0;
    switch(i){
      case 1: TEST_ARRAY.push(-1); break;
      case 2: TEST_ARRAY.push(-1); break;
      case 0:
        TEST_ARRAY.push(1);

        var j = 0;
        var i = 0;
        switch(j){
          case 1: TEST_ARRAY.push(-1); break;
          case 2: TEST_ARRAY.push(-1); break;
          case 0:
            TEST_ARRAY.push(2);
          break;
          case 4: TEST_ARRAY.push(-1); break;
          case 8: TEST_ARRAY.push(-1); break;
        } 

        TEST_ARRAY.push(3);

      break;
      case 4: TEST_ARRAY.push(-1); break;
      case 8: TEST_ARRAY.push(-1); break;
    } 

    TEST_ARRAY.push(4);
    TEST_ARRAY.push(5);
    `,
    {
      target: "node",
      controlFlowFlattening: true,
    }
  );

  expect(output).not.toContain("switch(i");
  expect(output).not.toContain("switch(j");

  var TEST_ARRAY;

  eval(output);
  expect(TEST_ARRAY).toStrictEqual([1, 2, 3, 4, 5]);
});

test("Variant #16: Flatten with nested break and continue statements", async () => {
  var output = await JsConfuser(
    `
    TEST_ARRAY = [];

    for ( var i =1; i < 10; i++ ) {
      if(i%2==0){
        continue;
      }
      if(i==7){
        break;
      }
      TEST_ARRAY.push(i);
    }

    var j;

    a: for ( var i = 0; i < 5; i++ ) {
      if ( i == 3 ) {
        for ( j = 0; j < 5; j++ ) {
          if ( j == 1 ) {break a;}
          if ( j % 2 == 0 ) { continue a;}
        }
        TEST_ARRAY.push(-1);
      }
    }

    var fillerExpr1;
    var fillerExpr2;
    var fillerExpr3;
    var fillerExpr4;
    var fillerExpr5;
    `,
    {
      target: "node",
      controlFlowFlattening: true,
    }
  );

  var TEST_ARRAY;

  eval(output);
  expect(TEST_ARRAY).toStrictEqual([1, 3, 5]);
});

test("Variant #17: Flatten with infinite for loop and break", async () => {
  var output = await JsConfuser(
    `
    TEST_ARRAY = [];
    var i = 1;

    for ( ;; ) {
      if (i == 6){break;}

      TEST_ARRAY.push(i), i++;
    }

    var fillerExpr1;
    var fillerExpr2;
    var fillerExpr3;
    var fillerExpr4;
    var fillerExpr5;
    `,
    {
      target: "node",
      controlFlowFlattening: true,
    }
  );

  expect(output).not.toContain("for(;");

  var TEST_ARRAY;

  eval(output);
  expect(TEST_ARRAY).toStrictEqual([1, 2, 3, 4, 5]);
});

test("Variant #18: Flatten certain functions", async () => {
  var output = await JsConfuser(
    `

    var x = -1;
    function increment(){
      x++;
      return x;
    }

    increment();

    function breakSequencingAttempt1(){

    }

    var element1 = increment();
    var element2 = increment();
    var element3;
    
    element3 = increment();

    function breakSequencingAttempt2(){

    }

    TEST_ARRAY = [
      element1,
      element2,
      element3,
    ]

    var fillerExpr1;
    var fillerExpr2;
    var fillerExpr3;
    var fillerExpr4;
    var fillerExpr5;
    `,
    {
      target: "node",
      controlFlowFlattening: true,
    }
  );

  expect(output).not.toContain("function increment");
  expect(output).not.toContain("increment");

  var TEST_ARRAY;

  eval(output);
  expect(TEST_ARRAY).toStrictEqual([1, 2, 3]);
});

test("Variant #19: Don't flatten non-extractable functions", async () => {
  var output = await JsConfuser(
    `

    var x = -1;
    function increment(){
      x++;
      return x;
    }

    increment();

    TEST_ARRAY = [
      increment(),
      increment(),
      increment()
    ]

    var fillerExpr1;
    var fillerExpr2;
    var fillerExpr3;
    var fillerExpr4;
    var fillerExpr5;
    `,
    {
      target: "node",
      controlFlowFlattening: true,
    }
  );

  expect(output).toContain("function increment");

  var TEST_ARRAY;

  eval(output);
  expect(TEST_ARRAY).toStrictEqual([1, 2, 3]);
});

test("Variant #20: Don't apply when functions are redefined", async () => {
  var output = await JsConfuser(
    `

    var x = -1;
    function increment(){
      x++;
      return x;
    }

    // redefined function declaration
    increment = function(){
      return 0;
    }

    increment();

    TEST_ARRAY = [
      increment(),
      increment(),
      increment()
    ]

    var fillerExpr1;
    var fillerExpr2;
    var fillerExpr3;
    var fillerExpr4;
    var fillerExpr5;
    `,
    {
      target: "node",
      controlFlowFlattening: true,
    }
  );

  expect(output).not.toContain("switch");

  var TEST_ARRAY;

  eval(output);
  expect(TEST_ARRAY).toStrictEqual([0, 0, 0]);
});
