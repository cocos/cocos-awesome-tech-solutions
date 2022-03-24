import { _decorator, Component, Label, Node, Button, ScrollView, game, director } from 'cc';
import { SceneList } from './SceneList';
const { ccclass, property } = _decorator;

let emptyFunc = function (event) {
    event.stopPropagation();
};
@ccclass('Menu')
export class Menu extends Component {
   
    @property(ScrollView)
    public testList: ScrollView = null;
    _isLoadingScene = false;
    showDebugDraw = false;
    currentSceneUrl = '';
    contentPos = null;
    isMenu = true;
    sceneList
    onLoad() {
        // game.addPersistRootNode(this.node);
        this.currentSceneUrl = 'TestList.fire';
        // game.addPersistRootNode(this.testList.node);
        if (this.testList && this.testList.content) {
            this.sceneList = this.testList.content.getComponent(SceneList);
            this.sceneList.init(this);
        }
    }



    loadScene(url: any) {
        // this._isLoadingScene = true;
        // this.contentPos = this.testList.getContentPosition();
        // this.currentSceneUrl = url;
        // this.isMenu = false;
        // this.testList.node.active = false;
        director.loadScene(url);
    }

    onLoadSceneFinish() {
        // this.testList.node.active = false;
        // if (this.isMenu && this.contentPos) {
        //    this.testList.node.active = true;
        //    this.testList.setContentPosition(this.contentPos);
        // }
        // this._isLoadingScene = false;
    }



}
