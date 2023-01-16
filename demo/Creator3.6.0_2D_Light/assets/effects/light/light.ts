
import { _decorator, Component, Node, Sprite, math, UITransform, Label, Vec2, Vec3, Vec4, Camera, view, Material, Texture2D, renderer, color, Color } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('Light')
@executeInEditMode
export class Light extends Component {
    @property([Node])
    bodys_normal: Node[] = [];

    @property([Node])
    bodys: Node[] = [];

    @property(Camera)
    cam: Camera = null!;

    @property(Material)
    eff: Material = null!;

    @property(Material)
    eff_normal: Material = null!;

    onLoad() {
        /*
        // 非法线贴图物体
        var mat = new Material;
        mat.copy(this.eff);
        this.bodys.forEach(spr => {
            spr.getComponent(Sprite).customMaterial = mat;
        })

        // 法线贴图物体
        var mat = new Material;
        mat.copy(this.eff_normal);
        this.bodys_normal.forEach(spr => {
            spr.getComponent(Sprite).customMaterial = mat;
        })
        */
    }

    start() {
        this.updateLight();
    }

    update() {
        this.updateLight();
    }

    getwpos(node2d: Node) {
        //let _pos = new Vec3(node2d.worldPosition.x, node2d.worldPosition.y, node2d.worldPosition.z);        
        // @ts-ignore
        //let _wpos = _pos.transformMat4(this.cam._camera._matViewProj);

        return node2d.worldPosition;
    }

    updateBody(target, lightPos) {
        // 更新uniform
        let spr = target.getComponent(Sprite);

        // 环境光
        // spr.getMaterial(0).setProperty('light_ambientColor', new Color(0, 0, 0, 256));

        // 亮度
        //spr.getMaterial(0).setProperty('light_brightness', 1);

        // 光照半径
        //spr.getMaterial(0).setProperty('light_radius', 15);

        // 灯光位置
        spr.getMaterial(0).setProperty('light_worldpos', new Vec4(lightPos.x, lightPos.y, lightPos.z, 1));
    }

    updateLight() {
        // 光源位置
        let lightPos = this.getwpos(this.node)

        for (var idx in this.bodys_normal) {
            let node = this.bodys_normal[idx];
            if (null == node) return;
            this.updateBody(node, lightPos);
        }

        for (var idx in this.bodys) {
            let node = this.bodys[idx];
            if (null == node) return;
            this.updateBody(node, lightPos);
        }
    }
}
