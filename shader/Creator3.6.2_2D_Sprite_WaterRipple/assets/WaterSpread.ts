
import { _decorator, Component, Node, Material, Sprite, EventTouch, UITransform, Vec2, macro } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('WaterSpread')
export class WaterSpread extends Component {

    @property(Node)
    bg !: Node;

    material !: Material;
    waveOffset: number = 0.0;

    onLoad() {
        this.material = this.bg!.getComponent(Sprite)!.customMaterial!;

        this.schedule(() => {
            this.waveOffset = 0.0;
            if (this.material) {
                this.material.setProperty('center', new Vec2(0.5, 0.5));
            }
        }, 1, Infinity);
    }

    update(dt: number) {
        if (this.waveOffset > 2.0) return;

        this.waveOffset += dt;
        if (this.material) {
            this.material.setProperty('wave_offset', this.waveOffset);
        }
    }
}

