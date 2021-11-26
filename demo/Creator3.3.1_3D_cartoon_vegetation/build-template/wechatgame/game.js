require('./libs/wrapper/builtin/index');
window.DOMParser = require('./libs/common/xmldom/dom-parser').DOMParser;
require('./libs/common/engine/globalAdapter/index');
require('./libs/wrapper/unify');
require('./libs/wrapper/fs-utils');


// Polyfills bundle.
require("src/polyfills.bundle.js");

// SystemJS support.
require("src/system.bundle.js");


// Adapt for IOS, swap if opposite
if (canvas){
    var _w = canvas.width;
    var _h = canvas.height;
    if (screen.width < screen.height) {
        if (canvas.width > canvas.height) {
            _w = canvas.height;
            _h = canvas.width;
        }
    } else {
        if (canvas.width < canvas.height) {
            _w = canvas.height;
            _h = canvas.width;
        }
    }
    canvas.width = _w;
    canvas.height = _h;
}
// Adjust initial canvas size
if (canvas && window.devicePixelRatio >= 2) {canvas.width *= 2; canvas.height *= 2;}

const importMap = require("src/import-map.js").default;
System.warmup({
    importMap,
    importMapUrl: 'src/import-map.js',
    defaultHandler: (urlNoSchema) => {
        require('.' + urlNoSchema);
    },
    handlers: {
        'plugin:': (urlNoSchema) => {
            requirePlugin(urlNoSchema);
        },
    },
});

/**
 * Fetch WebAssembly binaries.
 * 
 * Whereas WeChat expects the argument passed to `WebAssembly.instantiate`
 * to be file path and the path should be relative from project's root dir,
 * we do the path conversion and directly return the converted path.
 * 
 * @param path The path to `.wasm` file **relative from engine's out dir**(no leading `./`).
 * See 'assetURLFormat' field of build engine options.
 */
function fetchWasm(path) {
    const engineDir = 'cocos-js'; // Relative from project out
    return `${engineDir}/${path}`;
}

System.import('./application.8c19d.js').then(({ createApplication }) => {
    return createApplication({
        loadJsListFile: (url) => require(url),
        fetchWasm,
    });
}).then((application) => {
    return onApplicationCreated(application);
}).catch((err) => {
    console.error(err);
});

function onApplicationCreated(application) {
    return application.import('cc').then((cc) => {
        require('./libs/common/engine/index.js');
        require('./libs/wrapper/engine/index');
        require('./libs/common/cache-manager.js');
        // Adjust devicePixelRatio
        cc.view._maxPixelRatio = 4;
        // Release Image objects after uploaded gl texture
        cc.macro.CLEANUP_IMAGE_CACHE = false;
        return application.start({
            findCanvas: () => {
                var container = document.createElement('div');
                return { frame: container, canvas: window.canvas, container };
            },
        });
    });
}

 wx.showShareMenu()

 wx.onShareAppMessage(function () {
  return {
    imageUrlId: "XG6zojV3Rc+mtAZJ6TRaFg==",
    imageUrl: "https://mmocgame.qpic.cn/wechatgame/8RcaBwOH9otmbE1oN5bJsEEZk2QwaFoOX6icVfmUTYEvRjB2LwLeD66Is6wmviaCPN/0"
  }
})