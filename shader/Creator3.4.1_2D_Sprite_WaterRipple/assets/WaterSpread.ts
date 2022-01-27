
import { _decorator, Component, Node, Material, Sprite, EventTouch, UITransform, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WaterSpread')
export class WaterSpread extends Component {

    @property(Node)
    bg !: Node;

    material !: Material;
    waveOffset: number = 0.0;

    onLoad() {
        this.material = this.bg!.getComponent(Sprite)!.customMaterial!;
        this.bg.on(Node.EventType.TOUCH_END, this.touchStartEvent, this);
    }

    touchStartEvent(evt: EventTouch) {
        let pos = evt.getUILocation();
        let width = this.bg.getComponent(UITransform)!.contentSize.width;
        let height = this.bg.getComponent(UITransform)!.contentSize.height;
        if (this.material) {
            this.material.setProperty('center', new Vec2(pos.x / width, (height - pos.y) / height));
        }
        this.waveOffset = 0.0;
    }

    update(dt: number) {
        if (this.waveOffset > 2.0) return;

        this.waveOffset += dt;
        if (this.material) {
            this.material.setProperty('wave_offset', this.waveOffset);
        }
    }
}

