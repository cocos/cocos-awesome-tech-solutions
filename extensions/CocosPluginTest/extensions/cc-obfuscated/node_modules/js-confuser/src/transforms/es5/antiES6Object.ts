import Transform from "../transform";
import {
  Node,
  Literal,
  Identifier,
  CallExpression,
  ObjectExpression,
  ArrayExpression,
  Property,
  MemberExpression,
  SpreadElement,
} from "../../util/gen";
import { prepend } from "../../util/insert";
import { getBlock } from "../../traverse";
import Template from "../../templates/template";

var HelperFunctions = Template(
  `
  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  `
);

class AntiSpread extends Transform {
  helper: boolean;

  constructor(o) {
    super(o);

    this.helper = false;
  }

  match(object: Node, parents: Node[]) {
    return (
      object.type == "ObjectExpression" || object.type == "ArrayExpression"
    );
  }

  transform(object: Node, parents: Node[]) {
    return () => {
      if (object.type == "ArrayExpression") {
        var spreadIndex = object.elements.findIndex(
          (x) => x.type == "SpreadElement"
        );
        if (spreadIndex !== -1) {
          var after = object.elements.slice(spreadIndex);
          var groups = [];

          after.forEach((element) => {
            if (element.type === "SpreadElement") {
              groups.push(element.argument);
            } else {
              if (!groups.length) {
                groups.push(ArrayExpression([]));
              }
              if (groups[groups.length - 1].type != "ArrayExpression") {
                groups.push(ArrayExpression([]));
              }
              groups[groups.length - 1].elements.push(element);
            }
          });

          this.replace(
            object,
            CallExpression(
              MemberExpression(
                ArrayExpression(object.elements.slice(0, spreadIndex)),
                Identifier("concat"),
                false
              ),
              groups.map((group) => {
                // [].concat(arguments) -> [].concat(Array.prototype.slice.call(arguments))
                return CallExpression(
                  MemberExpression(
                    MemberExpression(
                      MemberExpression(
                        Identifier("Array"),
                        Identifier("prototype"),
                        false
                      ),
                      Identifier("slice"),
                      false
                    ),
                    Identifier("call"),
                    false
                  ),
                  [group]
                );
              })
            )
          );
        }
      } else if (object.type == "ObjectExpression") {
        var spreadIndex;
        while (true) {
          spreadIndex = object.properties.findIndex(
            (x) => x.type == "SpreadElement"
          );
          if (spreadIndex === -1) {
            break;
          }

          // add helper functions only once
          if (!this.helper) {
            this.helper = true;
            prepend(parents[parents.length - 1], ...HelperFunctions.compile());
          }

          var before = object.properties.slice(0, spreadIndex);
          var after = object.properties.slice(spreadIndex + 1);

          var call = CallExpression(Identifier("_objectSpread"), [
            ObjectExpression(before),
            object.properties[spreadIndex].argument,
          ]);

          if (after.length) {
            var newObject = ObjectExpression(after);
            this.replace(
              object,
              CallExpression(Identifier("_objectSpread"), [call, newObject])
            );

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

export default class AntiES6Object extends Transform {
  makerFn: string;

  constructor(o) {
    super(o);

    this.makerFn = null;

    this.after.push(new AntiSpread(o));
  }

  match(object: Node, parents: Node[]) {
    return object.type == "ObjectExpression";
  }

  transform(object: Node, parents: Node[]) {
    return () => {
      var block = getBlock(object, parents);
      var needsChanging = false;

      object.properties.forEach((property) => {
        if (property.type == "SpreadElement") {
          needsChanging = true;
          return;
        }

        // AntiShorthand
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

          prepend(
            parents[parents.length - 1] || block,
            Template(`
            function {name}(base, computedProps, getters, setters){

              for ( var i = 0; i < computedProps.length; i++ ) {
                base[computedProps[i][0]] = computedProps[i][1];
              }

              var keys=Object.create(null);
              Object.keys(getters).forEach(key=>(keys[key] = 1))
              Object.keys(setters).forEach(key=>(keys[key] = 1))

              Object.keys(keys).forEach(key=>{
                Object.defineProperty(base, key, {
                  set: setters[key],
                  get: getters[key],
                  configurable: true
                });
              })
              return base; 
            }
          `).single({ name: this.makerFn })
          );
        }

        // {a: 1} Es5 compliant properties
        var baseProps = [];
        // {[a]: 1} -> Computed props to array [a, 1]
        var computedProps = [];
        // {get a(){}} -> Property descriptors
        var getters = ObjectExpression([]);
        var setters = ObjectExpression([]);

        object.properties.forEach((prop) => {
          var key = prop.key;
          if (!key) {
            return;
          }

          if (key.type == "Identifier" && !prop.computed) {
            key = Literal(key.name);
          }

          if (prop.computed) {
            var array = [prop.key, prop.value];

            computedProps.push(ArrayExpression(array));
          } else if (prop.kind == "get" || prop.kind == "set") {
            if (prop.kind == "get") {
              getters.properties.push(Property(key, prop.value));
            } else {
              setters.properties.push(Property(key, prop.value));
            }
          } else {
            prop.method = false;

            baseProps.push(prop);
          }
        });

        if (
          setters.properties.length ||
          getters.properties.length ||
          computedProps.length
        ) {
          this.objectAssign(
            object,
            CallExpression(Identifier(this.makerFn), [
              ObjectExpression(baseProps),
              ArrayExpression(computedProps),
              getters,
              setters,
            ])
          );
        }
      }
    };
  }
}
