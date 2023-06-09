System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Vec2, Color, director, RPath, _dec, _class, _class2, _descriptor, _crd, ccclass, property, AnimateDashLine;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfRPath(extras) {
    _reporterNs.report("RPath", "../raphael/RPath", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Vec2 = _cc.Vec2;
      Color = _cc.Color;
      director = _cc.director;
    }, function (_unresolved_2) {
      RPath = _unresolved_2.RPath;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "50ae1kx5iBA0JMABF4k3nLu", "animate-dash-line", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Vec3', 'Vec2', 'Color', 'director']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("AnimateDashLine", AnimateDashLine = (_dec = ccclass('AnimateDashLine'), _dec(_class = (_class2 = class AnimateDashLine extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "duration", _descriptor, this);

          this.path = null;
          this.time = 0;
          this.pathLength = 0;
        }

        onLoad() {
          let path = this.addComponent(_crd && RPath === void 0 ? (_reportPossibleCrUseOfRPath({
            error: Error()
          }), RPath) : RPath);
          path.strokeColor = Color.WHITE;
          path.lineWidth = 4;
          path.fillColor = 'none';
          path.scale = new Vec2(4, -4);
          this.path = path;
          let pathStrings = path.getDemoData();
          let i = 0;
          let self = this;

          function animate() {
            let pathString = pathStrings[i];
            path.path(pathString);
            path.center(0, 0);
            i = ++i % pathStrings.length;
            self.time = 0;
            self.pathLength = path.getTotalLength();
            path.dashOffset = self.pathLength;
            path.dashArray = [self.pathLength];
          }

          animate();
          this.schedule(animate, this.duration * 1.5 * 1000);
        }

        update(dt) {
          this.time += dt;
          let percent = this.time / this.duration;

          if (percent > 1) {
            return;
          }

          this.path.dashOffset = this.pathLength * (1 - percent);
          this.path._dirty = true;
        }

        backToList() {
          director.loadScene('TestList');
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "duration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 2;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=9b929d8af64b45bacf19adbeb691e32d2a17851e.js.map