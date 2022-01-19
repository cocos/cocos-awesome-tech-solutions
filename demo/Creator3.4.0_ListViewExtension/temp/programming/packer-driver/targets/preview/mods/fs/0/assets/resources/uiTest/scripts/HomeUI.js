System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, Component, Animation, Node, Enum, BackPackUI, _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _temp, _crd, ccclass, property, PanelType, HomeUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfBackPackUI(extras) {
    _reporterNs.report("BackPackUI", "./BackPackUI", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Animation = _cc.Animation;
      Node = _cc.Node;
      Enum = _cc.Enum;
    }, function (_unresolved_2) {
      BackPackUI = _unresolved_2.BackPackUI;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "80382PDGl1Jf4nvzaq1gyOV", "HomeUI", undefined);

      ({
        ccclass,
        property
      } = _decorator);
      PanelType = Enum({
        Home: -1,
        Shop: -1
      });

      _export("HomeUI", HomeUI = (_dec = ccclass('HomeUI'), _dec2 = property(Animation), _dec3 = property([Node]), _dec4 = property(_crd && BackPackUI === void 0 ? (_reportPossibleCrUseOfBackPackUI({
        error: Error()
      }), BackPackUI) : BackPackUI), _dec(_class = (_class2 = (_temp = class HomeUI extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "menuAnim", _descriptor, this);

          _initializerDefineProperty(this, "homeBtnGroups", _descriptor2, this);

          _initializerDefineProperty(this, "backPackUI", _descriptor3, this);

          _initializerDefineProperty(this, "shopUI", _descriptor4, this);
        }

        onLoad() {//this.curPanel = PanelType.Home;
          //this.menuAnim.play('menu_reset');
        }

        start() {//this.backPackUI.init(this);
          //this.shopUI.init(this, PanelType.Shop);
          //this.scheduleOnce ( function() {
          //    this.menuAnim.play('menu_intro');
          //    this.showAllUI();
          //}.bind(this), 0.5);
        }

        showAllUI() {//this.gotoShop();
          //this.homeBtnGroups[0].getChildByName("sub_btns").getComponent("SubBtnsUI").showSubBtns();
          //this.node.parent.getChildByName("chargePanel").getComponent("ChargeUI").show();
          //this.node.parent.getChildByName("backPack").getComponent("BackPackUI").show();
        }

        toggleHomeBtns(enable) {//for (let i = 0; i < this.homeBtnGroups.length; ++i) {
          //    let group = this.homeBtnGroups[i];
          //    if (!enable) {
          //        group.pauseSystemEvents(true);
          //    } else {
          //        group.resumeSystemEvents(true);
          //    }
          //}
        }

        gotoShop() {//if (this.curPanel !== PanelType.Shop) {
          //    this.shopUI.show();
          //}
        }

        gotoHome() {//if (this.curPanel === PanelType.Shop) {
          //    this.shopUI.hide();
          //    this.curPanel = PanelType.Home;
          //}
        }

      }, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "menuAnim", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'null';
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "homeBtnGroups", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return [];
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "backPackUI", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'null';
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "shopUI", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return 'ShopUI';
        }
      })), _class2)) || _class));
      /**
       * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
       */
      // const BackPackUI = require('BackPackUI');
      // const ShopUI = require('ShopUI');
      // 
      // const PanelType = cc.Enum({
      //     Home: -1,
      //     Shop: -1,
      // });
      // 
      // cc.Class({
      //     extends: cc.Component,
      // 
      //     properties: {
      //         menuAnim: {
      //             default: null,
      //             type: cc.Animation
      //         },
      //         homeBtnGroups: {
      //             default: [],
      //             type: cc.Node
      //         },
      //         backPackUI: {
      //             default: null,
      //             type: BackPackUI
      //         },
      //         shopUI: ShopUI
      //     },
      // 
      //     // use this for initialization
      //     onLoad: function () {
      //         this.curPanel = PanelType.Home;
      //         this.menuAnim.play('menu_reset');
      //     },
      // 
      //     start: function () {
      //         this.backPackUI.init(this);
      //         this.shopUI.init(this, PanelType.Shop);
      //         this.scheduleOnce ( function() {
      //             this.menuAnim.play('menu_intro');
      //             this.showAllUI();
      //         }.bind(this), 0.5);
      //     },
      // 
      //     showAllUI: function () {
      //         this.gotoShop();
      //         this.homeBtnGroups[0].getChildByName("sub_btns").getComponent("SubBtnsUI").showSubBtns();
      //         this.node.parent.getChildByName("chargePanel").getComponent("ChargeUI").show();
      //         this.node.parent.getChildByName("backPack").getComponent("BackPackUI").show();
      // 
      //     },
      // 
      //     toggleHomeBtns: function (enable) {
      //         for (let i = 0; i < this.homeBtnGroups.length; ++i) {
      //             let group = this.homeBtnGroups[i];
      //             if (!enable) {
      //                 group.pauseSystemEvents(true);
      //             } else {
      //                 group.resumeSystemEvents(true);
      //             }
      //         }
      //     },
      // 
      //     gotoShop: function () {
      //         if (this.curPanel !== PanelType.Shop) {
      //             this.shopUI.show();
      //         }
      //     },
      // 
      //     gotoHome: function () {
      //         if (this.curPanel === PanelType.Shop) {
      //             this.shopUI.hide();
      //             this.curPanel = PanelType.Home;
      //         }
      //     },
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
//# sourceMappingURL=HomeUI.js.map