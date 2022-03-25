import tesselateBezier from "./R.tesselateBezier";
import { path2absolute,path2curve } from "./R.curve";
import drawDashPoints from "./R.dash";
export default class Rutils {
   public mixin(dst, src, addon) {
        for (let key in src) {
            if (!addon || (addon && !dst[key])) {
                if (typeof src[key] === 'object') {
                    dst[key] = {};
                    for (let subKey in src[key]) {
                        dst[key][subKey] = src[key][subKey];
                    }
                }
                else {
                    dst[key] = src[key];
                }
            }
        }
    }

    defineClass (...args) {
        var defines = {
            properties: {},
            statics: {}
        };

        for (var i = 0, ii = args.length; i < ii; i++) {
            var d = args[i];

            this.mixin(defines.properties, d.properties,null);
            this.mixin(defines.statics, d.statics,null);
            this.mixin(defines, d, true);
        }

        return defines;
    }

    tesselateBezier: tesselateBezier;
    path2curve: path2curve;
    drawDashPoints: drawDashPoints;
}