System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _decorator, Component, _dec, _class, _class2, _descriptor, _temp, _crd, ccclass, property, PanelTransition;

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

      _cclegacy._RF.push({}, "e5284RIOh1C4Jyzfa64lV9l", "PanelTransition", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("PanelTransition", PanelTransition = (_dec = ccclass('PanelTransition'), _dec(_class = (_class2 = (_temp = class PanelTransition extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "duration", _descriptor, this);
        }

        onLoad() {//this.outOfWorld = cc.v2(3000, 0);
          //this.node.position = this.outOfWorld;
          //let cbFadeOut = cc.callFunc(this.onFadeOutFinish, this);
          //let cbFadeIn = cc.callFunc(this.onFadeInFinish, this);
          //this.actionFadeIn = cc.sequence(cc.spawn(cc.fadeTo(this.duration, 255), cc.scaleTo(this.duration, 1.0)), cbFadeIn);
          //this.actionFadeOut = cc.sequence(cc.spawn(cc.fadeTo(this.duration, 0), cc.scaleTo(this.duration, 2.0)), cbFadeOut);
          //this.node.on('fade-in', this.startFadeIn, this);
          //this.node.on('fade-out', this.startFadeOut, this);
        }

        startFadeIn() {//this.node.pauseSystemEvents(true);
          //this.node.position = cc.v2(0, 0);
          //this.node.setScale(2);
          //this.node.opacity = 0;
          //this.node.runAction(this.actionFadeIn);
        }

        startFadeOut() {//this.node.pauseSystemEvents(true);
          //this.node.runAction(this.actionFadeOut);
        }

        onFadeInFinish() {//this.node.resumeSystemEvents(true);
        }

        onFadeOutFinish() {//this.node.position = this.outOfWorld;
        }

      }, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "duration", [property], {
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
      //         duration: 0,
      //     },
      // 
      //     // use this for initialization
      //     onLoad: function () {
      //         this.outOfWorld = cc.v2(3000, 0);
      //         this.node.position = this.outOfWorld;
      //         let cbFadeOut = cc.callFunc(this.onFadeOutFinish, this);
      //         let cbFadeIn = cc.callFunc(this.onFadeInFinish, this);
      //         this.actionFadeIn = cc.sequence(cc.spawn(cc.fadeTo(this.duration, 255), cc.scaleTo(this.duration, 1.0)), cbFadeIn);
      //         this.actionFadeOut = cc.sequence(cc.spawn(cc.fadeTo(this.duration, 0), cc.scaleTo(this.duration, 2.0)), cbFadeOut);
      //         this.node.on('fade-in', this.startFadeIn, this);
      //         this.node.on('fade-out', this.startFadeOut, this);
      //     },
      // 
      //     startFadeIn: function () {
      //         this.node.pauseSystemEvents(true);
      //         this.node.position = cc.v2(0, 0);
      //         this.node.setScale(2);
      //         this.node.opacity = 0;
      //         this.node.runAction(this.actionFadeIn);
      //     },
      // 
      //     startFadeOut: function () {
      //         this.node.pauseSystemEvents(true);
      //         this.node.runAction(this.actionFadeOut);
      //     },
      // 
      //     onFadeInFinish: function () {
      //         this.node.resumeSystemEvents(true);
      //     },
      // 
      //     onFadeOutFinish: function () {
      //         this.node.position = this.outOfWorld;
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
//# sourceMappingURL=PanelTransition.js.map