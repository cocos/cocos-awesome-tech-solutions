# `1.5.1`
Object Extraction Fix

- Fixed [#37](https://github.com/MichaelXF/js-confuser/issues/37)
- - Object Extraction was applying to objects with get/set methods, fixed in this version.

- Slight improvement to `Flatten`

# `1.5.0`
Hexadecimal Numbers

- The hexadecimal representation can now be used. [#29](https://github.com/MichaelXF/js-confuser/issues/29)
- New option `hexadecimalNumbers` to control this behavior.

### `hexadecimalNumbers`

Uses the hexadecimal representation (`50` -> `0x32`) for numbers. (`true/false`) -->

- Slight improvement to `Control Flow Flattening`
- Slight improvement to `Calculator`

# `1.4.3`
Minify Fix

- Fixed [#34](https://github.com/MichaelXF/js-confuser/issues/34)
- - Minify was removing `return` statements too aggressively, fixed in this version.

- Slight improvement to Control Flow Flattening

# `1.4.2`
Eval Fix

- Fixed [#31](https://github.com/MichaelXF/js-confuser/issues/31)
- - Eval and Integrity didn't work together, fixed in this version.

# `1.4.1`
AntiDebug Fix

- Fixed [#28](https://github.com/MichaelXF/js-confuser/issues/28)
- - AntiDebug was causing syntax errors in some scenarios, fixed in this version.

# `1.4.0`
Confusing Control Flow

- `Control Flow Flattening` overhaul, now flattens embedded control structures

- - `If statements`
- - `For statements`
- - `While statements`
- - `Switch statements`
- - `Do While statements`

- - Certain functions

```js
// Input
console.log(1);
console.log(2);
console.log(Number("3"));

for (var i = 4; i < 6; i++) {
  console.log(i);
}

var i = 0;
do {
  console.log(i + 6);
} while (i++ < 4);

// Output
var a = -123, b = 414, c = -191;
while (a + b + c != 104) {
    var d = (a + b + c) * -28 + 172;
    switch (d) {
    case -276:
        !(a *= 138 > b ? 2 : 158, a -= -5 < c ? -90 : -152, b *= b + 206, b -= a + -539, c += b + -372);
        break;
    case -2628:
        var e = (console['log'](-106 > c ? 1 : 182), console['log'](a + 125), console['log'](Number('3')), -87 < a ? -189 < a ? -133 : 93 : 107 < c ? 227 : 4);
        ~(a *= (-114 > c ? -164 : -107) < c ? -164 : 2, a -= 188 > b ? b + -211 : -369, b += -62 > c ? 168 > c ? -539 : 56 : 26, c += (c + 362 > a ? 73 : -157) < b ? 207 : 341);
        break;
    case -4420:
        +(a *= a + (a + 18), a -= 190 > a ? -344 : 71, b *= -206 < b ? c + -173 : -221, b -= b + 94, c += 89 > b ? -311 : 170);
        break;
    case -3972:
        if (e < c + -144) {
            !(a *= b + 127, a -= b + (b + 671), b += c + 82, c *= 61 < a ? -139 : 2, c -= b + -35);
            break;
        }
        typeof (a *= c + -148, a -= c + 271, b += c + 184, c += -89 < c ? -42 : -114);
        break;
    case -3244:
        +(a += a + 220, b += b + 317, c += b + -218);
        break;
    case -4308:
        !(a += 134 < b ? -233 : 89, b += -79 < b ? -69 : -241, c *= -107 > a ? -97 : 2, c -= (56 < a ? -27 : -184) > c ? -163 : 231);
        break;
    case -3664:
        ~(a += b + -362, b += -87 < b ? -666 : -172, c += c + 710);
        break;
    case -5344:
        +(a *= c + (-165 < a ? -266 : 182) > c ? 124 : 2, a -= -154 > b ? c + 92 : -388, b += c + -193, c *= c + (c + -30), c -= a + -11);
        break;
    case -2572:
        if (e++ < ((-125 < a ? -62 : 87) < c ? -112 : 4)) {
            ~(a += c + -268, b += 215 < b ? 136 : 18 < b ? -233 : 536, c += b + -535);
            break;
        }
        ~(a *= (123 > a ? -105 : 238) < b ? 216 : 2, a -= a + 57, b *= a + 59, b -= a + -369, c *= b + -236, c -= 200 > c ? -288 : -11);
        break;
    case -4784:
        +(console['log'](e), a *= c + -223, a -= 7 > c ? -227 > b ? -4 : 192 : -157, b *= a + (-186 > b ? 211 : 17), b -= -127 > c ? 76 : 280, c *= -63 > c ? a + 264 : 2, c -= (119 < c ? -206 : 85) < a ? 215 : 179);
        break;
    case -724:
        void (console['log'](e + (c + -246)), a *= -177 < c ? 2 : 207, a -= 152 > a ? 122 : -190, b *= c + -250, b -= b + 160, c += -141 < a ? a + 258 : 21);
        break;
    case -3804:
        var e = -143 > a ? 0 : 24;
        typeof (a += c + -9, b += c + 125, c += a + -261);
        break;
    case -1648:
        ~(e++, a += a + 3, b *= c + 68, b -= 89 < b ? -173 > b ? -147 : 267 : -228 > c ? -80 : -216 > b ? 93 : 68, c += 65 > a ? b + 156 : 216);
        break;
    }
}
```

- New encoding type `Hex Table`

```js
"{0x7E494534,0x688,0x7E6D53,0x401,0x7E584D4B,0x688,0x7E775853,0x688,0x7E5333,0x81}" 

// => "Hello World"
```

- Improvements to renaming labels
- Fixed [#24](https://github.com/MichaelXF/js-confuser/issues/24)
- Fixed [#25](https://github.com/MichaelXF/js-confuser/issues/25)
- Fixed [#26](https://github.com/MichaelXF/js-confuser/issues/26)

# `1.3.0`
String Splitting Improvement

- `String Splitting` now supports percentages and a custom callback. ([#22](https://github.com/MichaelXF/js-confuser/issues/22))

```js
{
  // percentage
  stringSplitting: 0.75, // = 75%

  // exclude certain strings
  stringSplitting: (str)=>{
    if ( str == "dont-split-string" ) {
      return false;
    }

    return true;
  },
}
```

# `1.2.2`
Global name fix

- **Bug fix**: `Rename Variables` breaking access to global variables

```js
// Say `a` is a global library
// Input
function myFunction(param1){
  a(param1);
}

// Output on 1.2.1
function a(a){
  a(a);
}

// Output on 1.2.2
function b(b){
  a(b);
}
```

- **Bug fix**: `Flatten` to not accidentally remove function parameters
- **Bug fix**: `Dispatcher` on function calls within classes
- **Bug fix**: `Minify` fixed syntax error

```js
// Input
var o = {Infinity: 0};

// Output on 1.2.1
var o = {1/0: 0};

// Output on 1.2.2
var o = {[1/0]: 0};
```

- Added `base32` encoding to `String Concealing`
- `Minify` improvements
- - `true` -> `!0`
- - `false` -> `!1`
- Subtle changes to `String Compression`
- Updated presets

# `1.2.1`
Bug fixes

- **Bug fix**: `Control Flow Flattening` on classes no longer creates syntax errors
- **Bug fix**: `String Concealing` will check for duplicate strings
- **Bug fix**: `String Concealing` now handles class properties
- **Bug fix**: `Stack` and `Control Flow Flattening` no longer modifies floats

- **New API:**

## `obfuscateAST(AST, options)`

Obfuscates an [ESTree](https://github.com/estree/estree) compliant AST. Returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

**Note:** Mutates the object.

| Parameter | Type | Description |
| --- | --- | --- |
| `AST` | `object` | The [ESTree](https://github.com/estree/estree) compliant AST. This object will be mutated. |
| `options` | `object` | The obfuscator settings. |

# `1.2.0`
Bug fixes

- **Bug fix**: `Eval` moves function declarations to the top of the lexical block
- **Bug fix**: `Stack` no longers changes function declarations
- Improvements to `Stack` rotations

```js
// Input
function add3(x,y,z){
  ok(typeof x === "number");
  ok(typeof y === "number");
  ok(typeof z === "number");

  return x + y + z;
}

console.log(add3(1,2,3))

// Output on 1.1.9
function _WFZLw(..._WFZLw) {
    void (_WFZLw.length = 3, ok(typeof _WFZLw[0] === 'number'), ok(typeof _WFZLw[1] === 'number'), ok(typeof _WFZLw[2] === 'number'));
    return _WFZLw[0] + _WFZLw[1] + _WFZLw[2];
}
console['log'](_WFZLw(1, 2, 3));

// Output on 1.2.0
var KZ6LyAL = (...KZ6LyAL) => {
    ~(KZ6LyAL.length = 3, ok(typeof KZ6LyAL[0] === 'number'), KZ6LyAL[186] = KZ6LyAL[0], ok(typeof KZ6LyAL[1] === 'number'), KZ6LyAL[227] = -22, ok(typeof KZ6LyAL[KZ6LyAL[KZ6LyAL[227] + 249] + 24] === 'number'));
    return KZ6LyAL[KZ6LyAL[227] - (KZ6LyAL[227] - 186)] + KZ6LyAL[KZ6LyAL[227] + 23] + KZ6LyAL[KZ6LyAL[KZ6LyAL[227] + 249] - (KZ6LyAL[227] - (KZ6LyAL[227] + 24))];
};
console.log(KZ6LyAL(1, 2, 3));
```

# `1.1.9`
Browser Lock and OS Lock

- Added `Browser Lock` and `OS Lock`

| Mode | Target | Method |
| --- | --- | --- |
| `Browser Lock` | `"browser"` | Checks `window.navigator.userAgent` |
| `Browser Lock` | `"node"` | N/A |
| `OS Lock` | `"browser"` | Checks `window.navigator.userAgent` |
| `OS Lock` | `"node"` | Checks `require('os').platform()` |

---

- #### `Browser Lock`

- Array of browsers where the script is allowed to run. (`string[]`)

- - Potency Low
- - Resilience Medium
- - Cost Medium

- Allowed values: `"firefox"`, `"chrome"`, `"iexplorer"`, `"edge"`, `"safari"`, `"opera"`

- Example: `["firefox", "chrome"]`

---

- #### `OS Lock`

- Array of operating-systems where the script is allowed to run. (`string[]`)

- - Potency Low
- - Resilience Medium
- - Cost Medium

- Allowed values: `"linux"`, `"windows"`, `"osx"`, `"android"`, `"ios"`

- Example: `["linux", "windows"]`

---

- **Bug fix**: `Moved Declarations` no longer applies to loops
- - Previously broke Switch statements

- `String Splitting` use larger chunk sizes to avoid creating too many strings

Available now on NPM: https://www.npmjs.com/package/js-confuser

# `1.1.8`
Bug Fixes and Improvements

- **Bug fix**: Stack no longer replaces identifiers that are in nested contexts

- `es5` converts
- - `fn(...args)` -> `fn.apply(this, args)`
- - `fn(...arguments)` -> `fn.apply(this, [].concat(Array.prototype.slice.call(arguments)))`

- Changes to `identifierGenerator`
- - `mangled` Now uses both lowercase and uppercase alphabets

- Added `antiTooling` to stop [JSNice.org](https://JSNice.org) from expanding sequence expressions

```js
// Input
(console.log(1), console.log(2), console.log(3))

// Output
+(console.log(1), console.log(2), console.log(3))

// JSNice on Input
console.log(1)
console.log(2)
console.log(3)

// JSNice on Output
+(console.log(1), console.log(2), console.log(3))
```

- Improved `controlFlowFlattening`
- - No longer changes blocks with `const` variables
- - Now obscures order of expressions
```js
// Input
console.log(1)
console.log(2)
console.log(3)
console.log(4)
var five = 5;
console.log(five);

// Output
var oI8J9w6 = (console['log'](1), console['log'](2), console['log'](3), console['log'](4), 5);
console['log'](oI8J9w6);
```

- - Now entangles number literals with the state variables ex:

```js
// Input
console.log(1);
console.log(2);
console.log(3);
console.log(4);
console.log(5);
console.log(6);
console.log(7);
console.log(8);
console.log(9);
console.log(10);

// Output
var xYPTGP = -164, NYvTJV = -40, eB6EbU = 55, cD8ztD = -73, AnCfc3A = 237, n6wikC = 52;
while (xYPTGP + NYvTJV + eB6EbU + cD8ztD + AnCfc3A + n6wikC != 33) {
    var ruVzem = (xYPTGP + NYvTJV + eB6EbU + cD8ztD + AnCfc3A + n6wikC) * -184 - 38;
    switch (ruVzem) {
    case -3350:
        console.log(4), (NYvTJV *= -66 > AnCfc3A ? n6wikC + (134 > xYPTGP ? -190 : 194) : 2, NYvTJV -= 77 < xYPTGP ? 28 : 66), xYPTGP += AnCfc3A - 201, (AnCfc3A *= n6wikC + 109, AnCfc3A -= 16 < NYvTJV ? 661 : -169);
        break;
    case -26902:
        console.log(31 > AnCfc3A ? 39 : -2 > AnCfc3A ? -137 : 3), (NYvTJV *= -174 > n6wikC ? AnCfc3A - 292 : 2, NYvTJV -= n6wikC - 91), (eB6EbU *= 155 > cD8ztD ? 2 : 42, eB6EbU -= 155 > AnCfc3A ? 1 : -227), (cD8ztD *= 183 < eB6EbU ? 222 : 2, cD8ztD -= 214 < AnCfc3A ? 270 : 70);
        break;
    case -12366:
        console.log(196 < eB6EbU ? -5 : 1), eB6EbU += -47 > cD8ztD ? -225 : 57, (xYPTGP *= AnCfc3A - 235, xYPTGP -= -126 < eB6EbU ? 46 : -434);
        break;
    case -20646:
        console.log(2), (n6wikC *= cD8ztD + 75, n6wikC -= ((107 > xYPTGP ? -244 : -80) > cD8ztD ? 65 : 149) > cD8ztD ? -138 > eB6EbU ? cD8ztD + 284 : 159 : 73 < AnCfc3A ? -14 : 83), AnCfc3A += xYPTGP - 95 < n6wikC ? 199 : 147, xYPTGP += 227 < xYPTGP ? -238 : 46;
        break;
    case -10526:
        console.log(10), xYPTGP += n6wikC + 524, n6wikC += cD8ztD + 263, (AnCfc3A *= 67 > xYPTGP ? n6wikC + (xYPTGP - 433 > n6wikC ? -21 : -111) : 2, AnCfc3A -= AnCfc3A + 247);
        break;
    case -2614:
        console.log(5), (n6wikC *= xYPTGP - 333, n6wikC -= (-41 > cD8ztD ? -38 > AnCfc3A ? 96 : -97 : 49) < NYvTJV ? 131 : 112), (cD8ztD *= eB6EbU + 115, cD8ztD -= -216 < AnCfc3A ? -631 : 23), (AnCfc3A *= (NYvTJV + 1 > xYPTGP ? 235 : 206) < n6wikC ? n6wikC + 310 : 2, AnCfc3A -= NYvTJV - 236), (xYPTGP *= 185 > eB6EbU ? -169 < xYPTGP ? 2 : 236 : -19, xYPTGP -= -59 < n6wikC ? 100 : n6wikC + 779);
        break;
    case -5006:
        console.log(6), (cD8ztD *= cD8ztD + (-100 < n6wikC ? -66 : 203), cD8ztD -= -87 < eB6EbU ? -101 : -261);
        break;
    case -16046:
        console.log(240 > AnCfc3A ? -70 : 7), (NYvTJV *= AnCfc3A - 240, NYvTJV -= 240 > AnCfc3A ? -66 : 304), AnCfc3A += eB6EbU - 76, (eB6EbU *= 154 > NYvTJV ? xYPTGP - 234 : 103 > xYPTGP ? -138 : 2, eB6EbU -= AnCfc3A - 409);
        break;
    case -9974:
        console.log(NYvTJV + (-225 > AnCfc3A ? -98 : -103)), xYPTGP += n6wikC + 260, eB6EbU += NYvTJV - 67, (AnCfc3A *= eB6EbU - 173, AnCfc3A -= eB6EbU - 132 < NYvTJV ? 19 : -107 > NYvTJV ? 145 : -44);
        break;
    case -8318:
        console.log(AnCfc3A - 45), (n6wikC *= -126 < xYPTGP ? 2 : 53, n6wikC -= n6wikC + 336);
    }
}
```

Available now on NPM: https://www.npmjs.com/package/js-confuser

# `1.1.7`
Website is Live

- [JsConfuser.com](https://jsconfuser.com) is live!
- Check out the [js-confuser-website](https://github.com/MichaelXF/js-confuser-website) repo for more info

- **⚠️ Breaking change**: `Rename Globals` is now enabled by default
- **Bug fix**: `Dead Code` no longers adds async code when `es5` option is enabled
- Improved `Control Flow Flattening`

# `1.1.6`
New feature: Name Recycling

- **New feature:** `nameRecycling`
- - Attempts to reuse released names.
- - Potency Medium
- - Resilience High
- - Cost Low

```js
// Input
function percentage(decimal) {
  var multiplied = x * 100;
  var floored = Math.floor(multiplied);
  var output = floored + "%"
  return output;
}

// Output
function percentage(decimal) {
  var multiplied = x * 100;
  var floored = Math.floor(multiplied);
  multiplied = floored + "%";
  return multiplied;
}
```

- `delete` operator is now properly parsed
- No longers changes `constructor` method on classes
- Added two new Dead Code samples and fixed one
- RGF now skips async and generator functions
- Object Extraction now places the extracted properties in the same position as the declaration
- Name Conflicts disabled to speed up obfuscation times
- Improvements to Minify
  (better Variable Grouping)
- The `renameGlobals` option now has affect

Available now on NPM: https://www.npmjs.com/package/js-confuser

# `1.1.5`
Performance Improvements

- **Bug fix**: Object Extraction
- - Improved safety checks (searches further down tree)
- - No longer applies to empty objects

- String Concealing results are now cached

- Minification improvements
- - `a += -1` -> `a -= 1`
- - `a -= -1` -> `a += 1`
- - `a + -b` -> `a - b`
- - `a - -b` -> `a + b`

- Dispatcher no longer applies to redefined functions

- Ensure `controlFlowFlattening` numbers don't get too large
  (hardcoded limit of 100,000)

- Opaque Predicates now excludes await expressions

Available now on NPM: https://www.npmjs.com/package/js-confuser

# `1.1.4`
Improved ES5 Support

- Full support for transpiling [ES6 template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)
- - Added `.raw` property for Tagged Template Literals

- Transpiling [ES6 Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes) down to ES5-compatible code
- Transpiling the [ES6 spread operator in arrays](https://www.samanthaming.com/tidbits/92-6-use-cases-of-spread-with-array/)
- Transpiling the [ES6 spread operator in objects](https://lucybain.com/blog/2018/js-es6-spread-operator/)

- Improved `controlFlowFlattening` to use multiple state variables
- Added chained-calls to `duplicateLiteralsRemoval`, similar to obfuscator.io's [`stringArrayWrappersChainedCalls`](https://github.com/javascript-obfuscator/javascript-obfuscator) option

Available now on NPM: https://www.npmjs.com/package/js-confuser

# `1.1.3`
Minification Changes

- Fixed minification errors
- - No longer accidentally removes function declarations/class declarations

- RGF Changes
- - Function cannot rely on `this`
- - Better support with `renameVariables`

- Opaque Predicate Changes
- - Now correctly applies to switch case tests

- Fixed Flatten bug causing undefined return values

- Support for transpiling [ES6 template strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)

Available now on NPM: https://www.npmjs.com/package/js-confuser

# `1.1.2`
New String Compression feature and Fixed Syntax errors

- **New feature**: `stringCompression`
- - String Compression uses LZW's compression algorithm to reduce file size. (`true/false/0-1`)
- - `"console"` -> `inflate('replaĕ!ğğuģģ<~@')`
- - Potency High
- - Resilience Medium
- - Cost Medium

- Fixed error with String encoding

- Fixed syntax error from obfuscating destructuring with computed keys
- Fixed syntax error when getters/setters were being converted to arrow functions
- Integrity fixes:
- - Better support with Dispatcher
- - Better support with Calculator

Available now on NPM: https://www.npmjs.com/package/js-confuser

# `1.1.1`
General fixes
- No longer encodes `"use strict"` and other directives
- No longer encodes `require("str")` or `import("str")` strings

- Fixed several `controlFlowFlattening` bugs:
  Fixed rare code corruption when nested
  Fixed obfuscation on `for` and `while` loops

- Fixed `stack` from creating syntax errors
  (No longer applies to for-loop initializers)

- Fixed renaming identifiers in object destructing
- Better support for `let` variables

- Checks for invalid options
- Increased test coverage to 90%

- `debugTransformations`, `Obfuscator` and `Transform` objects exposed.

Available now on NPM: https://www.npmjs.com/package/js-confuser

# `1.1.0`
New feature: Stack, and various improvements
- **New feature:** `stack`
  Local variables are consolidated into a rotating array. (`true/false/0-1`)
  [Similar to Jscrambler's Variable Masking](https://docs.jscrambler.com/code-integrity/documentation/transformations/variable-masking)
 - Potency Medium
 - Resilience Medium
 - Cost Low
 
 ```js
 // input
 function add3(x, y, z){
   return x + y + z;
 }
 
 // output
 function add3(...AxaSQr){AxaSQr.length=3;return AxaSQr.shift()+AxaSQr.shift()+AxaSQr.shift()}
 ```

- Improvements to `flatten`
- Properly renames `let` variables now
- Improvements to `dispatcher`

Available now on NPM: https://www.npmjs.com/package/js-confuser

# `1.0.9`
Support for lower versions of NodeJS

- Adjusted babel config to be more forgiving to the older versions of NodeJS.


# `1.0.8`
New shuffle feature and improvements
- New feature for shuffle:
`hash` - Shift based on the hash of the array contents
If the hash changes, the order of the array will be messed up causing your program to brick.

- Lock improvements
Fixed issue with `nativeFunctions`
Now errors when `countermeasures` callback can't be found.
Countermeasures callback works with `Integrity`.
New rules for `countermeasures` callback: 
Must be top-level,
No references to locked code (otherwise infinite loop)

- General improvements
Updated presets and documentation
Added `index.d.ts` for type-intellisense

Available now on NPM: https://www.npmjs.com/package/js-confuser



# `1.0.7`
Integrity fixed
- Integrity Improvements
- - Countermeasures function works with Integrity
- - Fixed hashing issues
- - - Wrote more tests for integrity
- Documentation Update
- - Fixed errors in examples