{transformAst, createVariableName} = require './index'
{parse, print} = require 'recast'
{spy} = require 'sinon'
assert = require 'assert'

toAst = (source) -> parse(source).program
toSource = (ast) -> print(ast).code

describe 'AST transformation:', ->
  # Needs to be on the test object, since mocha-given tries to eval().call(this)
  # when tests fail. `toSource` is not in scope in these cases
  Given -> @toSource = toSource

  Given -> @varName = 'arbitrary'
  Given -> @createName = => @varName

  describe 'passes an array of all encountered variable names to the `createName` callback:', ->
    Given -> @ast = toAst('''
        var variable = 1;
        function aFunction(foo, bar) {
          var baz = 1, anotherFunction = function captureThis() {
            var andCaptureThis;
          };
          function innerFunction(a, b) {}
          return innerFunction(baz, anotherFunction);
        }
        var anotherVariable = aFunction(variable, function(error, data) {
          if (error) {
            var invalidData = data;
          }
        });

        var bar = window;''')
    Given -> @createName = spy(-> 'arbitrary')
    When  -> transformAst(@ast, @createName)
    Then  -> assert.deepEqual @createName.firstCall.args[0].sort(), [
      'a', 'aFunction', 'andCaptureThis', 'anotherFunction', 'anotherVariable',
      'b', 'bar', 'baz', 'captureThis', 'data', 'error', 'foo', 'innerFunction',
      'invalidData', 'variable', 'window',
    ]

  describe 'placement of the string array:', ->

    describe 'wraps code in an IIFE, using the map variable name provided by `createName` and the array as parameter and arguments:', ->
      Given -> @source = '1 + 1'
      Given -> @expected = """
        (function(#{@varName}) {
          #{@source};
        }).call(this, [])
        """
      When  -> @obfuscated = transformAst(toAst(@source), @createName)
      Then  -> @toSource(@obfuscated) == @expected

    describe 'Places the string map at the begin (no IIFE) if any variable declarations exist at the top level:', ->
      Given -> @source = 'while (true) { var foo = 1; }';
      Given -> @expected = "var #{@varName} = [];\n#{@source}"
      When  -> @obfuscated = transformAst(toAst(@source), @createName)
      Then  -> @toSource(@obfuscated) == @expected

    describe 'Places the string map at the begin (no IIFE) if any function declarations exist at the top level:', ->
      Given -> @source = 'function one() { return 1; }';
      Given -> @expected = "var #{@varName} = [];\n#{@source}"
      When  -> @obfuscated = transformAst(toAst(@source), @createName)
      Then  -> @toSource(@obfuscated) == @expected

  describe 'replacement of strings:', ->
    Given -> @source = '''call(['a string', true, false, null, 1.2, -3, 'another string']);'''
    Given -> @expected = """
      (function(#{@varName}) {
        call([#{@varName}[0], true, false, null, 1.2, -3, #{@varName}[1]]);
      }).call(this, ["a string", "another string"]);
      """
    When  -> @obfuscated = transformAst(toAst(@source), @createName)
    Then  -> @toSource(@obfuscated) == @expected

  describe 'replacement of property accesses:', ->
    Given -> @source = 'object.method(some.value, another.property);';
    Given -> @expected = """
      (function(#{@varName}) {
        object[#{@varName}[0]](some[#{@varName}[1]], another[#{@varName}[2]]);
      }).call(this, ["method", "value", "property"]);
      """
    When  -> @obfuscated = transformAst(toAst(@source), @createName)
    Then  -> @toSource(@obfuscated) == @expected

  describe 'leaves string properties in object literals intact:', ->
    Given -> @source = 'call({"a string": 123});';
    Given -> @expected = """
      (function(#{@varName}) {
        #{@source}
      }).call(this, []);
      """
    When  -> @obfuscated = transformAst(toAst(@source), @createName)
    Then  -> @toSource(@obfuscated) == @expected

  describe 'deduplication of encountered strings:', ->
    Given -> @source = 'object.arbitrary = "arbitrary" + util.arbitrary("arbitrary")';
    Given -> @expected = """
      (function(#{@varName}) {
        object[#{@varName}[0]] = #{@varName}[0] + util[#{@varName}[0]](#{@varName}[0]);
      }).call(this, ["arbitrary"])
      """
    When  -> @obfuscated = transformAst(toAst(@source), @createName)
    Then  -> @toSource(@obfuscated) == @expected

  describe 'leaves "use strict" string literals intact:', ->
    Given -> @source =  '"use strict";\n  call({"a string": 123});'
    Given -> @expected = """
      (function(#{@varName}) {
        #{@source}
      }).call(this, []);
      """
    When  -> @obfuscated = transformAst(toAst(@source), @createName)
    Then  -> @toSource(@obfuscated) == @expected

  describe 'does not place the string map before a leading "use strict":', ->
    Given -> @source = '"use strict"; var a;'
    Given -> @expected = """
      "use strict";
      var #{@varName} = [];
      var a;
      """
    When  -> @obfuscated = transformAst(toAst(@source), @createName)
    Then  -> @toSource(@obfuscated) == @expected

describe 'variable name creator:', ->
  describe 'it creates a variable name that maches /^_x\\d+$/:', ->
    Given -> @varNames = [];
    When  -> @created = createVariableName(@varNames)
    Then  -> /_x\d+$/.test(@created)

  describe 'it does not return a passed-in variable name:', ->
    Given -> @varNames = ["_x#{i}" for i in [0..0xffff]]
    When  -> @created = createVariableName(@varNames)
    Then  -> @varNames.indexOf(@created) == -1
