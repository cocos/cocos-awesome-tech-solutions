System.register(["__unresolved_0", "cc", "__unresolved_1"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, _decorator, Component, Node, Camera, RenderTexture, ImageAsset, view, Size, Texture2D, SpriteFrame, Sprite, UITransform, sys, log, error, Button, assetManager, instantiate, Vec3, Label, Canvas2Image, _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _temp, _crd, ccclass, property, Screenshot2D;

  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }

  function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }

  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }

  function _reportPossibleCrUseOfCanvas2Image(extras) {
    _reporterNs.report("Canvas2Image", "./Canvas2Image", _context.meta, extras);
  }

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
      _decorator = _cc._decorator;
      Component = _cc.Component;
      Node = _cc.Node;
      Camera = _cc.Camera;
      RenderTexture = _cc.RenderTexture;
      ImageAsset = _cc.ImageAsset;
      view = _cc.view;
      Size = _cc.Size;
      Texture2D = _cc.Texture2D;
      SpriteFrame = _cc.SpriteFrame;
      Sprite = _cc.Sprite;
      UITransform = _cc.UITransform;
      sys = _cc.sys;
      log = _cc.log;
      error = _cc.error;
      Button = _cc.Button;
      assetManager = _cc.assetManager;
      instantiate = _cc.instantiate;
      Vec3 = _cc.Vec3;
      Label = _cc.Label;
    }, function (_unresolved_2) {
      Canvas2Image = _unresolved_2.Canvas2Image;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "a566fPUEjJDAK34Vh7BcYx8", "Screenshot2D", undefined);

      ({
        ccclass,
        property
      } = _decorator);

      _export("Screenshot2D", Screenshot2D = (_dec = ccclass('Screenshot2D'), _dec2 = property(Camera), _dec3 = property(Node), _dec4 = property(Button), _dec5 = property(Node), _dec6 = property(Label), _dec(_class = (_class2 = (_temp = class Screenshot2D extends Component {
        constructor() {
          super(...arguments);

          _initializerDefineProperty(this, "copyCamera", _descriptor, this);

          _initializerDefineProperty(this, "targetNode", _descriptor2, this);

          _initializerDefineProperty(this, "downloaderBtn", _descriptor3, this);

          _initializerDefineProperty(this, "copyNode", _descriptor4, this);

          _initializerDefineProperty(this, "tips", _descriptor5, this);

          _defineProperty(this, "rt", null);

          _defineProperty(this, "_canvas", null);

          _defineProperty(this, "_buffer", null);

          _defineProperty(this, "canvas2image", null);
        }

        start() {
          this.canvas2image = (_crd && Canvas2Image === void 0 ? (_reportPossibleCrUseOfCanvas2Image({
            error: Error()
          }), Canvas2Image) : Canvas2Image).getInstance();
          this.rt = new RenderTexture();
          this.rt.reset({
            width: view.getVisibleSize().width,
            height: view.getVisibleSize().height
          });
          this.copyCamera.targetTexture = this.rt;
          this.scheduleOnce(() => {
            this.capture();
          }, 2);
        }

        capture() {
          this.copyRenderTex();
        }

        copyRenderTex() {
          var width = this.targetNode.getComponent(UITransform).width;
          var height = this.targetNode.getComponent(UITransform).height;
          var worldPos = this.targetNode.getWorldPosition();
          this._buffer = this.rt.readPixels(Math.round(worldPos.x), Math.round(worldPos.y), width, height);
          this.showImage(width, height);
        }

        showImage(width, height) {
          var _this$copyNode, _this$copyNode$getCom;

          var img = new ImageAsset();
          img.reset({
            _data: this._buffer,
            width: width,
            height: height,
            format: Texture2D.PixelFormat.RGBA8888,
            _compressed: false
          });
          var texture = new Texture2D();
          texture.image = img;
          var sf = new SpriteFrame();
          sf.texture = texture;
          sf.packable = false;
          this.copyNode.getComponent(Sprite).spriteFrame = sf;
          this.copyNode.getComponent(Sprite).spriteFrame.flipUVY = true;

          if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
            this.copyNode.getComponent(Sprite).spriteFrame.flipUVY = false;
          }

          (_this$copyNode = this.copyNode) === null || _this$copyNode === void 0 ? void 0 : (_this$copyNode$getCom = _this$copyNode.getComponent(UITransform)) === null || _this$copyNode$getCom === void 0 ? void 0 : _this$copyNode$getCom.setContentSize(new Size(width, height));
          this.downloaderBtn.node.active = true;
          this.tips.string = "\u622A\u56FE\u6210\u529F";
        }

        savaAsImage(width, height, arrayBuffer) {
          if (sys.isBrowser) {
            if (!this._canvas) {
              this._canvas = document.createElement('canvas');
              this._canvas.width = width;
              this._canvas.height = height;
            } else {
              this.clearCanvas();
            }

            var _ctx = this._canvas.getContext('2d');

            var _rowBytes = width * 4;

            for (var _row = 0; _row < height; _row++) {
              var _sRow = height - 1 - _row;

              var _imageData = _ctx.createImageData(width, 1);

              var _start = _sRow * width * 4;

              for (var _i = 0; _i < _rowBytes; _i++) {
                _imageData.data[_i] = arrayBuffer[_start + _i];
              }

              _ctx.putImageData(_imageData, 0, _row);
            } //@ts-ignore


            this.canvas2image.saveAsPNG(this._canvas, width, height);
            this.tips.string = "\u4FDD\u5B58\u56FE\u7247\u6210\u529F";
          } else if (sys.isNative) {
            // console.log("原生平台暂不支持图片下载");
            // return;
            var filePath = jsb.fileUtils.getWritablePath() + 'render_to_sprite_image.png'; // 目前 3.0.0 ~ 3.4.0 版本还不支持 jsb.saveImageData ,引擎计划在 3.5.0 支持, 要保存 imageData 为本地 png 文件需要参考下方的 pr 定制引擎
            // https://gitee.com/zzf2019/engine-native/commit/1ddb6ec9627a8320cd3545d353d8861da33282a8
            //@ts-ignore

            if (jsb.saveImageData) {
              //@ts-ignore
              var success = jsb.saveImageData(this._buffer, width, height, filePath);

              if (success) {
                // 用于测试图片是否正确保存到本地设备路径下
                assetManager.loadRemote(filePath, (err, imageAsset) => {
                  if (err) {
                    console.log("show image error");
                  } else {
                    var newNode = instantiate(this.targetNode);
                    newNode.setPosition(new Vec3(-newNode.position.x, newNode.position.y, newNode.position.z));
                    this.targetNode.parent.addChild(newNode);
                    var spriteFrame = new SpriteFrame();
                    var texture = new Texture2D();
                    texture.image = imageAsset;
                    spriteFrame.texture = texture;
                    newNode.getComponent(Sprite).spriteFrame = spriteFrame;
                    spriteFrame.packable = false;
                    spriteFrame.flipUVY = true;

                    if (sys.isNative && (sys.os === sys.OS.IOS || sys.os === sys.OS.OSX)) {
                      spriteFrame.flipUVY = false;
                    }

                    this.tips.string = "\u6210\u529F\u4FDD\u5B58\u5728\u8BBE\u5907\u76EE\u5F55\u5E76\u52A0\u8F7D\u6210\u529F: " + filePath;
                  }
                });
                log("save image data success, file: " + filePath);
                this.tips.string = "\u6210\u529F\u4FDD\u5B58\u5728\u8BBE\u5907\u76EE\u5F55: " + filePath;
              } else {
                error("save image data failed!");
                this.tips.string = "\u4FDD\u5B58\u56FE\u7247\u5931\u8D25";
              }
            }
          } else if (sys.platform === sys.Platform.WECHAT_GAME) {
            if (!this._canvas) {
              //@ts-ignore
              this._canvas = wx.createCanvas();
              this._canvas.width = width;
              this._canvas.height = height;
            } else {
              this.clearCanvas();
            }

            var ctx = this._canvas.getContext('2d');

            var rowBytes = width * 4;

            for (var row = 0; row < height; row++) {
              var sRow = height - 1 - row;
              var imageData = ctx.createImageData(width, 1);
              var start = sRow * width * 4;

              for (var i = 0; i < rowBytes; i++) {
                imageData.data[i] = arrayBuffer[start + i];
              }

              ctx.putImageData(imageData, 0, row);
            } //@ts-ignore


            this._canvas.toTempFilePath({
              x: 0,
              y: 0,
              width: this._canvas.width,
              height: this._canvas.height,
              destWidth: this._canvas.width,
              destHeight: this._canvas.height,
              fileType: "png",
              success: res => {
                //@ts-ignore
                wx.showToast({
                  title: "截图成功"
                });
                this.tips.string = "\u622A\u56FE\u6210\u529F"; //@ts-ignore

                wx.saveImageToPhotosAlbum({
                  filePath: res.tempFilePath,
                  success: res => {
                    //@ts-ignore              
                    wx.showToast({
                      title: "成功保存到设备相册"
                    });
                    this.tips.string = "\u6210\u529F\u4FDD\u5B58\u5728\u8BBE\u5907\u76EE\u5F55: " + res.tempFilePath;
                  },
                  fail: () => {
                    this.tips.string = "\u4FDD\u5B58\u56FE\u7247\u5931\u8D25";
                  }
                });
              },
              fail: () => {
                //@ts-ignore
                wx.showToast({
                  title: "截图失败"
                });
                this.tips.string = "\u622A\u56FE\u5931\u8D25";
              }
            });
          }
        }

        clearCanvas() {
          var ctx = this._canvas.getContext('2d');

          ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }

        onSaveImageBtnClicked() {
          var width = this.targetNode.getComponent(UITransform).width;
          var height = this.targetNode.getComponent(UITransform).height;
          this.savaAsImage(width, height, this._buffer);
        }

      }, _temp), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "copyCamera", [_dec2], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "targetNode", [_dec3], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "downloaderBtn", [_dec4], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "copyNode", [_dec5], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "tips", [_dec6], {
        configurable: true,
        enumerable: true,
        writable: true,
        initializer: function initializer() {
          return null;
        }
      })), _class2)) || _class));

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=Screenshot2D.js.map