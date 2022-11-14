"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _transform = _interopRequireDefault(require("../transform"));

var _gen = require("../../util/gen");

var _insert = require("../../util/insert");

var _traverse = require("../../traverse");

var _template = _interopRequireDefault(require("../../templates/template"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var HelperFunctions = (0, _template.default)("\n  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }\n\nfunction _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }\n\nfunction _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }\n  ");

class AntiSpread extends _transform.default {
  constructor(o) {
    super(o);

    _defineProperty(this, "helper", void 0);

    this.helper = false;
  }

  match(object, parents) {
    return object.type == "ObjectExpression" || object.type == "ArrayExpression";
  }

  transform(object, parents) {
    return () => {
      if (object.type == "ArrayExpression") {
        var spreadIndex = object.elements.findIndex(x => x.type == "SpreadElement");

        if (spreadIndex !== -1) {
          var after = object.elements.slice(spreadIndex);
          var groups = [];
          after.forEach(element => {
            if (element.type === "SpreadElement") {
              groups.push(element.argument);
            } else {
              if (!groups.length) {
                groups.push((0, _gen.ArrayExpression)([]));
              }

              if (groups[groups.length - 1].type != "ArrayExpression") {
                groups.push((0, _gen.ArrayExpression)([]));
              }

              groups[groups.length - 1].elements.push(element);
            }
          });
          this.replace(object, (0, _gen.CallExpression)((0, _gen.MemberExpression)((0, _gen.ArrayExpression)(object.elements.slice(0, spreadIndex)), (0, _gen.Identifier)("concat"), false), groups.map(group => {
            // [].concat(arguments) -> [].concat(Array.prototype.slice.call(arguments))
            return (0, _gen.CallExpression)((0, _gen.MemberExpression)((0, _gen.MemberExpression)((0, _gen.MemberExpression)((0, _gen.Identifier)("Array"), (0, _gen.Identifier)("prototype"), false), (0, _gen.Identifier)("slice"), false), (0, _gen.Identifier)("call"), false), [group]);
          })));
        }
      } else if (object.type == "ObjectExpression") {
        var spreadIndex;

        while (true) {
          spreadIndex = object.properties.findIndex(x => x.type == "SpreadElement");

          if (spreadIndex === -1) {
            break;
          } // add helper functions only once


          if (!this.helper) {
            this.helper = true;
            (0, _insert.prepend)(parents[parents.length - 1], ...HelperFunctions.compile());
          }

          var before = object.properties.slice(0, spreadIndex);
          var after = object.properties.slice(spreadIndex + 1);
          var call = (0, _gen.CallExpression)((0, _gen.Identifier)("_objectSpread"), [(0, _gen.ObjectExpression)(before), object.properties[spreadIndex].argument]);

          if (after.length) {
            var newObject = (0, _gen.ObjectExpression)(after);
            this.replace(object, (0, _gen.CallExpression)((0, _gen.Identifier)("_objectSpread"), [call, newObject]));
            object = newObject;
          } else {
            this.replace(object, call);
            break;
          }
        }
      }
    };
  }

}

class AntiES6Object extends _transform.default {
  constructor(o) {
    super(o);

    _defineProperty(this, "makerFn", void 0);

    this.makerFn = null;
    this.after.push(new AntiSpread(o));
  }

  match(object, parents) {
    return object.type == "ObjectExpression";
  }

  transform(object, parents) {
    return () => {
      var block = (0, _traverse.getBlock)(object, parents);
      var needsChanging = false;
      object.properties.forEach(property => {
        if (property.type == "SpreadElement") {
          needsChanging = true;
          return;
        } // AntiShorthand


        object.shorthand = false;

        if (!property.key) {
          this.error(new Error("Property missing key"));
        }

        if (!["Literal", "Identifier"].includes(property.key.type)) {
          property.computed = true;
        }

        if (property.computed && property.key.type == "Literal") {
          property.computed = false;
        }

        if (property.kind != "init" || property.method || property.computed) {
          needsChanging = true;
        }
      });

      if (needsChanging) {
        if (!this.makerFn) {
          this.makerFn = this.getPlaceholder();
          (0, _insert.prepend)(parents[parents.length - 1] || block, (0, _template.default)("\n            function {name}(base, computedProps, getters, setters){\n\n              for ( var i = 0; i < computedProps.length; i++ ) {\n                base[computedProps[i][0]] = computedProps[i][1];\n              }\n\n              var keys=Object.create(null);\n              Object.keys(getters).forEach(key=>(keys[key] = 1))\n              Object.keys(setters).forEach(key=>(keys[key] = 1))\n\n              Object.keys(keys).forEach(key=>{\n                Object.defineProperty(base, key, {\n                  set: setters[key],\n                  get: getters[key],\n                  configurable: true\n                });\n              })\n              return base; \n            }\n          ").single({
            name: this.makerFn
          }));
        } // {a: 1} Es5 compliant properties


        var baseProps = []; // {[a]: 1} -> Computed props to array [a, 1]

        var computedProps = []; // {get a(){}} -> Property descriptors

        var getters = (0, _gen.ObjectExpression)([]);
        var setters = (0, _gen.ObjectExpression)([]);
        object.properties.forEach(prop => {
          var key = prop.key;

          if (!key) {
            return;
          }

          if (key.type == "Identifier" && !prop.computed) {
            key = (0, _gen.Literal)(key.name);
          }

          if (prop.computed) {
            var array = [prop.key, prop.value];
            computedProps.push((0, _gen.ArrayExpression)(array));
          } else if (prop.kind == "get" || prop.kind == "set") {
            if (prop.kind == "get") {
              getters.properties.push((0, _gen.Property)(key, prop.value));
            } else {
              setters.properties.push((0, _gen.Property)(key, prop.value));
            }
          } else {
            prop.method = false;
            baseProps.push(prop);
          }
        });

        if (setters.properties.length || getters.properties.length || computedProps.length) {
          this.objectAssign(object, (0, _gen.CallExpression)((0, _gen.Identifier)(this.makerFn), [(0, _gen.ObjectExpression)(baseProps), (0, _gen.ArrayExpression)(computedProps), getters, setters]));
        }
      }
    };
  }

}

exports.default = AntiES6Object;