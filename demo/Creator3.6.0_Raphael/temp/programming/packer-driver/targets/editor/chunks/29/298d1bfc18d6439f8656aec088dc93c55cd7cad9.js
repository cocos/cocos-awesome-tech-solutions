System.register(["__unresolved_0", "cc", "__unresolved_1", "__unresolved_2"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, director, RGroup, Jelly, _dec, _class, _class2, _descriptor, _descriptor2, _descriptor3, _crd, ccclass, property, Nardove;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfRGroup(extras) {
    _reporterNs.report("RGroup", "../../raphael/RGroup", _context.meta, extras);
  }

  function _reportPossibleCrUseOfJelly(extras) {
    _reporterNs.report("Jelly", "./jelly", _context.meta, extras);
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
      director = _cc.director;
    }, function (_unresolved_2) {
      RGroup = _unresolved_2.RGroup;
    }, function (_unresolved_3) {
      Jelly = _unresolved_3.Jelly;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "85d55J9j8lKe5TeLh4YqRwK", "nardove", undefined);

      __checkObsolete__(['_decorator', 'Component', 'director']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("Nardove", Nardove = (_dec = ccclass('Nardove'), _dec(_class = (_class2 = class Nardove extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "addJellyTimer", _descriptor, this);

          _initializerDefineProperty(this, "jellyCounter", _descriptor2, this);

          _initializerDefineProperty(this, "numJellies", _descriptor3, this);

          this.jellies = [];
          this.time = 0;
          this.count = 0;
          this.group = null;
        }

        onLoad() {
          this.time = this.addJellyTimer;
          this.group = this.addComponent(_crd && RGroup === void 0 ? (_reportPossibleCrUseOfRGroup({
            error: Error()
          }), RGroup) : RGroup);
        }

        update(dt) {
          this.time += dt;
          this.count++;

          if (this.time >= this.addJellyTimer && this.jellyCounter < this.numJellies) {
            let jelly = new (_crd && Jelly === void 0 ? (_reportPossibleCrUseOfJelly({
              error: Error()
            }), Jelly) : Jelly)();
            jelly.init(this.group, this.jellyCounter);
            this.jellies.push(jelly);
            this.jellyCounter++;
            this.time = 0;
          }

          for (let i = 0, ii = this.jellies.length; i < ii; i++) {
            let jelly = this.jellies[i];
            jelly.update(this.time, this.count);
          }
        }

        backToList() {
          director.loadScene('TestList');
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "addJellyTimer", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 5;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "jellyCounter", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "numJellies", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 7;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=298d1bfc18d6439f8656aec088dc93c55cd7cad9.js.map