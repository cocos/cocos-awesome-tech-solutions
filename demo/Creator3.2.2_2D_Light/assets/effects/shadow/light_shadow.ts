
import { _decorator, Component, Node, RenderTexture, Sprite, view } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('LightShadow')
@executeInEditMode
export class LightShadow extends Component {
    @property(RenderTexture)
    rt: RenderTexture = null!;

    @property(Sprite)
    spr: Sprite = null!;

    start() {        
        if (this.spr) {
            var m = this.spr.customMaterial;
            m.setProperty('light_shadow', this.rt.getGFXTexture());
        }
    }
}
