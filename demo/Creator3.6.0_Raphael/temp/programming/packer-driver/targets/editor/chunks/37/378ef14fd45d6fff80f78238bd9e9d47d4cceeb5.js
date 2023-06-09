System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, ScrollView, director, SceneList, _dec, _dec2, _class, _class2, _descriptor, _crd, ccclass, property, emptyFunc, Menu;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfSceneList(extras) {
    _reporterNs.report("SceneList", "./SceneList", _context.meta, extras);
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
      ScrollView = _cc.ScrollView;
      director = _cc.director;
    }, function (_unresolved_2) {
      SceneList = _unresolved_2.SceneList;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "04525pyYBlN26SWawaUF3dA", "Menu", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Label', 'Node', 'Button', 'ScrollView', 'game', 'director']);

      ({
        ccclass,
        property
      } = _decorator);

      emptyFunc = function (event) {
        event.stopPropagation();
      };

      _export("Menu", Menu = (_dec = ccclass('Menu'), _dec2 = property(ScrollView), _dec(_class = (_class2 = class Menu extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "testList", _descriptor, this);

          this._isLoadingScene = false;
          this.showDebugDraw = false;
          this.currentSceneUrl = '';
          this.contentPos = null;
          this.isMenu = true;
          this.sceneList = void 0;
        }

        onLoad() {
          // game.addPersistRootNode(this.node);
          this.currentSceneUrl = 'TestList.fire'; // game.addPersistRootNode(this.testList.node);

          if (this.testList && this.testList.content) {
            this.sceneList = this.testList.content.getComponent(_crd && SceneList === void 0 ? (_reportPossibleCrUseOfSceneList({
              error: Error()
            }), SceneList) : SceneList);
            this.sceneList.init(this);
          }
        }

        loadScene(url) {
          // this._isLoadingScene = true;
          // this.contentPos = this.testList.getContentPosition();
          // this.currentSceneUrl = url;
          // this.isMenu = false;
          // this.testList.node.active = false;
          director.loadScene(url);
        }

        onLoadSceneFinish() {// this.testList.node.active = false;
          // if (this.isMenu && this.contentPos) {
          //    this.testList.node.active = true;
          //    this.testList.setContentPosition(this.contentPos);
          // }
          // this._isLoadingScene = false;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "testList", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=378ef14fd45d6fff80f78238bd9e9d47d4cceeb5.js.map