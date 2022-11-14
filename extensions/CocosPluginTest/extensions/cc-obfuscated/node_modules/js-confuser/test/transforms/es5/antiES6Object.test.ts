import JsConfuser from "../../../src/index";

it("should fix objects with computed properties", async () => {
  var code = `
  
  TEST_VARIABLE = {["k" + "e" + "y"] : 100};

  `;

  var output = await JsConfuser(code, {
    target: "browser",
    es5: true,
  });

  var TEST_VARIABLE;

  eval(output);
  expect(TEST_VARIABLE).toEqual({ key: 100 });
});

it("should fix objects with getters", async () => {
  var code = `
  
  TEST_VARIABLE = {
    get x (){
      return 100;
    }
  };

  `;

  var output = await JsConfuser(code, {
    target: "browser",
    es5: true,
  });

  var TEST_VARIABLE;

  eval(output);
  expect(TEST_VARIABLE.x).toEqual(100);
});

it("should fix objects with getters and setters", async () => {
  var code = `
  
  var TEST_STATE;
  TEST_VARIABLE = {
    get a () {
      return TEST_STATE / 2;
    },
    get x (){
      return TEST_STATE;
    },
    set x (y){
      TEST_STATE = y
    }
  };

  `;

  var output = await JsConfuser(code, {
    target: "browser",
    es5: true,
  });

  var TEST_VARIABLE;

  eval(output);

  TEST_VARIABLE.x = 50;

  expect(TEST_VARIABLE.a).toEqual(25);
  expect(TEST_VARIABLE.x).toEqual(50);
});

it("should fix objects with methods", async () => {
  var code = `
  
  var TEST_STATE;
  TEST_VARIABLE = {
    method(){
      return 10;
    }
  };

  `;

  var output = await JsConfuser(code, {
    target: "browser",
    es5: true,
  });

  var TEST_VARIABLE;

  eval(output);

  expect(TEST_VARIABLE.method()).toEqual(10);
});

it("should fix spread operator in array expressions", async () => {
  var code = `
  
  var subarray = [1,2,3];
  TEST_VARIABLE = [0,...subarray,4,5,...[6,7,8],9];

  `;

  var output = await JsConfuser(code, {
    target: "browser",
    es5: true,
  });

  expect(output).not.toContain("...");

  var TEST_VARIABLE;

  eval(output);
  expect(TEST_VARIABLE).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

it("should fix spread operator in array expressions where spread operator is last", async () => {
  var code = `
  
  var subarray = [1,2,3];
  var subarray2 = [6,7,8,9];
  TEST_VARIABLE = [0,...subarray,4,5,...subarray2];

  `;

  var output = await JsConfuser(code, {
    target: "browser",
    es5: true,
  });

  expect(output).not.toContain("...");

  var TEST_VARIABLE;

  eval(output);
  expect(TEST_VARIABLE).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
});

it("should fix spread operator in object expressions", async () => {
  var code = `
  
  var subObject = {key3: 30, key4: 40};
  TEST_VARIABLE = {key1: 10, key2: 20, ...subObject, key5: 50}
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    es5: true,
  });

  expect(output).not.toContain("...");

  var TEST_VARIABLE;

  eval(output);
  expect(TEST_VARIABLE).toEqual({
    key1: 10,
    key2: 20,
    key3: 30,
    key4: 40,
    key5: 50,
  });

  expect(Object.keys(TEST_VARIABLE)).toEqual([
    "key1",
    "key2",
    "key3",
    "key4",
    "key5",
  ]);
});

it("should fix spread operator in object expressions where spread operator is last", async () => {
  var code = `
  
  var subObject = {key3: 30, key4: 40};
  var subObject2 = {key6: 60, key7: 70, key8: 80}
  TEST_VARIABLE = {key1: 10, key2: 20, ...subObject, key5: 50, ...subObject2}
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    es5: true,
  });

  expect(output).not.toContain("...");

  var TEST_VARIABLE;

  eval(output);
  expect(TEST_VARIABLE).toEqual({
    key1: 10,
    key2: 20,
    key3: 30,
    key4: 40,
    key5: 50,
    key6: 60,
    key7: 70,
    key8: 80,
  });

  expect(Object.values(TEST_VARIABLE)).toEqual([
    10, 20, 30, 40, 50, 60, 70, 80,
  ]);
});

it("should fix spread operator in object expressions in complex situations", async () => {
  var code = `
  
  var subObject = {key3: 30, key4: 40};
  var subObject2 = {key6: 60, key7: 70, key8: 80}
  TEST_VARIABLE = {key1: 10, key2: 20, ...subObject, key5: 50, ...subObject2, ...{key9: 90}, key10: 100}
  `;

  var output = await JsConfuser(code, {
    target: "browser",
    es5: true,
  });

  expect(output).not.toContain("...");

  var TEST_VARIABLE;

  eval(output);
  expect(TEST_VARIABLE).toEqual({
    key1: 10,
    key2: 20,
    key3: 30,
    key4: 40,
    key5: 50,
    key6: 60,
    key7: 70,
    key8: 80,
    key9: 90,
    key10: 100,
  });

  expect(Object.values(TEST_VARIABLE)).toEqual([
    10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
  ]);
});
