System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _decorator, Component, Label, ProgressBar, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _temp, _crd, ccclass, property, EnergyCounter;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Label = _cc.Label;
      ProgressBar = _cc.ProgressBar;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "70152iIQt1AkKnsFXGgadR8", "EnergyCounter", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("EnergyCounter", EnergyCounter = (_dec = ccclass('EnergyCounter'), _dec2 = property(Label), _dec3 = property(Label), _dec4 = property(ProgressBar), _dec(_class = (_class2 = (_temp = class EnergyCounter extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "timeToRecover", _descriptor, this);

          _initializerDefineProperty(this, "totalCount", _descriptor2, this);

          _initializerDefineProperty(this, "currentCount", _descriptor3, this);

          _initializerDefineProperty(this, "labelTimer", _descriptor4, this);

          _initializerDefineProperty(this, "labelCount", _descriptor5, this);

          _initializerDefineProperty(this, "progressBar", _descriptor6, this);
        }

        onLoad() {//this.timer = 0;
        }

        update(dt) {//let ratio = this.timer/this.timeToRecover;
          //this.progressBar.progress = ratio;
          //if (this.currentCount > this.totalCount) this.currentCount = this.totalCount;
          //let timeLeft = Math.floor(this.timeToRecover - this.timer);
          //this.labelCount.string = this.currentCount + '/' + this.totalCount;
          //this.labelTimer.string = Math.floor(timeLeft/60).toString() + ':' + (timeLeft%60 < 10 ? '0' : '') + timeLeft%60;
          //this.timer += dt;
          //if (this.timer >= this.timeToRecover) {
          //    this.timer = 0;
          //    this.currentCount++;
          //}
        }

      }, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "timeToRecover", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "totalCount", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "currentCount", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "labelTimer", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'null';
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "labelCount", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'null';
        }
      }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "progressBar", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'null';
        }
      })), _class2)) || _class));
      /**
       * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
       */
      // cc.Class({
      //     extends: cc.Component,
      // 
      //     properties: {
      //         timeToRecover: 0,
      //         totalCount: 0,
      //         currentCount: 0,
      //         labelTimer: {
      //             default: null,
      //             type: cc.Label
      //         },
      //         labelCount: {
      //             default: null,
      //             type: cc.Label
      //         },
      //         progressBar: {
      //             default: null,
      //             type: cc.ProgressBar
      //         }
      //     },
      // 
      //     // use this for initialization
      //     onLoad: function () {
      //         this.timer = 0;
      //     },
      // 
      //     // called every frame, uncomment this function to activate update callback
      //     update: function (dt) {
      //         let ratio = this.timer/this.timeToRecover;
      //         this.progressBar.progress = ratio;
      //         if (this.currentCount > this.totalCount) this.currentCount = this.totalCount;
      //         let timeLeft = Math.floor(this.timeToRecover - this.timer);
      //         this.labelCount.string = this.currentCount + '/' + this.totalCount;
      //         this.labelTimer.string = Math.floor(timeLeft/60).toString() + ':' + (timeLeft%60 < 10 ? '0' : '') + timeLeft%60;
      //         this.timer += dt;
      //         if (this.timer >= this.timeToRecover) {
      //             this.timer = 0;
      //             this.currentCount++;
      //         }
      //     },
      // });


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=EnergyCounter.js.map