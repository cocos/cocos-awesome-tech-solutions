import { _decorator, ButtonComponent, Component, director, game, Node, ScrollViewComponent, Vec3, LayoutComponent, LabelComponent, assetManager } from 'cc';
const { ccclass, type } = _decorator;
import { sceneArray } from './scenelist';

@ccclass('BackButton')
export class BackButton extends Component {

    @type(LabelComponent)
    title: LabelComponent | null = null;

    private static _instance: BackButton | null = null;
    static get instance () {
        return this._instance;
    }

    public static get offset () {
        return BackButton._offset;
    }

    public static set offset ( value ) {
        BackButton._offset = value;
    }
    public static _scrollNode: Node | null  = null;

    public static saveOffset () {
        if ( BackButton._scrollNode ) {
            BackButton._offset = new Vec3(0, BackButton._scrollCom.getScrollOffset().y, 0);
        }
    }

    public static saveIndex ( index: number) {
        BackButton._sceneIndex = index;
        BackButton.refreshButton();
    }

    public static refreshButton () {
        if (BackButton._sceneIndex === -1) {
            BackButton._prevNode.active = false;
            BackButton._nextNode.active = false;
        } else {
            BackButton._prevNode.active = true;
            BackButton._nextNode.active = true;
        }

        BackButton.instance!.updateTitle();
    }
    private static _offset = new Vec3();
    private static _scrollCom: ScrollViewComponent | null = null;

    private static _sceneIndex: number = -1;
    private static _blockInput : Node;
    private static _prevNode: Node;
    private static _nextNode: Node;

    public __preload () {
        BackButton._instance = this;

        const sceneInfo = assetManager.main!.config.scenes;
        let firstIndex = 0;
        let lastIndex = 0;
        let sceneString: string = '';
        for (let i in sceneInfo._map) {
            sceneString = sceneInfo._map[i].url;
            firstIndex = sceneString.lastIndexOf('/') + 1;
            lastIndex = sceneString.lastIndexOf('.scene');
            sceneString = sceneString.substring(firstIndex, lastIndex);
            if (sceneString.includes('testlist.scene')) {
                continue;
            }
            sceneString = sceneString.replace('.scene', '');
            sceneArray.push(sceneString);
        }
    }

    public start () {
        game.addPersistRootNode(this.node);
        BackButton._scrollNode = this.node.getParent().getChildByPath('Canvas/ScrollView') as Node;
        if (BackButton._scrollNode) {
            BackButton._scrollCom = BackButton._scrollNode.getComponent(ScrollViewComponent);
        }
        BackButton._blockInput = this.node.getChildByName('BlockInput') as Node;
        BackButton._blockInput.active = false;
        BackButton._prevNode = this.node.getChildByName('PrevButton') as Node;
        BackButton._nextNode = this.node.getChildByName('NextButton') as Node;
        if (BackButton._prevNode && BackButton._nextNode) {
            BackButton.refreshButton();
        }
    }

    public backToList () {
        BackButton._blockInput.active = true;
        director.loadScene('testlist', function () {
            BackButton._sceneIndex = -1;
            BackButton.refreshButton();
            BackButton._scrollNode = this.node.getParent().getChildByPath('Canvas/ScrollView') as Node;
            if (BackButton._scrollNode) {
                BackButton._scrollCom = BackButton._scrollNode.getComponent(ScrollViewComponent);
                BackButton._scrollCom._content.getComponent(LayoutComponent).updateLayout();
                BackButton._scrollCom.scrollToOffset(BackButton.offset, 0.1, true);
            }
            BackButton._blockInput.active = false;
        }.bind(this));
    }

    public nextscene () {
        BackButton._blockInput.active = true;
        this.updateSceneIndex(true);
        director.loadScene(this.getSceneName(), () => {
            BackButton._blockInput.active = false;
        });
    }

    public prescene () {
        BackButton._blockInput.active = true;
        this.updateSceneIndex(false);
        director.loadScene(this.getSceneName(), () => {
            BackButton._blockInput.active = false;
        });
    }

    public updateSceneIndex (next: Boolean) {
        if (next) {
            (BackButton._sceneIndex + 1) >= sceneArray.length ? BackButton._sceneIndex = 0 : BackButton._sceneIndex += 1;
        }else {
            (BackButton._sceneIndex - 1) < 0 ? BackButton._sceneIndex = sceneArray.length - 1 : BackButton._sceneIndex -= 1;
        }

        this.updateTitle();
    }

    public updateTitle () {
        if (BackButton._sceneIndex === -1) {
            if (BackButton.instance!.title) {
                BackButton.instance!.title.node.active = false;
                BackButton.instance!.title.string = '';
            }
        } else {
            if (BackButton.instance!.title) {
                BackButton.instance!.title.node.active = true;
                BackButton.instance!.title.string = BackButton.instance!.getSceneName();
            }
        }
    }

    public getSceneName () {
        return sceneArray[BackButton._sceneIndex];
    }
}
