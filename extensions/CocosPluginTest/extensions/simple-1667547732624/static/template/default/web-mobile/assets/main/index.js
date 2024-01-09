System.register("chunks:///_virtual/foo.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  'use strict';

  var _inheritsLoose, cclegacy, _decorator, Component;

  return {
    setters: [function (module) {
      _inheritsLoose = module.inheritsLoose;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _class;

      cclegacy._RF.push({}, "bd24cN0slxJ8r1cvhz2AEMC", "foo", undefined);

      var ccclass = _decorator.ccclass,
          property = _decorator.property;
      var Foo = exports('Foo', (_dec = ccclass('Foo'), _dec(_class = /*#__PURE__*/function (_Component) {
        _inheritsLoose(Foo, _Component);

        function Foo() {
          return _Component.apply(this, arguments) || this;
        }

        var _proto = Foo.prototype;

        _proto.start = function start() {
          console.log('foo');
        };

        return Foo;
      }(Component)) || _class));

      cclegacy._RF.pop();
    }
  };
});

System.register("chunks:///_virtual/main", ['./NewComponent.ts', './foo.ts'], function () {
  'use strict';

  return {
    setters: [null, null],
    execute: function () {}
  };
});

System.register("chunks:///_virtual/NewComponent.ts", ['./rollupPluginModLoBabelHelpers.js', 'cc'], function (exports) {
  'use strict';

  var _applyDecoratedDescriptor, _inheritsLoose, _initializerDefineProperty, _assertThisInitialized, cclegacy, _decorator, Node, find, Vec3, Component;

  return {
    setters: [function (module) {
      _applyDecoratedDescriptor = module.applyDecoratedDescriptor;
      _inheritsLoose = module.inheritsLoose;
      _initializerDefineProperty = module.initializerDefineProperty;
      _assertThisInitialized = module.assertThisInitialized;
    }, function (module) {
      cclegacy = module.cclegacy;
      _decorator = module._decorator;
      Node = module.Node;
      find = module.find;
      Vec3 = module.Vec3;
      Component = module.Component;
    }],
    execute: function () {
      var _dec, _dec2, _class, _class2, _descriptor;

      cclegacy._RF.push({}, "95db4gngcdDkY8a23CzMQmJ", "NewComponent", undefined);

      var ccclass = _decorator.ccclass,
          property = _decorator.property;
      window.addEventListener("message", function (e) {
        if (e.data === "CocosTest") {
          NewComponent.prototype.test();
        } else {
          alert("No CocosTest, This is " + e.data);
        }
      });

      window.onhashchange = function (e) {
        NewComponent.prototype.test();
      };

      window.cocosTest = function () {
        NewComponent.prototype.test();
      };

      var NewComponent = exports('NewComponent', (_dec = ccclass('NewComponent'), _dec2 = property(Node), _dec(_class = (_class2 = /*#__PURE__*/function (_Component) {
        _inheritsLoose(NewComponent, _Component);

        function NewComponent() {
          var _this;

          for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          _this = _Component.call.apply(_Component, [this].concat(args)) || this;

          _initializerDefineProperty(_this, "testNode", _descriptor, _assertThisInitialized(_this));

          return _this;
        }

        var _proto = NewComponent.prototype;

        _proto.start = function start() {};

        _proto.update = function update(deltaTime) {};

        _proto.test = function test() {
          var testNode = find("soldier");
          testNode.setScale(new Vec3(testNode.scale.x - 0.1, testNode.scale.y - 0.1, testNode.scale.z - 0.1));
        };

        return NewComponent;
      }(Component), _descriptor = _applyDecoratedDescriptor(_class2.prototype, "testNode", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _class2)) || _class));

      cclegacy._RF.pop();
    }
  };
});

(function(r) {
  r('virtual:///prerequisite-imports/main', 'chunks:///_virtual/main'); 
})(function(mid, cid) {
    System.register(mid, [cid], function (_export, _context) {
    return {
        setters: [function(_m) {
            var _exportObj = {};

            for (var _key in _m) {
              if (_key !== "default" && _key !== "__esModule") _exportObj[_key] = _m[_key];
            }
      
            _export(_exportObj);
        }],
        execute: function () { }
    };
    });
});