function MyFunction() {
  var fillerVar1;
  var fillerVar2;
  var fillerVar3;
  var fillerVar4;
  var fillerVar5;

  // Filler keys for testing for syntax errors
  class TEST_CLASS {
    // Tests Stack
    10() {
      return 10;
    }
    9() {
      return 9;
    }
    8() {
      return 8;
    }
    7() {
      return 7;
    }
    6() {
      return 6;
    }
    5() {
      return 5;
    }
    4() {
      return 4;
    }
    3() {
      return 3;
    }
    2() {
      return 2;
    }
    1() {
      return 2;
    }

    // Tests String Concealing
    MyMethod1() {
      return 1;
    }
    MyMethod2() {
      return 2;
    }
    MyMethod3() {
      return 3;
    }
    MyMethod4() {
      return 4;
    }
    MyMethod5() {
      return 5;
    }
    MyMethod6() {
      return 6;
    }
    MyMethod7() {
      return 7;
    }
    MyMethod8() {
      return 8;
    }
    MyMethod9() {
      return 9;
    }
    MyMethod10() {
      return 10;
    }
  }

  var a = (function (cbRunner, obj) {
    var num1;
    var num2 = get30();
    var num3 = 8;

    num1 = obj["1700"];

    var _num4 = 1000;
    var _num5 = 1001;
    var _num6 = 1002;

    var decimal = 0.1738;

    cbRunner(() => {
      return num1 + num2 + num3 + decimal;
    });
    var _num7 = 1003;

    function get30() {
      return 30;
    }
  })(
    function (cb) {
      input(cb());
    },
    {
      1700: 1700,

      // Filler keys for testing for syntax errors
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
  );
}

MyFunction();
