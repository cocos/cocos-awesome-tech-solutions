import { _decorator, Component, Node, find } from 'cc';
const { ccclass, property,executeInEditMode } = _decorator;
import CCGIF from "./CCGIF";

@ccclass('GifSupport')
export class GifSupport extends Component {
    @property(Node)
    remoteGif: Node | null = null;
    @property(Node)
    localGif: Node | null = null;

    start() {
        find('Canvas/btnPlay').active = false;

        this.localGif.children.map(n => {
            n.getComponent(CCGIF).preload();
        });

        find('Canvas/btnPlay').active = true;        
    }

    playAll() {
        // 本地Gif加载
        this.localGif.children.forEach(v => {
            v.getComponent(CCGIF).stop();
            v.getComponent(CCGIF).play(true);
        });

        // 远程Gif加载
        let url = "https://n.sinaimg.cn/tech/transform/280/w128h152/20210528/d2fb-kquziih9543861.gif";
        this.remoteGif.getComponent(CCGIF).loadUrl(url);
    }
}



