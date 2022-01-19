System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _decorator, Component, Animation, Sprite, Node, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _temp, _crd, ccclass, property, ShopUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Animation = _cc.Animation;
      Sprite = _cc.Sprite;
      Node = _cc.Node;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "b06f068UltB3KPTKgJesZOm", "ShopUI", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("ShopUI", ShopUI = (_dec = ccclass('ShopUI'), _dec2 = property(Animation), _dec3 = property(Sprite), _dec4 = property(Node), _dec(_class = (_class2 = (_temp = class ShopUI extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "anim", _descriptor, this);

          _initializerDefineProperty(this, "figure", _descriptor2, this);

          _initializerDefineProperty(this, "btnsNode", _descriptor3, this);

          _initializerDefineProperty(this, "chargeUI", _descriptor4, this);
        }

        init(home, panelType) {//this.home = home;
          //this.node.active = false;
          //this.anim.play('shop_reset');
          //this.panelType = panelType;
          //this.figure.node.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(1, 1, 0.96), cc.scaleTo(1, 1, 1))));
          //this.chargeUI.init(home, this.btnsNode);
        }

        show() {//this.node.active = true;
          //this.anim.play('shop_intro');
        }

        hide() {//this.anim.play('shop_outro');
        }

        onFinishShow() {//this.home.curPanel = this.panelType;
        }

        onFinishHide() {//this.node.active = false;
        }

      }, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "anim", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "figure", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "btnsNode", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "chargeUI", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'ChargeUI';
        }
      })), _class2)) || _class));
      /**
       * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
       */
      // const ChargeUI = require('ChargeUI');
      // 
      // cc.Class({
      //     extends: cc.Component,
      // 
      //     properties: {
      //         anim: cc.Animation,
      //         figure: cc.Sprite,
      //         btnsNode: cc.Node,
      //         chargeUI: ChargeUI
      //     },
      // 
      //     // use this for initialization
      //     init: function (home, panelType) {
      //         this.home = home;
      //         this.node.active = false;
      //         this.anim.play('shop_reset');
      //         this.panelType = panelType;
      //         this.figure.node.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(1, 1, 0.96), cc.scaleTo(1, 1, 1))));
      //         this.chargeUI.init(home, this.btnsNode);
      //     },
      // 
      //     show: function () {
      //         this.node.active = true;
      //         this.anim.play('shop_intro');
      //     },
      // 
      //     hide: function () {
      //         this.anim.play('shop_outro');
      //     },
      // 
      //     onFinishShow: function () {
      //         this.home.curPanel = this.panelType;
      //     },
      // 
      //     onFinishHide: function () {
      //         this.node.active = false;
      //     }
      // 
      //     // called every frame, uncomment this function to activate update callback
      //     // update: function (dt) {
      // 
      //     // },
      // });


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=ShopUI.js.map