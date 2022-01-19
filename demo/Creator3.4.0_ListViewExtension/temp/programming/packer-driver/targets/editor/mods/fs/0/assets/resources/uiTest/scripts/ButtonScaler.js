System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _decorator, Component, _dec, _class, _class2, _descriptor, _descriptor2, _temp, _crd, ccclass, property, ButtonScaler;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "f5d10E3oQ9G/LlvNZly0S2Y", "ButtonScaler", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("ButtonScaler", ButtonScaler = (_dec = ccclass('ButtonScaler'), _dec(_class = (_class2 = (_temp = class ButtonScaler extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "pressedScale", _descriptor, this);

          _initializerDefineProperty(this, "transDuration", _descriptor2, this);
        }

        onLoad() {//var self = this;
          //self.initScale = this.node.scale;
          //self.button = self.getComponent(cc.Button);
          //self.scaleDownAction = cc.scaleTo(self.transDuration, self.pressedScale);
          //self.scaleUpAction = cc.scaleTo(self.transDuration, self.initScale);
          //function onTouchDown (event) {
          //    this.stopAllActions();
          //    this.runAction(self.scaleDownAction);
          //}
          //function onTouchUp (event) {
          //    this.stopAllActions();
          //    this.runAction(self.scaleUpAction);
          //}
          //this.node.on('touchstart', onTouchDown, this.node);
          //this.node.on('touchend', onTouchUp, this.node);
          //this.node.on('touchcancel', onTouchUp, this.node);
        }

      }, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "pressedScale", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 1;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "transDuration", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      })), _class2)) || _class));
      /**
       * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
       */
      // cc.Class({
      //     extends: cc.Component,
      // 
      //     properties: {
      //         pressedScale: 1,
      //         transDuration: 0
      //     },
      // 
      //     // use this for initialization
      //     onLoad: function () {
      //         var self = this;
      //         self.initScale = this.node.scale;
      //         self.button = self.getComponent(cc.Button);
      //         self.scaleDownAction = cc.scaleTo(self.transDuration, self.pressedScale);
      //         self.scaleUpAction = cc.scaleTo(self.transDuration, self.initScale);
      //         function onTouchDown (event) {
      //             this.stopAllActions();
      //             this.runAction(self.scaleDownAction);
      //         }
      //         function onTouchUp (event) {
      //             this.stopAllActions();
      //             this.runAction(self.scaleUpAction);
      //         }
      //         this.node.on('touchstart', onTouchDown, this.node);
      //         this.node.on('touchend', onTouchUp, this.node);
      //         this.node.on('touchcancel', onTouchUp, this.node);
      //     }
      // });


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=ButtonScaler.js.map