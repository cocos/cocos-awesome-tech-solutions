
import { _decorator, Component, Node, Sprite, math, UITransform, Label, Vec2, Vec3, Vec4, Material } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('LightBody')
@executeInEditMode
export class LightBody extends Component {
    @property(Material)
    mat_copy: Material = null!

    onLoad() {
        var mat = new Material; mat.copy(this.mat_copy);
        this.getComponent(Sprite).customMaterial = mat;
    }
}
