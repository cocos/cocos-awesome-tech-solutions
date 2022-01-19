System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _decorator, Component, Prefab, ScrollView, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _descriptor3, _temp, _crd, ccclass, property, BackPackUI;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Prefab = _cc.Prefab;
      ScrollView = _cc.ScrollView;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "96a192UeP9FDZ6jqVOqcUAs", "BackPackUI", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("BackPackUI", BackPackUI = (_dec = ccclass('BackPackUI'), _dec2 = property(Prefab), _dec3 = property(ScrollView), _dec(_class = (_class2 = (_temp = class BackPackUI extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "slotPrefab", _descriptor, this);

          _initializerDefineProperty(this, "scrollView", _descriptor2, this);

          _initializerDefineProperty(this, "totalCount", _descriptor3, this);
        }

        init(home) {//this.heroSlots = [];
          //this.home = home;
          //for (let i = 0; i < this.totalCount; ++i) {
          //    let heroSlot = this.addHeroSlot();
          //    this.heroSlots.push(heroSlot);
          //}
        }

        addHeroSlot() {//let heroSlot = cc.instantiate(this.slotPrefab);
          //this.scrollView.content.addChild(heroSlot);
          //return heroSlot;
        }

        show() {//this.node.active = true;
          //this.node.emit('fade-in');
          //this.home.toggleHomeBtns(false);
        }

        hide() {//this.node.emit('fade-out');
          //this.home.toggleHomeBtns(true);
        }

      }, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "slotPrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'null';
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "scrollView", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 'null';
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "totalCount", [property], {
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
      //         slotPrefab: {
      //             default: null,
      //             type: cc.Prefab
      //         },
      //         scrollView: {
      //             default: null,
      //             type: cc.ScrollView
      //         },
      //         totalCount: 0
      //     },
      // 
      //     init: function (home) {
      //         this.heroSlots = [];
      //         this.home = home;
      //         for (let i = 0; i < this.totalCount; ++i) {
      //             let heroSlot = this.addHeroSlot();
      //             this.heroSlots.push(heroSlot);
      //         }
      //     },
      // 
      //     addHeroSlot: function () {
      //         let heroSlot = cc.instantiate(this.slotPrefab);
      //         this.scrollView.content.addChild(heroSlot);
      //         return heroSlot;
      //     },
      // 
      //     show: function () {
      //         this.node.active = true;
      //         this.node.emit('fade-in');
      //         this.home.toggleHomeBtns(false);
      //     },
      // 
      //     hide: function () {
      //         this.node.emit('fade-out');
      //         this.home.toggleHomeBtns(true);
      //     },
      // });


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=BackPackUI.js.map