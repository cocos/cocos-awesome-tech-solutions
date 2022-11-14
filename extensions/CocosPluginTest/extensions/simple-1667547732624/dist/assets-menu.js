"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPanelMenu = exports.onDBMenu = exports.onAssetMenu = exports.onCreateMenu = void 0;
function onCreateMenu(assetInfo) {
    return [
        {
            label: 'clickCreateMenuTest',
            click() {
                console.warn('create menu clicked');
            }
        },
    ];
}
exports.onCreateMenu = onCreateMenu;
;
function onAssetMenu(assetInfo) {
    if (!assetInfo) {
        console.warn('assetInfo is null');
    }
    else {
        console.warn('get assetInfo:');
        console.warn(assetInfo);
    }
}
exports.onAssetMenu = onAssetMenu;
;
function onDBMenu(assetInfo) {
    return [
        {
            label: 'clickDBMenuTest',
            click() {
                console.warn('db menu clicked');
            }
        },
    ];
}
exports.onDBMenu = onDBMenu;
;
function onPanelMenu(assetInfo) {
    return [
        {
            label: 'clickPanelMenuTest',
            click() {
                console.warn('panel menu clicked');
            }
        },
    ];
}
exports.onPanelMenu = onPanelMenu;
;
