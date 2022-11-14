'use strict';

var builders = require('ast-types').builders;
var replace = require('estraverse').replace;

var arrayExpression = builders.arrayExpression;
var blockStatement = builders.blockStatement;
var callExpression = builders.callExpression;
var expressionStatement = builders.expressionStatement;
var identifier = builders.identifier;
var functionExpression = builders.functionExpression;
var literal = builders.literal;
var memberExpression = builders.memberExpression;
var variableDeclaration = builders.variableDeclaration;
var variableDeclarator = builders.variableDeclarator;

function isFunction(node) {
  return node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression';
}

function isStringLiteral(node) {
  return node.type === 'Literal' && typeof node.value === 'string';
}

function isPropertyAccess(node) {
  return node.type === 'MemberExpression' && !node.computed;
}

function isPropertyKey(node, parent) {
  return parent.type === 'Property' && parent.key === node;
}

function isStrictStatement(statement) {
  return statement.type === 'ExpressionStatement' &&
         statement.expression.type === 'Literal' &&
         statement.expression.value === 'use strict';
}

exports.transformAst = function(ast, createVariableName) {
  var usedVariables = {};
  var exposesVariables = false;
  var strings = [];
  var stringIndexes = Object.create(null);
  var stringMapIdentifier = identifier('');

  function addString(string) {
    if (!(string in stringIndexes)) {
      stringIndexes[string] = strings.push(string) - 1;
    }
    return stringIndexes[string];
  }

  replace(ast, {
    enter: function(node, parent) {
      var index;
      if (node.type === 'VariableDeclaration' || node.type === 'FunctionDeclaration') {
        if (!exposesVariables) {
          exposesVariables = !this.parents().some(isFunction);
        }
      } else if (node.type === 'Identifier') {
        usedVariables[node.name] = true;
      } else if (isStringLiteral(node) && !isPropertyKey(node, parent) && node.value !== 'use strict') {
        index = addString(node.value);
        return memberExpression(stringMapIdentifier, literal(index), true);
      } else if (isPropertyAccess(node)) {
        index = addString(node.property.name);
        return memberExpression(node.object,
          memberExpression(stringMapIdentifier, literal(index), true), true);
      }
    }
  });

  stringMapIdentifier.name = createVariableName(Object.keys(usedVariables));
  var insertMap = exposesVariables ? prependMap : wrapWithIife;
  ast.body = insertMap(ast.body, stringMapIdentifier, arrayExpression(strings.map(literal)));

  return ast;
};

function wrapWithIife(body, stringMapName, stringMap) {
  var wrapperFunctionBody = blockStatement(body);
  var wrapperFunction = functionExpression(null, [stringMapName], wrapperFunctionBody);
  var iife = expressionStatement(
    callExpression(
      memberExpression(wrapperFunction, identifier('call'), false),
      [identifier('this'), stringMap]));
  return [iife];
}

function prependMap(body, stringMapName, stringMap) {
  var insertIndex = isStrictStatement(body[0]) ? 1 : 0;
  body.splice(insertIndex, 0,
    variableDeclaration('var', [
      variableDeclarator(stringMapName, stringMap)
    ])
  );
  return body;
}

exports.createVariableName = function(variableNames) {
  var name = '_x';
  do {
    name += (Math.random() * 0xffff) | 0;
  } while (variableNames.indexOf(name) !== -1);
  return name;
};
