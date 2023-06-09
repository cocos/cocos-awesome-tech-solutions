System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, _decorator, Component, Prefab, ScrollView, instantiate, Vec3, path, assetManager, UITransform, Size, ListItem, _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _crd, ccclass, property, SceneList;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfListItem(extras) {
    _reporterNs.report("ListItem", "./ListItem", _context.meta, extras);
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
      Prefab = _cc.Prefab;
      ScrollView = _cc.ScrollView;
      instantiate = _cc.instantiate;
      Vec3 = _cc.Vec3;
      path = _cc.path;
      assetManager = _cc.assetManager;
      UITransform = _cc.UITransform;
      Size = _cc.Size;
    }, function (_unresolved_2) {
      ListItem = _unresolved_2.ListItem;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "473b8wxs55OsJvoxVdYCzTF", "SceneList", undefined);

      __checkObsolete__(['_decorator', 'Component', 'Prefab', 'ScrollView', 'instantiate', 'Vec2', 'Vec3', 'game', 'path', 'assetManager', 'UITransform', 'Size']);

      ({
        ccclass,
        property
      } = _decorator);

      _export("SceneList", SceneList = (_dec = ccclass('SceneList'), _dec2 = property(Prefab), _dec3 = property(ScrollView), _dec(_class = (_class2 = class SceneList extends Component {
        constructor(...args) {
          super(...args);

          _initializerDefineProperty(this, "itemPrefab", _descriptor, this);

          _initializerDefineProperty(this, "initItemCount", _descriptor2, this);

          _initializerDefineProperty(this, "scrollView", _descriptor3, this);

          _initializerDefineProperty(this, "bufferZone", _descriptor4, this);

          this.menu = null;
          this.sceneList = [];
          this.itemList = [];
          this.updateTimer = 0;
          this.updateInterval = 0.2;
          this.lastContentPosY = 0;
        }

        createItem(x, y, name, url) {
          var item = instantiate(this.itemPrefab);
          var itemComp = item.getComponent(_crd && ListItem === void 0 ? (_reportPossibleCrUseOfListItem({
            error: Error()
          }), ListItem) : ListItem);
          var label = itemComp.label;
          label.string = name;

          if (url) {
            itemComp.url = url;
          }

          item.setPosition(new Vec3(x, y, 0));
          this.node.addChild(item);
          return item;
        }

        init(menu) {
          this.menu = menu;
          this.sceneList = [];
          this.itemList = [];
          this.updateTimer = 0;
          this.updateInterval = 0.2;
          this.lastContentPosY = 0; // use this variable to detect if we are scrolling up or down

          this.initList();
        }

        initList() {
          // var scenes = game._sceneInfos; //is deprecated
          let scenes = [];

          if (assetManager.main) {
            assetManager.main.config.scenes.forEach(val => {
              scenes.push(val);
            });
          }

          var dict = {};

          if (scenes) {
            var i, j;

            for (i = 0; i < scenes.length; ++i) {
              let url = scenes[i].url;
              let dirname = path.dirname(url).replace('db://assets/cases/', '');

              if (dirname === 'db://assets/resources/test assets') {
                continue;
              }

              let scenename = path.basename(url, '.fire');
              if (scenename === 'TestList') continue;
              if (!dirname) dirname = '_root';

              if (!dict[dirname]) {
                dict[dirname] = {};
              }

              dict[dirname][scenename] = url;
            }
          } else {
            console.log('failed to get scene list!');
          }

          let dirs = Object.keys(dict);
          dirs.sort();

          for (let i = 0; i < dirs.length; ++i) {
            this.sceneList.push({
              name: dirs[i],
              url: null
            });
            let scenenames = Object.keys(dict[dirs[i]]);
            scenenames.sort();

            for (let j = 0; j < scenenames.length; ++j) {
              let name = scenenames[j];
              this.sceneList.push({
                name: name,
                url: dict[dirs[i]][name]
              });
            }
          }

          let y = 0;
          let com = this.node.getComponent(UITransform);
          com.setContentSize(new Size(com.width, (this.sceneList.length + 1) * 50));

          for (let i = 0; i < this.initItemCount; ++i) {
            let item = instantiate(this.itemPrefab).getComponent(_crd && ListItem === void 0 ? (_reportPossibleCrUseOfListItem({
              error: Error()
            }), ListItem) : ListItem);
            let itemInfo = this.sceneList[i];
            item.init(this.menu);
            this.node.addChild(item.node);
            y -= 50;
            item.updateItem(i, y, itemInfo.name, itemInfo.url);
            this.itemList.push(item);
          }
        }

        getPositionInView(item) {
          let worldPos = item.parent.getComponent(UITransform).convertToWorldSpaceAR(item.position);
          let viewPos = this.scrollView.node.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
          return viewPos;
        }

        update(dt) {
          this.updateTimer += dt;

          if (this.updateTimer < this.updateInterval) {
            return; // we don't need to do the math every frame
          }

          this.updateTimer = 0;
          let items = this.itemList;
          let buffer = this.bufferZone;
          let isDown = this.node.position.y < this.lastContentPosY; // scrolling direction

          let curItemCount = this.itemList.length;
          let offset = 50 * curItemCount;

          for (let i = 0; i < curItemCount; ++i) {
            let item = items[i];
            let itemNode = item.node;
            let viewPos = this.getPositionInView(itemNode);

            if (isDown) {
              if (viewPos.y < -buffer && itemNode.y + offset < 0) {
                let newIdx = item.index - curItemCount;
                let newInfo = this.sceneList[newIdx];
                item.updateItem(newIdx, itemNode.y + offset, newInfo.name, newInfo.url);
              }
            } else {
              if (viewPos.y > buffer && itemNode.y - offset > -this.node.getComponent(UITransform).height) {
                let newIdx = item.index + curItemCount;
                let newInfo = this.sceneList[newIdx];
                item.updateItem(newIdx, itemNode.y - offset, newInfo.name, newInfo.url);
              }
            }
          }

          this.lastContentPosY = this.node.position.y;
        }

      }, (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "itemPrefab", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "initItemCount", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "scrollView", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "bufferZone", [property], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function () {
          return 0;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=0cc154655c22104cd6fcdddff675afaa2d4cfdbf.js.map