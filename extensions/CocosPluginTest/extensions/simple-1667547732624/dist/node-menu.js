"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onPanelMenu = exports.onNodeMenu = exports.onRootMenu = exports.onCreateMenu = void 0;
function onCreateMenu() {
    return [
        {
            label: 'customCreateMenu',
            click() {
                console.warn(`customCreateMenu clicked`);
            },
        },
    ];
}
exports.onCreateMenu = onCreateMenu;
;
function onRootMenu() {
    return [
        {
            label: 'customRootMenu',
            click() {
                let uuids = Editor.Selection.getSelected('node');
                console.warn(`customRootMenu clicked`);
            },
        },
    ];
}
exports.onRootMenu = onRootMenu;
;
function onNodeMenu() {
    return [
        {
            label: 'customNodeMenu',
            click() {
                let uuids = Editor.Selection.getSelected('node');
                console.warn(`customNodeMenu clicked`);
            },
        },
    ];
}
exports.onNodeMenu = onNodeMenu;
;
function onPanelMenu() {
    return [
        {
            label: 'customPanelMenu',
            click() {
                let uuids = Editor.Selection.getSelected('node');
                console.warn(`customPanelMenu clicked`);
            },
        },
    ];
}
exports.onPanelMenu = onPanelMenu;
;
