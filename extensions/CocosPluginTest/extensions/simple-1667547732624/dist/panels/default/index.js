"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
/**
 * @zh 如果希望兼容 3.3 之前的版本可以使用下方的代码
 * @en You can add the code below if you want compatibility with versions prior to 3.3
 */
// Editor.Panel.define = Editor.Panel.define || function(options: any) { return options }
module.exports = Editor.Panel.define({
    listeners: {
        show() { console.warn('show'); },
        hide() { console.warn('hide'); },
        resize() { console.warn('resize'); }
    },
    template: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: (0, fs_extra_1.readFileSync)((0, path_1.join)(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
        button: '#button',
        drop: '#dropToPanel',
        preview: '#preview'
    },
    methods: {
        hello() {
            if (this.$.app) {
                this.$.app.innerHTML = 'hello';
                console.warn('[cocos-panel-html.default]: hello');
            }
        },
        click() {
            if (this.$.app) {
                //@ts-ignore
                if (!!this.$.preview.contentWindow) {
                    //@ts-ignore
                    const iframeWindow = this.$.preview.contentWindow;
                    // 可以直接执行 iframe 的 window 中的方法
                    // iframeWindow.cocosTest();
                    // 可以向 iframe 传递消息
                    //@ts-ignore
                    iframeWindow.postMessage("CocosTest", this.$.preview.src);
                }
                else {
                    /*
                        如果 iframe 的路径和父级页面不是同源地址，则需要使用 location.hash 跨域方案，即修改 # 符号后面的字符串用于传递数据
                        在 iframe 中设置 onhashchange 函数监听 location.hash 修改，然后解析 windows.location.hash 字符串获取传递数据
                    */
                    //@ts-ignore
                    this.$.preview.src = `http://localhost:7456/#${Math.random()}`;
                }
                this.$.app.innerHTML = 'Test Clicked';
                console.warn('clicked');
            }
        },
        dropAsset(assetInfo, dragInfo) {
            // console.log(Editor.I18n.t('extend-assets-demo.drop.callback'));
            console.log(assetInfo);
            console.log(dragInfo);
        }
    },
    ready() {
        var _a, _b;
        console.warn('panel is ready');
        if (this.$.app) {
            this.$.app.innerHTML = 'Hello Cocos.';
            (_a = this.$.button) === null || _a === void 0 ? void 0 : _a.addEventListener("click", this.click.bind(this));
            (_b = this.$.drop) === null || _b === void 0 ? void 0 : _b.addEventListener("drop", (event) => {
                const uuid = event.dataTransfer.getData('value');
                console.warn(`file uuid: ${uuid}`);
                const systemFiles = Array.from(event.dataTransfer.files);
                if (systemFiles.length > 0) {
                    for (var key in systemFiles[0]) {
                        switch (key) {
                            case "name":
                                console.warn(`fileName: ${systemFiles[0].name}`);
                                break;
                            case "path":
                                console.warn(`filePath: ${systemFiles[0].path}`);
                                break;
                            case "type":
                                console.warn(`fileType: ${systemFiles[0].type}`);
                                break;
                            default:
                                console.log(`filesOtherKey: ${key}`);
                                break;
                        }
                    }
                }
                // get data from Editor
                const assetDragInfo = Editor.UI.DragArea.currentDragInfo;
                console.warn(assetDragInfo);
            });
        }
    },
    beforeClose() {
        // return this.$.app?.innerHTML === 'Hello Cocos.';
    },
    close() {
        console.warn('panel closed');
    },
});
