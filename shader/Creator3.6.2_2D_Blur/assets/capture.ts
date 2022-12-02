import { _decorator, Component, director, Node, find, UITransform, RenderTexture, gfx, ImageAsset, Sprite, SpriteFrame, Texture2D, view, Color, Camera, Vec3, tween, Vec2, Canvas, Material } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NewComponent')
export class NewComponent extends Component {

    @property(Node)
    copyNode: Node | null = null;


    // 设置显示区域
    ShowRange(data) {
         // 获取材质实例对象进行设置
         let mat = this.copyNode.getComponent(Sprite).getMaterialInstance(0);      
         
         mat.setProperty('radius', data.progress)
    }
}

