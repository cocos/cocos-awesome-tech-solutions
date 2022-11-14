import { readFileSync } from 'fs-extra';
import { json } from 'stream/consumers';
import { join } from 'path';
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
    template: readFileSync(join(__dirname, '../../../static/template/default/index.html'), 'utf-8'),
    style: readFileSync(join(__dirname, '../../../static/style/default/index.css'), 'utf-8'),
    $: {
        app: '#app',
        button: '#button',
        drop: '#dropToPanel'
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
                this.$.app.innerHTML = 'Test Clicked';
                console.warn('clicked');
            }
        },
        dropAsset(assetInfo: any, dragInfo: any) {
            // console.log(Editor.I18n.t('extend-assets-demo.drop.callback'));
            console.log(assetInfo);
            console.log(dragInfo);
        }
    },
    ready() {
        console.warn('panel is ready');
        if (this.$.app) {
            this.$.app.innerHTML = 'Hello Cocos.';
            this.$.button?.addEventListener("click",this.click.bind(this));
            this.$.drop?.addEventListener("drop", (event)=>{
                const uuid = event.dataTransfer!.getData('value');
                console.warn(`file uuid: ${uuid}`);

                const systemFiles = Array.from(event.dataTransfer!.files);
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
            })
        }
    },
    beforeClose() { 
        // return this.$.app?.innerHTML === 'Hello Cocos.';
    },
    close() {
        console.warn('panel closed');
    },
});
