
import { _decorator, Component, Sprite, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CircleAvatar')
export class CircleAvatar extends Component {

    @property(Sprite)
    rectAvatar !: Sprite;

    start () {
        let ratio = this.rectAvatar.node.getComponent(UITransform)!.contentSize.width / this.rectAvatar.node.getComponent(UITransform)!.contentSize.height;
        this.rectAvatar.getMaterial(0)!.setProperty('wh_ratio', ratio);
    }
}

