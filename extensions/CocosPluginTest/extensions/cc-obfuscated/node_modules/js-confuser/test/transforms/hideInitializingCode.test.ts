import JsConfuser from "../../src/index";

test("Variant #1: Do not apply with exported names", async () => {
  var output = await JsConfuser.obfuscate(
    `
    export function myFunction(){

    }
    `,
    {
      target: "node",
      hideInitializingCode: true,
    }
  );

  expect(output).not.toContain("__p_");
});

test("Variant #2: Add ternary expressions and wrap initializing code in a function and still work", async () => {
  var output = await JsConfuser.obfuscate(
    `
    var myNumber = 10;
    input(myNumber)
    `,
    {
      target: "node",
      hideInitializingCode: true,
    }
  );

  expect(output).toContain("__p_");
  expect(output).toContain("function ");
  expect(output).toContain("?");

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }
  eval(output);

  expect(value).toStrictEqual(10);
});

test("Variant #3: Should work with other function declarations", async () => {
  var output = await JsConfuser.obfuscate(
    `
    var myNumber = myFunction();
    input(myNumber)

    function myFunction(){
      return 10;
    }
    `,
    {
      target: "node",
      hideInitializingCode: true,
    }
  );

  expect(output).toContain("__p_");
  expect(output).toContain("function ");

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }
  eval(output);

  expect(value).toStrictEqual(10);
});

test("Variant #4: Should work when doubly obfuscated", async () => {
  var output = await JsConfuser.obfuscate(
    `
    var myNumber = myFunction();
    input(myNumber)

    function myFunction(){
      return 10;
    }
    `,
    {
      target: "node",
      hideInitializingCode: true,
    }
  );

  expect(output).toContain("__p_");
  expect(output).toContain("function ");

  var doublyObfuscated = await JsConfuser.obfuscate(output, {
    target: "node",
    hideInitializingCode: true,
  });

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }
  eval(doublyObfuscated);

  expect(value).toStrictEqual(10);
});

test("Variant #5: Should bring up variable declarations", async () => {
  var output = await JsConfuser.obfuscate(
    `
    var myNumber = 10;
    function myFunction(){
      return myNumber;
    }
    input(myFunction())
    `,
    {
      target: "node",
      hideInitializingCode: true,
    }
  );

  expect(output).toContain("__p_");
  expect(output).toContain("function ");
  expect(output).toContain("var myNumber;");
  expect(output).toContain("myNumber=");

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toStrictEqual(10);
});

test("Variant #6: Should not bring up variable declarations in nested contexts", async () => {
  var output = await JsConfuser.obfuscate(
    `
    function myFunction(){
      function myNestedFunction(){
        var myNumber = 10;
        return myNumber;
      }
      return myNestedFunction();
    }
    input(myFunction())
    `,
    {
      target: "node",
      hideInitializingCode: true,
    }
  );

  expect(output).toContain("__p_");
  expect(output).toContain("function ");
  expect(output).toContain("var myNumber=");

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toStrictEqual(10);
});

test("Variant #7: Should bring up class declarations", async () => {
  var output = await JsConfuser.obfuscate(
    `

    class MyClass {
      static getNumber(){
        return 10;
      }
    }

    function myFunction(){    
      return MyClass.getNumber();
    }
    input(myFunction())
    `,
    {
      target: "node",
      hideInitializingCode: true,
    }
  );

  expect(output).toContain("__p_");
  expect(output).toContain("function ");
  expect(output).toContain("var MyClass;");
  expect(output).toContain("MyClass=class MyClass{");

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toStrictEqual(10);
});

test("Variant #8: Should bring up variable declarations in for statements", async () => {
  var output = await JsConfuser.obfuscate(
    `

    for(var i=0; i <= 9; i++){
      
    } // i ends as 10

    function myFunction(){
      return i;
    }
    input(myFunction())
    `,
    {
      target: "node",
      hideInitializingCode: true,
    }
  );

  expect(output).toContain("__p_");
  expect(output).toContain("function ");

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toStrictEqual(10);
});

test("Variant #9: Should bring up variable declarations in for in statements", async () => {
  var output = await JsConfuser.obfuscate(
    `

    var myNumber = 0;
    var myArray = [0,1,2,3,4,5,6,7,8,9,10];
    for(var i in myArray){
      if(i==10){
        myNumber = 10;
      }
    } // i ends as "10"

    function myFunction(){
      return parseInt(i);
    }
    input(myFunction())
    `,
    {
      target: "node",
      hideInitializingCode: true,
    }
  );

  expect(output).toContain("__p_");
  expect(output).toContain("function ");

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toStrictEqual(10);
});

test("Variant #10: Should work with multiple variable declarations", async () => {
  var output = await JsConfuser.obfuscate(
    `

    var myNumber1 = 3, myNumber2 = 2;

    function myFunction(){
      return myNumber1*2 + myNumber2*2;
    }
    input(myFunction())
    `,
    {
      target: "node",
      hideInitializingCode: true,
    }
  );

  expect(output).toContain("__p_");
  expect(output).toContain("function ");

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toStrictEqual(10);
});

test("Variant #11: Should bring up variable declaration but not default values function expression's variables", async () => {
  var output = await JsConfuser.obfuscate(
    `

    var [myNumber1 = function(){
      var myNumber = 2;
    }] = [10];

    function myFunction(){
      return myNumber1;
    }
    input(myFunction())
    `,
    {
      target: "node",
      hideInitializingCode: true,
    }
  );

  expect(output).toContain("__p_");
  expect(output).toContain("function ");
  expect(output).toContain("var myNumber1;");
  expect(output).toContain("[myNumber1");
  expect(output).toContain("=[");

  expect(output).toContain("var myNumber=");

  var value = "never_called";
  function input(valueIn) {
    value = valueIn;
  }

  eval(output);

  expect(value).toStrictEqual(10);
});
