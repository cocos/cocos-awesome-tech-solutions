System.register(["cc", "cc/env"], function (_export, _context) {
  "use strict";

  var _cclegacy, __checkObsolete__, __checkObsoleteInNamespace__, Node, director, Director, Canvas, Camera, EDITOR, _crd, customLayerMask, builtinLayerMask, setParentEngine;

  function setChildrenLayer(node, layer) {
    for (let i = 0, l = node.children.length; i < l; i++) {
      node.children[i].layer = layer;
      setChildrenLayer(node.children[i], layer);
    }
  }

  function getCanvasCameraLayer(node) {
    let layer = 0;
    let canvas = node.getComponent(Canvas);

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
      __checkObsolete__ = _cc.__checkObsolete__;
      __checkObsoleteInNamespace__ = _cc.__checkObsoleteInNamespace__;
      Node = _cc.Node;
      director = _cc.director;
      Director = _cc.Director;
      Canvas = _cc.Canvas;
      Camera = _cc.Camera;
    }, function (_ccEnv) {
      EDITOR = _ccEnv.EDITOR;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "ebe6cbETu5CSbfEmrOZgzn8", "migrate-canvas", undefined);

      __checkObsolete__(['_decorator', 'Node', 'director', 'Director', 'game', 'BaseNode', 'Canvas', 'Camera']);

      customLayerMask = 0x000fffff;
      builtinLayerMask = 0xfff00000;
      director.on(Director.EVENT_AFTER_SCENE_LAUNCH, () => {
        var _director$getScene, _director$getScene2, _director$getScene3;

        const roots = (_director$getScene = director.getScene()) == null ? void 0 : _director$getScene.children;
        let allCanvases = (_director$getScene2 = director.getScene()) == null ? void 0 : _director$getScene2.getComponentsInChildren(Canvas);
        if (allCanvases.length <= 1) return;
        allCanvases = allCanvases.filter(x => !!x.cameraComponent);
        let allCameras = (_director$getScene3 = director.getScene()) == null ? void 0 : _director$getScene3.getComponentsInChildren(Camera);
        let usedLayer = 0;
        allCameras.forEach(x => usedLayer |= x.visibility & customLayerMask);
        const persistCanvas = [];

        for (let i = 0, l = roots.length; i < l; i++) {
          const root = roots[i];
          if (!director.isPersistRootNode(root)) continue;
          const canvases = root.getComponentsInChildren(Canvas);
          if (canvases.length === 0) continue;
          persistCanvas.push(...canvases.filter(x => !!x.cameraComponent));
        }

        persistCanvas.forEach(val => {
          const isLayerCollided = allCanvases.find(x => x !== val && x.cameraComponent.visibility & val.cameraComponent.visibility & customLayerMask);

          if (isLayerCollided) {
            const availableLayers = ~usedLayer;
            const lastAvailableLayer = availableLayers & ~(availableLayers - 1);
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

          let layer = getCanvasCameraLayer(this);

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
//# sourceMappingURL=13f7c7029e8a40f7fa8df174f400718579b5e0fa.js.map