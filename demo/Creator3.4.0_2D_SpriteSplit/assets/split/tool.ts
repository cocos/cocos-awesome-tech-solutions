
import * as SplitHelper from "./helper"
import { SplitRender } from './render';

import { _decorator, Component, Node, Texture2D, Graphics, Vec2, view, Vec3, SpriteFrame, EventTouch, v2, tween, Camera, color, Layers, profiler } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;

@ccclass('ToolsSplit')
export default class ToolsSplit extends Component {
    @property(Node)
    textureRoot: Node = null;

    @property(Graphics)
    graphics: Graphics = null;

    @property(SpriteFrame)
    pic: SpriteFrame = null;

    @property(Camera)
    cam: Camera = null;

    private textures: SplitRender[] = [];
    private startPoint: Vec2 = null;
    private endPoint: Vec2 = null;

    start() {
        profiler.hideStats();

        this.init();
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.graphics.node.setPosition(new Vec3(-view.getVisibleSize().width / 2, -view.getVisibleSize().height / 2));
    }

    init() {
        let node = new Node();
        let t = node.addComponent(SplitRender);
        node.parent = this.textureRoot;
        node.layer = Layers.Enum.UI_2D;
        t.spriteFrame = this.pic;
        this.textures.push(t);
    }

    onTouchStart(e: EventTouch) {
        this.startPoint = e.getUILocation();     
    }

    onTouchMove(e: EventTouch) {
        this.graphics.clear();
        this.graphics.moveTo(this.startPoint.x, this.startPoint.y);
        let p = e.getUILocation();
        this.graphics.lineTo(p.x, p.y);
        this.graphics.stroke();        
    }

    onTouchEnd(e: EventTouch) {
        this.graphics.clear();
        this.endPoint = e.getUILocation();
        this.useLineCutPolygon(this.startPoint, this.endPoint);
    }

    private doSplit() {
        let h = this.pic.height, w = this.pic.width;
        for (let i = 0; i < 15; i++) {
            let p0 = v2(-(w / 2 + 10), (Math.random() * h) - h / 2);
            let p1 = v2(w / 2 + 10, (Math.random() * h) - h / 2);
            this.useLineCutPolygon(p0, p1, false);
        }

        for (let i = 0; i < 15; i++) {
            let p0 = v2(Math.random() * w - w / 2, -(h / 2 + 10));
            let p1 = v2(Math.random() * w - w / 2, (h / 2 + 10));
            this.useLineCutPolygon(p0, p1, false);
        }
    }

    private useLineCutPolygon(p0: Vec2, p1: Vec2, isWorld = true) {
        for (let i = this.textures.length - 1; i >= 0; i--) {
            let texture = this.textures[i];
            let pa = p0.clone();
            let pb = p1.clone();
            if (isWorld) {
                let mat = texture.node.worldMatrix.clone().invert();
                pa = pa.transformMat4(mat);
                pb = pb.transformMat4(mat);
            }
            let polygons = SplitHelper.lineCutPolygon(pa, pb, texture.polygon);
            if (polygons.length <= 0) continue;
            this.splitTexture(texture, polygons);
        }
    }

    private splitTexture(texture: SplitRender, polygons: Vec2[][]) {
        texture.polygon = polygons[0];
        for (let i = 1; i < polygons.length; i++) {
            let node = new Node();
            node.layer = Layers.Enum.UI_2D;
            let t = node.addComponent(SplitRender);
            node.parent = this.textureRoot;
            node.setPosition(new Vec3(texture.node.position.x, texture.node.position.y));
            t.spriteFrame = this.pic;
            t.polygon = polygons[i];
            this.textures.push(t);
        }
    }

    onClickFly() {
        for (let i = 0; i < this.textures.length; i++) {
            let center = this.getPolygonCenter(this.textures[i].polygon);
            let dir = center.normalize();
            tween(this.textures[i].node).by(0.5, { position: new Vec3(dir.x * 100, dir.y * 100, 0) }).start();
        }
    }

    onClickReset() {
        for (let i = 0; i < this.textures.length; i++) {
            let center = this.getPolygonCenter(this.textures[i].polygon);
            let dir = center.normalize();
            tween(this.textures[i].node).by(0.5, { position: new Vec3(-dir.x * 100, -dir.y * 100, 0) }).call(() => {
                if (i === this.textures.length - 1) {
                    this.textureRoot.destroyAllChildren();
                    this.textureRoot.removeAllChildren();
                    this.textures = [];
                    this.init();
                }
            }).start();
        }
    }

    onFallDown() {
        for (let i = 0; i < this.textures.length; i++) {
            let center = this.getPolygonCenter(this.textures[i].polygon);
            tween(this.textures[i].node).delay((center.y + this.pic.height) / this.pic.height).by(2, { position: new Vec3(0, -500, 0) }, { easing: 'circIn' }).start();
        }
    }
    onResetFallDown() {
        this.textureRoot.destroyAllChildren();
        this.textureRoot.removeAllChildren();
        this.textures = [];
        this.init();   
    }

    private getPolygonCenter(polygon: Vec2[]) {
        let x = 0, y = 0;
        for (let i = 0; i < polygon.length; i++) {
            x += polygon[i].x;
            y += polygon[i].y;
        }
        x = x / polygon.length;
        y = y / polygon.length;
        return v2(x, y)
    }
}
