System.register(["__unresolved_0", "cc"], function (_export, _context) {
  "use strict";

  var _reporterNs, _cclegacy, Rutils, _crd;

  function _reportPossibleCrUseOftesselateBezier(extras) {
    _reporterNs.report("tesselateBezier", "./R.tesselateBezier", _context.meta, extras);
  }

  function _reportPossibleCrUseOfpath2curve(extras) {
    _reporterNs.report("path2curve", "./R.curve", _context.meta, extras);
  }

  function _reportPossibleCrUseOfdrawDashPoints(extras) {
    _reporterNs.report("drawDashPoints", "./R.dash", _context.meta, extras);
  }

  _export("default", void 0);

  return {
    setters: [function (_unresolved_) {
      _reporterNs = _unresolved_;
    }, function (_cc) {
      _cclegacy = _cc.cclegacy;
    }],
    execute: function () {
      _crd = true;

      _cclegacy._RF.push({}, "588929pZCZIpIto22fDnVAb", "R.utils", undefined);

      _export("default", Rutils = class Rutils {
        constructor() {
          this.tesselateBezier = void 0;
          this.path2curve = void 0;
          this.drawDashPoints = void 0;
        }

        mixin(dst, src, addon) {
          for (var key in src) {
            if (!addon || addon && !dst[key]) {
              if (typeof src[key] === 'object') {
                dst[key] = {};

                for (var subKey in src[key]) {
                  dst[key][subKey] = src[key][subKey];
                }
              } else {
                dst[key] = src[key];
              }
            }
          }
        }

        defineClass() {
          var defines = {
            properties: {},
            statics: {}
          };

          for (var i = 0, ii = arguments.length; i < ii; i++) {
            var d = i < 0 || arguments.length <= i ? undefined : arguments[i];
            this.mixin(defines.properties, d.properties, null);
            this.mixin(defines.statics, d.statics, null);
            this.mixin(defines, d, true);
          }

          return defines;
        }

      });

      _cclegacy._RF.pop();

      _crd = false;
    }
  };
});
//# sourceMappingURL=fcc9a8b30fc82a0640cf14e5f22b56e37d97adde.js.map