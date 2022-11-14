// Variant #1 Using `let`
let myVariable = 1;

expect(myVariable).toStrictEqual(1);

// Variant #2 Destructing variable from object (ObjectPattern)
let { key } = { key: 2 };

expect(key).toStrictEqual(2);

// Variant #3 Destructing variable and using differing output name (ObjectPattern)
let { key: customName } = { key: 3 };

expect(customName).toStrictEqual(3);

// Variant #4 Destructing variable from array (ArrayPattern)
let [element] = [4];

expect(element).toStrictEqual(4);

// Variant #5 Destructing computed property from nested pattern
let [{ ["key"]: deeplyNestedKey }] = [{ key: 5 }];

expect(deeplyNestedKey).toStrictEqual(5);

// Variant #6 Make sure arrow functions work
const arrowFn = () => 6;

expect(arrowFn()).toStrictEqual(6);

// Variant #7 Make sure inline methods on object work
let es6Object = {
  method() {
    return 7;
  },
};

expect(es6Object.method()).toStrictEqual(7);

// Variant #8 Make sure getters on object work
es6Object = {
  get getter() {
    return 8;
  },
};

expect(es6Object.getter).toStrictEqual(8);

// Variant #9 Make sure getters with computed properties work
let customKey = "myGetter";
es6Object = {
  get [customKey]() {
    return 9;
  },
};

expect(es6Object.myGetter).toStrictEqual(9);

// Variant #10 Make sure constructor method works
var value;
class MyClass {
  constructor(x) {
    value = x;
  }
}

var myInstance = new MyClass(10);
expect(value).toStrictEqual(10);

// Variant #11 Make sure for-loop initializers work
var sum = 0;
for (var x of [3, 3, 5]) {
  sum += x;
}
expect(sum).toStrictEqual(11);
