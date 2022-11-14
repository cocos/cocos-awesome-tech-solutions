# confusion

Sometimes, we need that little bit of “security through obscurity” and want to 
obfuscate our source code.

**confusion** makes it harder to decipher your code by replacing string literals 
and property accesses with lookups into a string map.

## Example

This code snippet:

```js
a.property(called.with('a string literal'));
an.other("call", "is", "here");
```

will be converted to

```js
(function(_x24139) {
  a[_x24139[0]](called[_x24139[1]](_x24139[2]));
  an[_x24139[3]](_x24139[4], _x24139[5], _x24139[6]);
}).call(
  this,
  ["property", "with", "a string literal", "other", "call", "is", "here"]
);
```

Pipe it through closure compiler and you’ll get:

```js
(function(b){a[b[0]](called[b[1]](b[2]));an[b[3]](b[4],b[5],b[6])}).call(
  this,"property;with;a string literal;other;call;is;here".split(";"));

```

If your code declares any top level variables, it won’t be wrapped in a 
<abbr title="immediately invoced function expression">IIFE</abbr>. The string 
map will simply be prepended, in order to maintain program semantics:

```js
'use strict';
var name = 'A name here';
```

becomes:

```js
'use strict';
var _x44736 = ["A name here"];
var name = _x44736[0];
```

## Usage: command line

`confusion` reads from *stdin* and writes to *stdout.* Just pipe your source or
build through it:

```sh
confusion < build.js > obfuscated.js

# or pipe the output of your build tool through it:
browserify . | confusion > obfuscated.js
```

## Usage: programmatic interface

The `confusion` module exposes two functions:
`transformAst(programNode, createVariableName)` and `createVariableName(names)`.

`transformAst` takes a program AST node 
(`{type: 'Program', body: [/* nodes...*/]}`) and a callback function to produce 
the variable name of the string map. The callback takes an array of existing 
variable names and should return an unused name.

`createVariableName` is a default implementation of the callback needed by 
`transformAst`.

```js
var parse = require('esprima').parse;
var toString = require('escodegen').generate;
var confusion = require('confusion');

var ast = parse(sourceCode);
var obfuscated = confusion.transformAst(ast, confusion.createVariableName);
console.log(toString(obfuscated));
```
