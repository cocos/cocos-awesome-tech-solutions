# JS Confuser

JS-Confuser is a JavaScript obfuscation tool to make your programs _impossible_ to read. [Try the web version](https://jsconfuser.com).

  [![NPM](https://img.shields.io/badge/NPM-%23000000.svg?style=for-the-badge&logo=npm&logoColor=white)](https://npmjs.com/package/js-confuser) [![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)](https://github.com/MichaelXF/js-confuser) [![Netlify](https://img.shields.io/badge/netlify-%23000000.svg?style=for-the-badge&logo=netlify&logoColor=#00C7B7)](https://jsconfuser.com)

## Key features

- Variable renaming
- Control Flow obfuscation
- String concealing
- Function obfuscation
- Locks (domainLock, date)
- [Detect changes to source code](https://github.com/MichaelXF/js-confuser/blob/master/Integrity.md)

## Presets

JS-Confuser comes with three presets built into the obfuscator.

| Preset | Transforms | Performance Reduction | Sample |
| --- | --- | --- | --- |
| High | 21/22 | 98% | [Sample](https://github.com/MichaelXF/js-confuser/blob/master/samples/high.js) |
| Medium | 15/22 | 52% | [Sample](https://github.com/MichaelXF/js-confuser/blob/master/samples/medium.js) |
| Low | 10/22 | 30% | [Sample](https://github.com/MichaelXF/js-confuser/blob/master/samples/low.js) |

You can extend each preset or all go without them entirely.

## Installation

```bash
$ npm install js-confuser
```

## Usage

```js
var JsConfuser = require("js-confuser");

JsConfuser.obfuscate(`
  function fibonacci(num){   
    var a = 0, b = 1, c = num;
    while (num-- > 1) {
      c = a + b;
      a = b;
      b = c;
    }
    return c;
  }

  for ( var i = 1; i <= 25; i++ ) {
    console.log(i, fibonacci(i))
  }
`, {
  target: "node",
  preset: "high",
  stringEncoding: false, // <- Normally enabled
}).then(obfuscated => {
  console.log(obfuscated)
})

/*
var AF59rI,ZgbbeaU,WDgj3I,gpR2qG,Ox61sk,pTNPNpX;AF59rI=[60,17,25,416,22,23,83,26,27,28,18,382,66,29,30,31,2,5,33,4,13,16,10,11,24,1,3,15,6,7,8,167,50,9,21,35,12,14,116],ZgbbeaU=AF59rI;for(var TlMIASm=62;TlMIASm;TlMIASm--)ZgbbeaU.unshift(ZgbbeaU.pop());WDgj3I=MBh_HcM("length1charCodeAt1slice1replaĕ1!ğğ1uģģ1<~A8bt#D.RU,~>Ħ~E,ol,ATMnĳĵ@rH7+DertŀħDKTtlBhE[ŋ~@q]:k6Z6LHŖ6$*Ŗ7n#j;20AŖ;g3Cn<]'Ŗ<Fna!Cii#ŖAU&0.Eb0;TŖ4ƌĴħ3rƍ)eVMBK\\!Ŗ+=M;Q@;]UaŖž=3&.0Ŗ/M2-WEcYr5ŖD?ƯTqŸb>-Q:c8Ŗ?SF2m2*!WQŖ2)RĲƐ~ž<ƿĴmČuĀ1 (local)").split('1');function pprWr0(ZgbbeaU){var WDgj3I,gpR2qG,Ox61sk,pTNPNpX,TlMIASm,pprWr0,M1ClYmT,kHWl72,xw_ohrD,sT8e3fv,bxd0KVG;WDgj3I=void 0,gpR2qG=void 0,Ox61sk=void 0,pTNPNpX=void 0,TlMIASm=void 0,pprWr0=String,M1ClYmT=CVH25o3(0),kHWl72=255,xw_ohrD=CVH25o3(1),sT8e3fv=CVH25o3(AF59rI[0]),bxd0KVG=CVH25o3(3);for('<~'===ZgbbeaU[sT8e3fv](0,AF59rI[0])&&'~>'===ZgbbeaU[sT8e3fv](-AF59rI[0]),ZgbbeaU=ZgbbeaU[sT8e3fv](AF59rI[0],-AF59rI[0])[bxd0KVG](/s/g,'')[bxd0KVG]('z',CVH25o3(AF59rI[3])),WDgj3I=CVH25o3(AF59rI[1])[sT8e3fv](ZgbbeaU[M1ClYmT]%AF59rI[1]||AF59rI[1]),ZgbbeaU+=WDgj3I,Ox61sk=[],pTNPNpX=0,TlMIASm=ZgbbeaU[M1ClYmT];TlMIASm>pTNPNpX;pTNPNpX+=AF59rI[1])gpR2qG=52200625*(ZgbbeaU[xw_ohrD](pTNPNpX)-AF59rI[2])+614125*(ZgbbeaU[xw_ohrD](pTNPNpX+AF59rI[9])-AF59rI[2])+7225*(ZgbbeaU[xw_ohrD](pTNPNpX+AF59rI[0])-AF59rI[2])+85*(ZgbbeaU[xw_ohrD](pTNPNpX+AF59rI[10])-AF59rI[2])+(ZgbbeaU[xw_ohrD](pTNPNpX+AF59rI[3])-AF59rI[2]),Ox61sk.push(kHWl72&gpR2qG>>AF59rI[8],kHWl72&gpR2qG>>AF59rI[5],kHWl72&gpR2qG>>8,kHWl72&gpR2qG);return function(ZgbbeaU,Ox61sk){for(var WDgj3I=Ox61sk;WDgj3I>0;WDgj3I--)ZgbbeaU.pop()}(Ox61sk,WDgj3I[M1ClYmT]),pprWr0.fromCharCode.apply(pprWr0,Ox61sk)}gpR2qG=[CVH25o3(AF59rI[12]),CVH25o3(AF59rI[13]),CVH25o3(8),CVH25o3(AF59rI[17]),CVH25o3(AF59rI[6]),CVH25o3(AF59rI[7]),CVH25o3(AF59rI[20]),'<~AQO1jBl7V~>',CVH25o3(AF59rI[4]),CVH25o3(AF59rI[21]),CVH25o3(AF59rI[4]),CVH25o3(9),CVH25o3(AF59rI[11]),CVH25o3(AF59rI[5]),CVH25o3(AF59rI[24]),CVH25o3(AF59rI[33]),'<~E%u9/13QC~>',CVH25o3(AF59rI[6]),CVH25o3(AF59rI[7]),CVH25o3(19),CVH25o3(20),CVH25o3(AF59rI[18]),CVH25o3(AF59rI[27]),CVH25o3(AF59rI[28]),CVH25o3(AF59rI[8]),'<~?T9_t1,(IC~>','<~1bpf~>',CVH25o3(AF59rI[25]),CVH25o3(AF59rI[30]),CVH25o3(AF59rI[31]),CVH25o3(14),CVH25o3(AF59rI[8])];function M1ClYmT(AF59rI){return pprWr0(gpR2qG[AF59rI])}function kHWl72(){try{return global}catch(AF59rI){return this}}Ox61sk=kHWl72.call(this);function xw_ohrD(ZgbbeaU){switch(ZgbbeaU){case 608:return Ox61sk[M1ClYmT(0)];case-884:return Ox61sk[CVH25o3(AF59rI[32])];case AF59rI[26]:return Ox61sk[M1ClYmT(AF59rI[9])];case-AF59rI[35]:return Ox61sk[M1ClYmT(2)]}}function sT8e3fv(ZgbbeaU,WDgj3I,gpR2qG){var Ox61sk;Ox61sk=11;while(Ox61sk!=51){var pTNPNpX,TlMIASm,pprWr0,kHWl72;pTNPNpX=Ox61sk*-244+217;switch(pTNPNpX){case-2467:TlMIASm=false,Ox61sk+=37;break;case-4175:kHWl72=WDgj3I==M1ClYmT(AF59rI[10])&&ziPI9L.qzUvJu1[M1ClYmT(4)+M1ClYmT(AF59rI[1])](AF59rI[9])==48?function(...WDgj3I){var gpR2qG;gpR2qG=AF59rI[1];while(gpR2qG!=AF59rI[11]){var Ox61sk;Ox61sk=gpR2qG*41+199;switch(Ox61sk){case 732:return pprWr0[ZgbbeaU].call(this,M1ClYmT(AF59rI[12]));case 404:IZftqI=WDgj3I,gpR2qG+=AF59rI[14]}}}:pprWr0[ZgbbeaU](M1ClYmT(AF59rI[13])),Ox61sk-=AF59rI[10];break;case-11495:pprWr0={[M1ClYmT(AF59rI[14])]:function(ZgbbeaU,WDgj3I,gpR2qG){var Ox61sk;Ox61sk=64;while(Ox61sk!=AF59rI[16]){var pTNPNpX,TlMIASm,pprWr0;pTNPNpX=Ox61sk*AF59rI[15]+144;switch(pTNPNpX){case 10832:TlMIASm=822,Ox61sk+=AF59rI[10];break;case 812:pprWr0[AF59rI[10]]=pprWr0[0],Ox61sk+=47;break;case 8661:while(TlMIASm!=772){var kHWl72;kHWl72=TlMIASm*234+191;switch(kHWl72){case 207515:TlMIASm-=528;break;case 129593:pprWr0[3]=bxd0KVG(AF59rI[15],pprWr0[AF59rI[9]],pprWr0[AF59rI[0]]),pprWr0[AF59rI[9]]=pprWr0[AF59rI[0]],pprWr0[AF59rI[0]]=pprWr0[AF59rI[10]],TlMIASm+=333;break;case 83963:TlMIASm+=bxd0KVG(-AF59rI[29],pprWr0[0]--,AF59rI[9])&&ziPI9L.U1LXDgJ()?195:414;break;case 192539:TlMIASm-=464}}Ox61sk-=AF59rI[16];break;case 10999:[...pprWr0]=IZftqI,pprWr0.length=1,Ox61sk-=AF59rI[38];break;case 6824:return[];case 11333:if(!ZgbbeaU){return WDgj3I(this,gpR2qG)}Ox61sk-=AF59rI[0];break;case 311:return[pprWr0[AF59rI[10]]];case 5822:pprWr0[1]=0,pprWr0[AF59rI[0]]=AF59rI[9],Ox61sk-=AF59rI[37]}}},[M1ClYmT(AF59rI[17])]:function(ZgbbeaU,WDgj3I,gpR2qG){var Ox61sk;Ox61sk=AF59rI[18];while(Ox61sk!=38){var pTNPNpX,TlMIASm,pprWr0;pTNPNpX=Ox61sk*182+-139;switch(pTNPNpX){case 4047:pprWr0[AF59rI[9]]=sT8e3fv(M1ClYmT(AF59rI[6]),M1ClYmT(AF59rI[7])).call([],pprWr0[0]),Ox61sk+=AF59rI[19];break;case 3683:TlMIASm=false,Ox61sk+=21;break;case 7505:[...pprWr0]=IZftqI,Ox61sk-=10;break;case 225:return pprWr0[AF59rI[9]].pop();case 10417:if(TlMIASm){var kHWl72=(ZgbbeaU,WDgj3I,gpR2qG)=>{var Ox61sk;Ox61sk=32;while(Ox61sk!=AF59rI[19]){var pTNPNpX,TlMIASm,pprWr0;pTNPNpX=Ox61sk*38+90;switch(pTNPNpX){case 508:TlMIASm=bxd0KVG(AF59rI[15],M1ClYmT(AF59rI[20]),pprWr0.toUTCString()),Ox61sk+=AF59rI[21];break;case 584:pprWr0.setTime(bxd0KVG(AF59rI[15],pprWr0.getTime(),bxd0KVG(AF59rI[22],bxd0KVG(116,bxd0KVG(AF59rI[22],bxd0KVG(116,gpR2qG,AF59rI[8]),AF59rI[23]),AF59rI[23]),1e3))),Ox61sk-=2;break;case 1040:xw_ohrD(608).cookie=bxd0KVG(AF59rI[15],bxd0KVG(AF59rI[15],bxd0KVG(AF59rI[15],bxd0KVG(AF59rI[15],bxd0KVG(AF59rI[15],ZgbbeaU,M1ClYmT(AF59rI[4])),WDgj3I),M1ClYmT(AF59rI[21])),TlMIASm),M1ClYmT(15)),Ox61sk+=AF59rI[6];break;case 1306:pprWr0=new Date,Ox61sk-=19}}}}Ox61sk-=56;break;case 5685:pprWr0.length=1,Ox61sk-=AF59rI[17]}}}},Ox61sk-=43;break;case-14179:kHWl72=void 0;if(WDgj3I==M1ClYmT(AF59rI[5])&&ziPI9L.VNaV0wv[M1ClYmT(AF59rI[24])+M1ClYmT(18)](AF59rI[6])==AF59rI[16]){IZftqI=[]}Ox61sk-=41;break;case-1003:if(TlMIASm){xw_ohrD(-884).exports=async()=>{var ZgbbeaU;ZgbbeaU=33;while(ZgbbeaU!=AF59rI[7]){var WDgj3I,gpR2qG,Ox61sk;WDgj3I=ZgbbeaU*95+-150;switch(WDgj3I){case 3175:gpR2qG=await(async()=>{var ZgbbeaU;ZgbbeaU=14;while(ZgbbeaU!=AF59rI[13]){var WDgj3I;WDgj3I=ZgbbeaU*100+-59;switch(WDgj3I){case 1341:if(isStandaloneExecutable){return M1ClYmT(19)+M1ClYmT(20)}ZgbbeaU+=AF59rI[6];break;case 2341:if(redactedPath===await resolveLocalredactedPath()){return CVH25o3(AF59rI[36])}ZgbbeaU-=AF59rI[13];break;case 1641:return''}}})(),ZgbbeaU-=AF59rI[25];break;case 2985:Ox61sk=new Set(xw_ohrD(AF59rI[26]).argv.slice(2)),ZgbbeaU-=AF59rI[6];break;case 2035:if(!Ox61sk.has(M1ClYmT(AF59rI[18])+M1ClYmT(AF59rI[27]))){var pTNPNpX;pTNPNpX=AF59rI[14];while(pTNPNpX!=9){var TlMIASm;TlMIASm=pTNPNpX*-204+38;switch(TlMIASm){case-1594:if(bxd0KVG(427,Ox61sk.size,1)){return false}pTNPNpX-=AF59rI[3];break;case-778:if(!Ox61sk.has(M1ClYmT(AF59rI[28]))){return false}pTNPNpX+=AF59rI[1]}}}ZgbbeaU+=AF59rI[20];break;case 800:return true}}}}Ox61sk+=54;break;case-3443:return gpR2qG==M1ClYmT(AF59rI[8])&&ziPI9L.U1LXDgJ()?{QVbrqy9:kHWl72}:kHWl72}}}function bxd0KVG(ZgbbeaU,WDgj3I,gpR2qG){switch(ZgbbeaU){case-AF59rI[34]:return WDgj3I<=gpR2qG;case-AF59rI[29]:return WDgj3I>gpR2qG;case AF59rI[15]:return WDgj3I+gpR2qG;case AF59rI[22]:return WDgj3I*gpR2qG;case 427:return WDgj3I!==gpR2qG}}pTNPNpX=AF59rI[12];while(pTNPNpX!=AF59rI[24]){var kBznIi,sCb8UYh,ziPI9L,IZftqI;kBznIi=pTNPNpX*-55+-214;switch(kBznIi){case-544:sCb8UYh=846,pTNPNpX+=AF59rI[0];break;case-654:ziPI9L={wHDYSl:[],U1LXDgJ:function(){if(!ziPI9L.wHDYSl[0]){ziPI9L.wHDYSl.push(87)}return ziPI9L.wHDYSl.length},VNaV0wv:M1ClYmT(AF59rI[25])+M1ClYmT(AF59rI[30]),qzUvJu1:M1ClYmT(AF59rI[31])+M1ClYmT(AF59rI[32])},pTNPNpX+=AF59rI[33];break;case-1644:IZftqI=[],pTNPNpX-=7;break;case-1259:while(sCb8UYh!=316){var XsBuZX,mgjtps2;XsBuZX=sCb8UYh*229+-125;switch(XsBuZX){case 193609:mgjtps2=AF59rI[9],sCb8UYh-=733;break;case 25752:sCb8UYh+=bxd0KVG(-AF59rI[34],mgjtps2,25)&&ziPI9L.U1LXDgJ()?662:203;break;case 177350:xw_ohrD(-AF59rI[35])[M1ClYmT(AF59rI[36])](mgjtps2,(IZftqI=[mgjtps2],new sT8e3fv(M1ClYmT(AF59rI[37]),void 0,M1ClYmT(AF59rI[38])).QVbrqy9)),sCb8UYh-=569;break;case 47049:mgjtps2++,sCb8UYh-=93}}pTNPNpX-=AF59rI[0]}}function CVH25o3(AF59rI){return WDgj3I[AF59rI]}function MBh_HcM(ZgbbeaU){var WDgj3I,gpR2qG,Ox61sk,pTNPNpX,TlMIASm,pprWr0,M1ClYmT,kHWl72;WDgj3I=void 0,gpR2qG=void 0,Ox61sk=void 0,pTNPNpX={},TlMIASm=ZgbbeaU.split(''),pprWr0=gpR2qG=TlMIASm[0],M1ClYmT=[pprWr0],kHWl72=WDgj3I=256;for(ZgbbeaU=AF59rI[9];ZgbbeaU<TlMIASm.length;ZgbbeaU++)Ox61sk=TlMIASm[ZgbbeaU].charCodeAt(0),Ox61sk=kHWl72>Ox61sk?TlMIASm[ZgbbeaU]:pTNPNpX[Ox61sk]?pTNPNpX[Ox61sk]:gpR2qG+pprWr0,M1ClYmT.push(Ox61sk),pprWr0=Ox61sk.charAt(0),pTNPNpX[WDgj3I]=gpR2qG+pprWr0,WDgj3I++,gpR2qG=Ox61sk;return M1ClYmT.join('')}
*/
```

## CLI Usage

```shell
<coming soon>
```

## `obfuscate(sourceCode, options)`

Obfuscates the `sourceCode`. Returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) that resolves to a string of the obfuscated code.

| Parameter | Type | Description |
| --- | --- | --- |
| `sourceCode` | `string` | The JavaScript code to be obfuscated. |
| `options` | `object` | The obfuscator settings. |

## `obfuscateAST(AST, options)`

Obfuscates an [ESTree](https://github.com/estree/estree) compliant AST. Returns a [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise).

**Note:** Mutates the object.

| Parameter | Type | Description |
| --- | --- | --- |
| `AST` | `object` | The [ESTree](https://github.com/estree/estree) compliant AST. This object will be mutated. |
| `options` | `object` | The obfuscator settings. |

## Options

### `target`

The execution context for your output. _Required_.

1. `"node"`
2. `"browser"`

### `preset`

[JS-Confuser comes with three presets built into the obfuscator](https://github.com/MichaelXF/js-confuser#presets). _Optional_. (`"high"/"medium"/"low"`)

```js
var JsConfuser = require('js-confuser');

JsConfuser.obfuscate(`<source code>`, {
  target: "node",
  preset: "high" // | "medium" | "low"
}).then(obfuscated=>{
  console.log(obfuscated) // obfuscated is a string
})
```

### `compact`

Remove's whitespace from the final output. Enabled by default. (`true/false`)

### `hexadecimalNumbers`

Uses the hexadecimal representation (`50` -> `0x32`) for numbers. (`true/false`)

### `minify`

Minifies redundant code. (`true/false`)

### `es5`

Converts output to ES5-compatible code. (`true/false`)

Does not cover all cases such as Promises or Generator functions. Use [Babel](https://babel.dev/).

### `renameVariables`

Determines if variables should be renamed. (`true/false`)

- Potency High
- Resilience High
- Cost Medium

### `renameGlobals`

Renames top-level variables, turn this off for web-related scripts. Enabled by default. (`true/false`)

### `identifierGenerator`

Determines how variables are renamed.

| Mode | Description | Example |
| --- | --- | --- |
| `"hexadecimal"` | Random hex strings | \_0xa8db5 |
| `"randomized"` | Random characters | w$Tsu4G |
| `"zeroWidth"` | Invisible characters | U+200D |
| `"mangled"` | Alphabet sequence | a, b, c |
| `"number"` | Numbered sequence | var_1, var_2 |
| `<function>` | Write a custom name generator | See Below |

```js
// Custom implementation
JsConfuser.obfuscate(code, {
  target: "node",
  renameVariables: true,
  identifierGenerator: function () {
    return "$" + Math.random().toString(36).substring(7);
  },
});

// Numbered variables
var counter = 0;
JsConfuser.obfuscate(code, {
  target: "node",
  renameVariables: true,
  identifierGenerator: function () {
    return "var_" + (counter++);
  },
});
```

JSConfuser tries to reuse names when possible, creating very potent code.

### `nameRecycling`

⚠️ Experimental feature, may break your code!

Attempts to reuse released names.

- Potency Medium
- Resilience High
- Cost Low

```js
// Input
function percentage(x) {
  var multiplied = x * 100;
  var floored = Math.floor(multiplied);
  var output = floored + "%"
  return output;
}

// Output
function percentage(x) {
  var multiplied = x * 100;
  var floored = Math.floor(multiplied);
  multiplied = floored + "%";
  return multiplied;
}
```

### `controlFlowFlattening`

⚠️ Significantly impacts performance, use sparingly!

[Control-flow Flattening](https://docs.jscrambler.com/code-integrity/documentation/transformations/control-flow-flattening) hinders program comprehension by creating convoluted switch statements. (`true/false/0-1`)

Use a number to control the percentage from 0 to 1.

- Potency High
- Resilience High
- Cost High

### `globalConcealing`

Global Concealing hides global variables being accessed. (`true/false`)

- Potency Medium
- Resilience High
- Cost Low

### `stringCompression`
String Compression uses LZW's compression algorithm to compress strings. (`true/false/0-1`)

`"console"` -> `inflate('replaĕ!ğğuģģ<~@')`
- Potency High
- Resilience Medium
- Cost Medium

### `stringConcealing`

[String Concealing](https://docs.jscrambler.com/code-integrity/documentation/transformations/string-concealing) involves encoding strings to conceal plain-text values. (`true/false/0-1`)

Use a number to control the percentage of strings.

`"console"` -> `decrypt('<~@rH7+Dert~>')`
   
- Potency High
- Resilience Medium
- Cost Medium

### `stringEncoding`

[String Encoding](https://docs.jscrambler.com/code-integrity/documentation/transformations/string-encoding) transforms a string into an encoded representation. (`true/false/0-1`)

Use a number to control the percentage of strings.

`"console"` -> `'\x63\x6f\x6e\x73\x6f\x6c\x65'`

- Potency Low
- Resilience Low
- Cost Low

### `stringSplitting`

[String Splitting](https://docs.jscrambler.com/code-integrity/documentation/transformations/string-splitting) splits your strings into multiple expressions. (`true/false/0-1`)

Use a number to control the percentage of strings.

`"console"` -> `String.fromCharCode(99) + 'ons' + 'ole'`

- Potency Medium
- Resilience Medium
- Cost Medium

### `duplicateLiteralsRemoval`

[Duplicate Literals Removal](https://docs.jscrambler.com/code-integrity/documentation/transformations/duplicate-literals-removal) replaces duplicate literals with a single variable name. (`true/false`)

- Potency Medium
- Resilience Low
- Cost High

### `dispatcher`

Creates a middleman function to process function calls. (`true/false/0-1`)

- Potency Medium
- Resilience Medium
- Cost High

### `eval`

#### **`Security Warning`**

From [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval): Executing JavaScript from a string is an enormous security risk. It is far too easy for a bad actor to run arbitrary code when you use eval(). Never use eval()!

Wraps defined functions within eval statements.

- **`false`** - Avoids using the `eval` function. _Default_.
- **`true`** - Wraps function's code into an `eval` statement.

```js
// Output.js
var Q4r1__ = {
  Oo$Oz8t: eval(
    "(function(YjVpAp){var gniSBq6=kHmsJrhOO;switch(gniSBq6){case'RW11Hj5x':return console;}});"
  ),
};
Q4r1__.Oo$Oz8t("RW11Hj5x");
```

### `rgf`

RGF (Runtime-Generated-Functions) uses the [`new Function(code...)`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/Function) syntax to construct executable code from strings. (`"all"/true/false`)

- **This can break your code. This is also as dangerous as `eval`.**
- **Due to the security concerns of arbitrary code execution, you must enable this yourself.**
- The arbitrary code is also obfuscated.

| Mode | Description |
| --- | --- |
| `"all"` | Recursively applies to every scope (slow) |
| `true` | Applies to the top level only |
| `false` | Feature disabled |

```js
// Input
function log(x){
  console.log(x)
}

log("Hello World")

// Output
var C6z0jyO=[new Function('a2Fjjl',"function OqNW8x(OqNW8x){console['log'](OqNW8x)}return OqNW8x(...Array.prototype.slice.call(arguments,1))")];(function(){return C6z0jyO[0](C6z0jyO,...arguments)}('Hello World'))
```

### `objectExtraction`

Extracts object properties into separate variables. (`true/false`)

- Potency Medium
- Resilience Medium
- Cost Low

```js
// Input
var utils = {
  isString: x=>typeof x === "string",
  isBoolean: x=>typeof x === "boolean"
}
if ( utils.isString("Hello") ) {
  // ...
}

// Output
var utils_isString = x=>typeof x === "string";
var utils_isBoolean = x=>typeof x === "boolean";
if ( utils_isString("Hello") ) {
  // ...
}
```

### `flatten`

Brings independent declarations to the highest scope. (`true/false`)

- Potency Medium
- Resilience Medium
- Cost High

### `deadCode`

Randomly injects dead code. (`true/false/0-1`)

Use a number to control the percentage from 0 to 1.

- Potency Medium
- Resilience Medium
- Cost Low 

### `calculator`

Creates a calculator function to handle arithmetic and logical expressions. (`true/false/0-1`)

- Potency Medium
- Resilience Medium
- Cost Low

### `lock.antiDebug`

Adds `debugger` statements throughout the code. Additionally adds a background function for DevTools detection. (`true/false/0-1`)

### `lock.context`

Properties that must be present on the `window` object (or `global` for NodeJS). (`string[]`)

### `lock.startDate`

When the program is first able to be used. (`number` or `Date`)

Number should be in milliseconds.

- Potency Low
- Resilience Medium
- Cost Medium

### `lock.endDate`

When the program is no longer able to be used. (`number` or `Date`)

Number should be in milliseconds.

- Potency Low
- Resilience Medium
- Cost Medium

### `lock.domainLock`

Array of regex strings that the `window.location.href` must follow. (`Regex[]` or `string[]`)

- Potency Low
- Resilience Medium
- Cost Medium

### `lock.osLock`

Array of operating-systems where the script is allowed to run. (`string[]`)

- Potency Low
- Resilience Medium
- Cost Medium

Allowed values: `"linux"`, `"windows"`, `"osx"`, `"android"`, `"ios"`

Example: `["linux", "windows"]`

### `lock.browserLock`

Array of browsers where the script is allowed to run. (`string[]`)

- Potency Low
- Resilience Medium
- Cost Medium

Allowed values: `"firefox"`, `"chrome"`, `"iexplorer"`, `"edge"`, `"safari"`, `"opera"`

Example: `["firefox", "chrome"]`

### `lock.nativeFunctions`

Set of global functions that are native. Such as `require`, `fetch`. If these variables are modified the program crashes.
Set to `true` to use the default set of native functions. (`string[]/true/false`)

- Potency Low
- Resilience Medium
- Cost Medium

### `lock.integrity`

Integrity ensures the source code is unchanged. (`true/false/0-1`)

[Learn more here](https://github.com/MichaelXF/js-confuser/blob/master/Integrity.md).

- Potency Medium
- Resilience High
- Cost High

### `lock.countermeasures`

A custom callback function to invoke when a lock is triggered. (`string/false`)

[Learn more about the countermeasures function](https://github.com/MichaelXF/js-confuser/blob/master/Countermeasures.md).

Otherwise, the obfuscator falls back to crashing the process.

### `movedDeclarations`

Moves variable declarations to the top of the context. (`true/false`)

- Potency Medium
- Resilience Medium
- Cost Low

### `opaquePredicates`

An [Opaque Predicate](https://en.wikipedia.org/wiki/Opaque_predicate) is a predicate(true/false) that is evaluated at runtime, this can confuse reverse engineers from understanding your code. (`true/false/0-1`)

- Potency Medium
- Resilience Medium
- Cost Low

### `shuffle`

Shuffles the initial order of arrays. The order is brought back to the original during runtime. (`"hash"/true/false/0-1`)

- Potency Medium
- Resilience Low
- Cost Low

| Mode | Description |
| --- | --- |
| `"hash"`| Array is shifted based on hash of the elements  |
| `true`| Arrays are shifted *n* elements, unshifted at runtime |
| `false` | Feature disabled |

### `stack`

Local variables are consolidated into a rotating array. (`true/false/0-1`)

[Similar to Jscrambler's Variable Masking](https://docs.jscrambler.com/code-integrity/documentation/transformations/variable-masking)

- Potency Medium
- Resilience Medium
- Cost Low

```js
// Input
function add3(x, y, z){
  return x + y + z;
}

// Output
function iVQoGQD(...iVQoGQD){
  ~(iVQoGQD.length = 3, iVQoGQD[215] = iVQoGQD[2], iVQoGQD[75] = 227, iVQoGQD[iVQoGQD[75] - (iVQoGQD[75] - 75)] = iVQoGQD[75] - (iVQoGQD[75] - 239), iVQoGQD[iVQoGQD[iVQoGQD[75] - 164] - 127] = iVQoGQD[iVQoGQD[75] - 238], iVQoGQD[iVQoGQD[75] - 104] = iVQoGQD[75] - 482, iVQoGQD[iVQoGQD[135] + 378] = iVQoGQD[iVQoGQD[135] + 318] - 335, iVQoGQD[21] = iVQoGQD[iVQoGQD[135] + 96], iVQoGQD[iVQoGQD[iVQoGQD[75] - 104] - (iVQoGQD[75] - 502)] = iVQoGQD[iVQoGQD[75] - 164] - 440);
  return iVQoGQD[75] > iVQoGQD[75] + 90 ? iVQoGQD[iVQoGQD[135] - (iVQoGQD[135] + 54)] : iVQoGQD[iVQoGQD[135] + 117] + iVQoGQD[iVQoGQD[iVQoGQD[75] - (iVQoGQD[75] - (iVQoGQD[75] - 104))] - (iVQoGQD[135] - 112)] + iVQoGQD[215];
};
```

## High preset
```js
{
  target: "node",
  preset: "high",

  calculator: true,
  compact: true,
  hexadecimalNumbers: true,
  controlFlowFlattening: 0.75,
  deadCode: 0.2,
  dispatcher: true,
  duplicateLiteralsRemoval: 0.75,
  flatten: true,
  globalConcealing: true,
  identifierGenerator: "randomized",
  minify: true,
  movedDeclarations: true,
  objectExtraction: true,
  opaquePredicates: 0.75,
  renameVariables: true,
  renameGlobals: true,
  shuffle: { hash: 0.5, true: 0.5 },
  stack: true,
  stringConcealing: true,
  stringCompression: true,
  stringEncoding: true,
  stringSplitting: 0.75,

  // Use at own risk
  eval: false,
  rgf: false
}
```

## Medium preset
```js
{
  target: "node",
  preset: "medium",

  calculator: true,
  compact: true,
  hexadecimalNumbers: true,
  controlFlowFlattening: 0.5,
  deadCode: 0.025,
  dispatcher: 0.75,
  duplicateLiteralsRemoval: 0.5,
  globalConcealing: true,
  identifierGenerator: "randomized",
  minify: true,
  movedDeclarations: true,
  objectExtraction: true,
  opaquePredicates: 0.5,
  renameVariables: true,
  renameGlobals: true,
  shuffle: true,
  stack: 0.5,
  stringConcealing: true,
  stringSplitting: 0.25
}
```

## Low Preset

```js
{
  target: "node",
  preset: "low",

  calculator: true,
  compact: true,
  hexadecimalNumbers: true,
  controlFlowFlattening: 0.25,
  deadCode: 0.01,
  dispatcher: 0.5,
  duplicateLiteralsRemoval: true,
  identifierGenerator: "randomized",
  minify: true,
  movedDeclarations: true,
  objectExtraction: true,
  opaquePredicates: 0.1,
  renameVariables: true,
  renameGlobals: true,
  stringConcealing: true
}
```

## Locks

You must enable locks yourself, and configure them to your needs.

```js
{
  target: "node",
  lock: {
    integrity: true,
    domainLock: ["mywebsite.com"],
    osLock: ["windows", "linux"],
    browserLock: ["firefox"],
    startDate: new Date("Feb 1 2021"),
    endDate: new Date("Mar 1 2021"),
    antiDebug: true,
    nativeFunctions: true,

    // crashes browser
    countermeasures: true,

    // or custom callback (pre-obfuscated name)
    countermeasures: "onLockDetected"
  }
}
```

## Optional features

These features are experimental or a security concern.

```js
{
  target: "node",
  eval: true, // (security concern)
  rgf: true, // (security concern)

  // set to false for web-related scripts
  renameGlobals: false,

  // experimental
  identifierGenerator: function(){
    return "myvar_" + (counter++);
  }
}
```

## Percentages

Most settings allow percentages to control the frequency of the transformation. Fine-tune the percentages to keep file size down, and performance high.

```js
{
  target: "node",
  controlFlowFlattening: true, // equal to 1, which is 100% (slow)

  controlFlowFlattening: 0.5, // 50%
  controlFlowFlattening: 0.01 // 1%
}
```

## Probabilities

Mix modes using an object with key-value pairs to represent each mode's percentage.

```js
{
  target: "node",
  identifierGenerator: {
    "hexadecimal": 0.25, // 25% each
    "randomized": 0.25,
    "mangled": 0.25,
    "number": 0.25
  },

  shuffle: {hash: 0.5, true: 0.5} // 50% hash, 50% normal
}
```

## Custom Implementations

```js
{
  target: "node",
  
  // avoid renaming a certain variable
  renameVariables: name=>name!="jQuery",

  // custom variable names
  identifierGenerator: ()=>{
    return "_0x" + Math.random().toString(16).slice(2, 8);
  },

  // force encoding on a string
  stringConcealing: (str)=>{
    if (str=="https://mywebsite.com/my-secret-api"){
      return true;
    }

    // 60%
    return Math.random() < 0.6;
  },

  // set limits
  deadCode: ()=>{
    dead++; 

    return dead < 50;
  }
}
```

## Potential Issues

1. String Encoding can corrupt files. Disable `stringEncoding` if this happens.
2. Dead Code can bloat file size. Reduce or disable `deadCode`.
3. Rename Globals can break web-scripts.
   i. Disable `renameGlobals` or
   ii. Refactor your code
   ```js
   // Avoid doing this
   var myGlobalFunction = ()=>console.log("Called");

   // Do this instead
   window.myGlobalFunction = ()=>console.log("Called");
   ```

## File size and Performance

Obfuscation can bloat file size and negatively impact performance. Avoid using the following:

| Option | Description |
| --- | --- |
| `deadCode` | Bloats file size. Use low percentages. |
| `stringSplitting`, `stringEncoding` | Bloats file size. Avoid using these altogether. |
| `controlFlowFlattening` | Significant performance impact. Use very low percentage when source code is large. |
| `dispatcher` | Slow performance. Use low percentage. | 

## "The obfuscator broke my code!"

Try disabling features in the following order:
1. `flatten`
2. `stack`
3. `dispatcher`

If the error continues then [open an issue](https://github.com/MichaelXF/js-confuser/issues).

## Bug report

Please [open an issue](https://github.com/MichaelXF/js-confuser/issues) with the code and config used.

## Feature request

Please [open an issue](https://github.com/MichaelXF/js-confuser/issues) and be descriptive. Don't submit any PRs until approved.

## JsConfuser vs. Javascript-obfuscator

Javascript-obfuscator ([https://obfuscator.io](https://obfuscator.io)) is the popular choice for JS obfuscation. This means more attackers are aware of their strategies. JSConfuser provides unique features and is lesser-known.

Automated deobfuscators are aware of [https://obfuscator.io](https://obfuscator.io)'s techniques:

https://www.youtube.com/watch?v=_UIqhaYyCMI

However, the dev is [quick to fix these](https://github.com/LostMyCode/javascript-deobfuscator/issues/12). The one above no longer works.

Alternatively, you could go the paid-route with [Jscrambler.com (enterprise only)](https://jscrambler.com/) or [PreEmptive.com](https://www.preemptive.com/products/jsdefender/online-javascript-obfuscator-demo)

I've included several alternative obfuscators in the [`samples/`](https://github.com/MichaelXF/js-confuser/tree/master/samples) folder. They are all derived from the `input.js` file.

## Debugging

Enable logs to view the obfuscator's state.

```js
{
  target: "node",
  verbose: true
}
```

## About the internals

This obfuscator depends on two libraries to work: `acorn` and `escodegen`

- `acorn` is responsible for parsing source code into an AST.
- `escodegen` is responsible for generating source from modified AST.

The tree is modified by transformations, which each traverse the entire tree.
Properties starting with `$` are for saving information (typically circular data),
these properties are deleted before output.
