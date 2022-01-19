System.register(["cc"], function (_export, _context) {
  "use strict";

  var _cclegacy, _decorator, Component, _dec, _class, _crd, ccclass, ChargeUI;

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "11f1epEd5FProshh8dSXgPW", "ChargeUI", undefined);

      ({
        ccclass
      } = _decorator);

      _export("ChargeUI", ChargeUI = (_dec = ccclass('ChargeUI'), _dec(_class = class ChargeUI extends Component {
        init(home, parentBtns) {//this.home = home;
          //this.parentBtns = parentBtns;
        }

        show() {//this.node.active = true;
          //this.node.emit('fade-in');
          //this.home.toggleHomeBtns(false);
          //this.parentBtns.pauseSystemEvents();
        }

        hide() {//this.node.emit('fade-out');
          //this.home.toggleHomeBtns(true);
          //this.parentBtns.resumeSystemEvents();
        }

      }) || _class));
      /**
       * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
       */
      // cc.Class({
      //     extends: cc.Component,
      // 
      //     properties: {
      // 
      //     },
      // 
      //     // use this for initialization
      //     init: function (home, parentBtns) {
      //         this.home = home;
      //         this.parentBtns = parentBtns;
      //     },
      // 
      //     show: function () {
      //         this.node.active = true;
      //         this.node.emit('fade-in');
      //         this.home.toggleHomeBtns(false);
      //         this.parentBtns.pauseSystemEvents();
      //     },
      // 
      //     hide: function () {
      //         this.node.emit('fade-out');
      //         this.home.toggleHomeBtns(true);
      //         this.parentBtns.resumeSystemEvents();
      //     },
      // });


      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=ChargeUI.js.map