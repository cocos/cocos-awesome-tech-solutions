import JsConfuser from "../../../src/index";

it("should convert class declarations to variable declarations", async () => {
  var output = await JsConfuser(
    `
    class Person { 
      constructor(name){this.name = name} 
      getName(){return this.name} 
    }; 
    
    var person = new Person("John");
    
    TEST_VARIABLE = person.name`,
    {
      target: "node",
      es5: true,
    }
  );

  expect(output).not.toContain("class");

  var TEST_VARIABLE;
  eval(output);

  expect(TEST_VARIABLE).toStrictEqual("John");
});

it("should convert class expressions to function expressions", async () => {
  var output = await JsConfuser(
    `
    
    var PersonClass = (class Person { constructor(name){this.name = name} getName(){return this.name} }); 
    var person = new PersonClass("John");
    TEST_VARIABLE = person.getName()`,
    {
      target: "node",
      es5: true,
    }
  );

  expect(output).not.toContain("class");

  var TEST_VARIABLE;
  eval(output);

  expect(TEST_VARIABLE).toStrictEqual("John");
});

it("should support static methods", async () => {
  var output = await JsConfuser(
    `
    class Person { 
      static createPerson(name){
        return new Person(name)
      }
      constructor(name){
        this.name = name
      }
      getName(){
        return this.name
      } 
    };

    var person = Person.createPerson("John");
    
    TEST_VARIABLE = person.name;
    `,
    {
      target: "node",
      es5: true,
    }
  );

  expect(output).not.toContain("class");

  var TEST_VARIABLE;
  eval(output);

  expect(TEST_VARIABLE).toStrictEqual("John");
});

it("should support computed property names", async () => {
  var output = await JsConfuser(
    `

      var constructorKey = "constructor";
      var getNameKey = "getName";

      class Person { 
        static createPerson(name){
          return new Person(name)
        }
        [constructorKey](name){
          this.name = name
        }
        [getNameKey](){
          return this.name
        } 
      };
  
      var person = new Person("John");
      
      TEST_VARIABLE = person.name;
      `,
    {
      target: "node",
      es5: true,
    }
  );

  expect(output).not.toContain("class");

  var TEST_VARIABLE;
  eval(output);

  expect(TEST_VARIABLE).toStrictEqual("John");
});

it("should support extending from a super class", async () => {
  var output = await JsConfuser(
    `
  class Shape {
    isShape(){
      return true
    }

    getShapeID(){
      return 0;
    }
  }

  class Rectangle extends Shape {

    constructor(width, height){
      super()
      this.width = width;
      this.height = height;
    }

    getShapeID(){
      return super.getShapeID() + 10;
    }

    getArea(){
      return this.width * this.height;
    }
  }


  var rect = new Rectangle(10, 20)

  TEST_AREA = rect.getArea()
  TEST_SHAPE_ID = rect.getShapeID()
  TEST_IS_SHAPE = rect.isShape()
  `,
    { target: "node", es5: true }
  );

  expect(output).not.toContain("class");

  var TEST_AREA, TEST_SHAPE_ID, TEST_IS_SHAPE;

  eval(output);

  expect(TEST_AREA).toStrictEqual(200);
  expect(TEST_SHAPE_ID).toStrictEqual(10);
  expect(TEST_IS_SHAPE).toStrictEqual(true);
});

it("should support getters and setters on the class", async () => {
  var output = await JsConfuser(
    `
  class Rectangle {
    constructor(width, height){
      this.width = width;
      this.height = height;
    }

    get area(){
      return this.width * this.height;
    }

    set setterProperty(newArea){
      this.width = newArea/2;
      this.height = 2;
    }
  }

  var rect = new Rectangle(10, 15)
  TEST_AREA = rect.area

  rect.setterProperty = 500

  TEST_NEW_AREA = rect.area
  
  `,
    {
      target: "node",
      es5: true,
    }
  );

  expect(output).not.toContain("class");

  var TEST_AREA, TEST_NEW_AREA;
  eval(output);

  expect(TEST_AREA).toStrictEqual(150);
  expect(TEST_NEW_AREA).toStrictEqual(500);
});

it("should support getters and setters on static methods", async () => {
  var output = await JsConfuser(
    `


  var timesSet = 0;
  var theRectangle;

  class Rectangle {
    constructor(width, height){
      this.width = width;
      this.height = height;
    }

    static get theRectangle(){
      if( !theRectangle ) {
        this.theRectangle = new Rectangle(4, 5)
      }
    }

    static set theRectangle(value){
      theRectangle = value;
      timesSet++;
    }
  }

  TEST_FIRST_RECT = theRectangle
  var rect = Rectangle.theRectangle;

  TEST_SECOND_RECT = theRectangle.width

  Rectangle.theRectangle = new Rectangle(40, 35)

  TEST_THIRD_RECT = theRectangle.width

  TEST_TIMES_SET = timesSet;
  `,
    {
      target: "node",
      es5: true,
    }
  );

  expect(output).not.toContain("class");

  var TEST_FIRST_RECT, TEST_SECOND_RECT, TEST_THIRD_RECT, TEST_TIMES_SET;
  eval(output);

  expect(TEST_FIRST_RECT).toStrictEqual(undefined);
  expect(TEST_SECOND_RECT).toStrictEqual(4);
  expect(TEST_THIRD_RECT).toStrictEqual(40);
  expect(TEST_TIMES_SET).toStrictEqual(2);
});

it("should support classes with no constructor", async () => {
  var output = await JsConfuser(
    `
  class Rectangle {
    getArea(){
      return this.width * this.height;
    }
  }

  var rect = new Rectangle();
  rect.width = 5;
  rect.height = 10;

  TEST_AREA = rect.getArea()
  `,
    {
      target: "node",
      es5: true,
    }
  );

  expect(output).not.toContain("class");

  var TEST_AREA;
  eval(output);

  expect(TEST_AREA).toStrictEqual(50);
});

it("should support preserving the class name", async () => {
  var output = await JsConfuser(
    `
  class Rectangle {
    getArea(){
      return this.width * this.height;
    }
  }

  var rect = new Rectangle();
  TEST_VALUE = rect.constructor.name;
  `,
    {
      target: "node",
      es5: true,
    }
  );

  expect(output).not.toContain("class");

  var TEST_VALUE;
  eval(output);

  expect(TEST_VALUE).toStrictEqual("Rectangle");
});

it("should properly pass arguments to super class", async () => {
  var output = await JsConfuser(
    `
    class Logger {
      constructor(name){
        TEST_INIT_ARG = name;
        this.name = name;
      }
    
      log(message){
        TEST_NAME = this.name;
      }
    }
    
    class Player extends Logger {
      constructor(){
        super("Player")
      }
    
      jump(){
        this.log("I jumped")
      }
    }

    var player = new Player();
    player.jump();
  `,
    {
      target: "node",
      es5: true,
    }
  );

  expect(output).not.toContain("class");

  var TEST_INIT_ARG, TEST_NAME;
  eval(output);

  expect(TEST_INIT_ARG).toStrictEqual("Player");
  expect(TEST_NAME).toStrictEqual("Player");
});

it("should work with stringConcealing and hide method names", async () => {
  var output = await JsConfuser(
    `
    class MyClass {

      constructor(value){
        this.value = value
      }

      getValue(){
        return this.value
      }
    }

    var instance = new MyClass(100)
    TEST_VALUE = instance.getValue()
  `,
    {
      target: "node",
      es5: true,
      stringConcealing: true,
    }
  );

  expect(output).not.toContain("class");
  expect(output).not.toContain("getValue");

  var TEST_VALUE;
  eval(output);

  expect(TEST_VALUE).toStrictEqual(100);
});
