System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _decorator, Component, Animation, Button, Node, _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _temp, _crd, ccclass, property, SubBtnsUI;

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
      Button = _cc.Button;
      Node = _cc.Node;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "6907fq75H1EIrLmj/AFBg+B", "SubBtnsUI", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("SubBtnsUI", SubBtnsUI = (_dec = ccclass('SubBtnsUI'), _dec2 = property(Animation), _dec3 = property(Button), _dec4 = property(Button), _dec5 = property(Node), _dec(_class = (_class2 = (_temp = class SubBtnsUI extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "subBtnsAnim", _descriptor, this);

          _initializerDefineProperty(this, "btnShowSub", _descriptor2, this);

          _initializerDefineProperty(this, "btnHideSub", _descriptor3, this);

          _initializerDefineProperty(this, "btnContainer", _descriptor4, this);
        }

        onLoad() {//this.btnShowSub.node.active = true;
          //this.btnHideSub.node.active = false;
        }

        showSubBtns() {//this.btnContainer.active = true;
          //this.subBtnsAnim.play('sub_pop');
        }

        hideSubBtns() {//this.subBtnsAnim.play('sub_fold');
        }

        onFinishAnim(finishFold) {//this.btnShowSub.node.active = finishFold;
          //this.btnHideSub.node.active = !finishFold;
        }

      }, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "subBtnsAnim", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "btnShowSub", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "btnHideSub", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "btnContainer", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));
      /**
       * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
       */
      // cc.Class({
      //     extends: cc.Component,
      // 
      //     properties: {
      //         subBtnsAnim: cc.Animation,
      //         btnShowSub: cc.Button,
      //         btnHideSub: cc.Button,
      //         btnContainer: cc.Node
      //     },
      // 
      //     // use this for initialization
      //     onLoad: function () {
      //         this.btnShowSub.node.active = true;
      //         this.btnHideSub.node.active = false;
      //     },
      // 
      //     showSubBtns: function () {
      //         this.btnContainer.active = true;
      //         this.subBtnsAnim.play('sub_pop');
      //     },
      // 
      //     hideSubBtns: function () {
      //         this.subBtnsAnim.play('sub_fold');
      //     },
      // 
      //     onFinishAnim: function (finishFold) {
      //         this.btnShowSub.node.active = finishFold;
      //         this.btnHideSub.node.active = !finishFold;
      //     },
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
//# sourceMappingURL=SubBtnsUI.js.map