
import { _decorator, Component, Sprite, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CircleAvatar')
export class CircleAvatar extends Component {
    @property(Sprite)
    spf1 !: Sprite;
    @property(Sprite)
    spf2 !: Sprite;

    start () {
        const size1 = this.spf1.node.getComponent(UITransform)!.contentSize;
        let r1 = size1.width / size1.height;
        this.spf1.getMaterial(0)!.setProperty('wh_ratio', r1);

        const size2 = this.spf2.node.getComponent(UITransform)!.contentSize;
        let r2 = size2.width / size2.height;
        this.spf2.getMaterial(0)!.setProperty('wh_ratio', r2);
    }
}

