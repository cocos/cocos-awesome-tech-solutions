
import { _decorator, Component, Node, Sprite, Camera, RenderTexture, view, UITransform, Vec2, SpriteFrame, find } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('LightShadow')
// @executeInEditMode
export class LightShadow extends Component {
    @property(Camera)
    picture: Camera = null;

    @property(Camera)
    shadow_1dmap: Camera = null;

    @property(Sprite)
    picture_1dmap_gen: Sprite = null;

    @property(Sprite)
    render_1dmap: Sprite = null;

    /**
     * 全屏截图，用于生成阴影
     */
    create_picture() {
        let _size = view.getDesignResolutionSize();
        let _pic = new RenderTexture();
        _pic.initialize({
            width: _size.width,
            height: _size.height
        })
        this.picture.targetTexture = _pic;

        let _frame = new SpriteFrame();
        _frame.texture = _pic;

        this.picture_1dmap_gen.spriteFrame = _frame;
    }

    /**
     * 使用全屏截图生成1D Map阴影文件
     */
    create_1dmap() {
        let _size = view.getDesignResolutionSize();
        let _1dmap = new RenderTexture();
        _1dmap.initialize({
            width: _size.width,
            height: _size.height
        })
        this.shadow_1dmap.targetTexture = _1dmap;

        let _frame = new SpriteFrame();
        _frame.texture = _1dmap;
        this.render_1dmap.spriteFrame = _frame;
    }

    start() {
        this.create_picture();
        this.create_1dmap();
    }

    update() {
        let _size = view.getDesignResolutionSize();
        let wpos = this.node.getWorldPosition();

        // 更新生成1dmap的材质配置
        let uitrans = this.picture_1dmap_gen.node.getComponents(UITransform)[0];
        let lpos = uitrans.convertToNodeSpaceAR(wpos);
        let lpos_offset = new Vec2(lpos.x / uitrans.width, lpos.y / uitrans.height);
        this.picture_1dmap_gen.customMaterial.setProperty('light_position', lpos_offset);
        this.picture_1dmap_gen.customMaterial.setProperty('resolution', new Vec2(_size.width, _size.height));

        // 更新生成1dmap的材质配置
        uitrans = this.render_1dmap.node.getComponents(UITransform)[0];
        lpos = uitrans.convertToNodeSpaceAR(wpos);
        lpos_offset = new Vec2(lpos.x / uitrans.width, lpos.y / uitrans.height);
        this.render_1dmap.customMaterial.setProperty('light_position', lpos_offset);
        this.render_1dmap.customMaterial.setProperty('resolution', new Vec2(_size.width, _size.height));
    }
}
