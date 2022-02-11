System.register(["cc", "cc/env"], function (_export, _context) {
  "use strict";

  var _cclegacy, Node, director, Director, game, Canvas, Camera, EDITOR, _crd, customLayerMask, builtinLayerMask, setParentEngine;

  function setChildrenLayer(node, layer) {
    for (var i = 0, l = node.children.length; i < l; i++) {
      node.children[i].layer = layer;
      setChildrenLayer(node.children[i], layer);
    }
  }

  function getCanvasCameraLayer(node) {
    var layer = 0;
    var canvas = node.getComponent(Canvas);

    if (canvas && canvas.cameraComponent) {
      if (canvas.cameraComponent.visibility & canvas.node.layer) {
        layer = canvas.node.layer;
      } else {
        layer = canvas.cameraComponent.visibility & ~(canvas.cameraComponent.visibility - 1);
      }

      return layer;
    }

    if (node.parent) {
      layer = getCanvasCameraLayer(node.parent);
    }

    return layer;
  }

  return {
    setters: [function (_cc) {
      _cclegacy = _cc.cclegacy;
      Node = _cc.Node;
      director = _cc.director;
      Director = _cc.Director;
      game = _cc.game;
      Canvas = _cc.Canvas;
      Camera = _cc.Camera;
    }, function (_ccEnv) {
      EDITOR = _ccEnv.EDITOR;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ebe6cbETu5CSbfEmrOZgzn8", "migrate-canvas", undefined);

      customLayerMask = 0x000fffff;
      builtinLayerMask = 0xfff00000;
      director.on(Director.EVENT_AFTER_SCENE_LAUNCH, () => {
        var _director$getScene, _director$getScene2, _director$getScene3;

        var roots = (_director$getScene = director.getScene()) === null || _director$getScene === void 0 ? void 0 : _director$getScene.children;
        var allCanvases = (_director$getScene2 = director.getScene()) === null || _director$getScene2 === void 0 ? void 0 : _director$getScene2.getComponentsInChildren(Canvas);
        if (allCanvases.length <= 1) return;
        allCanvases = allCanvases.filter(x => !!x.cameraComponent);
        var allCameras = (_director$getScene3 = director.getScene()) === null || _director$getScene3 === void 0 ? void 0 : _director$getScene3.getComponentsInChildren(Camera);
        var usedLayer = 0;
        allCameras.forEach(x => usedLayer |= x.visibility & customLayerMask);
        var persistCanvas = [];

        for (var i = 0, l = roots.length; i < l; i++) {
          var root = roots[i];
          if (!game.isPersistRootNode(root)) continue;
          var canvases = root.getComponentsInChildren(Canvas);
          if (canvases.length === 0) continue;
          persistCanvas.push(...canvases.filter(x => !!x.cameraComponent));
        }

        persistCanvas.forEach(val => {
          var isLayerCollided = allCanvases.find(x => x !== val && x.cameraComponent.visibility & val.cameraComponent.visibility & customLayerMask);

          if (isLayerCollided) {
            var availableLayers = ~usedLayer;
            var lastAvailableLayer = availableLayers & ~(availableLayers - 1);
            val.cameraComponent.visibility = lastAvailableLayer | val.cameraComponent.visibility & builtinLayerMask;
            setChildrenLayer(val.node, lastAvailableLayer);
            usedLayer |= availableLayers;
          }
        });
      });
      setParentEngine = Node.prototype.setParent;

      if (!EDITOR) {
        Node.prototype.setParent = function (value, keepWorldTransform) {
          setParentEngine.call(this, value, keepWorldTransform);
          if (!value) return; // find canvas

          var layer = getCanvasCameraLayer(this);

          if (layer) {
            this.layer = layer;
            setChildrenLayer(this, layer);
          }
        };
      }

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=migrate-canvas.js.map