
import { _decorator, Component, Node, Mask, Mat4, Vec2, Vec3, v2, UITransform, ccenum } from 'cc';
const { ccclass, property } = _decorator;

const Polygon = 4;

const _worldMatrix = new Mat4();
const _vec2_temp = new Vec2();
const _mat4_temp = new Mat4();

@ccclass('MaskPlus')
export class MaskPlus extends Mask {

    @property([Vec2])
    _polygon: Vec2[] = [];

    @property({ type: [Vec2] })
    get polygon() {
        return this._polygon;
    }
    set polygon(value: Vec2[]) {
        this._polygon = value;

        this.markForUpdateRenderData(false);
        this._updateGraphics();
        if (this._renderData) {
            this.destroyRenderData();
            this._renderData = null;
        }
    }

    @property({override: true})
    get type() {
        return this._type;
    }

    set type(value) {
        if (this._type === value) {
            return;
        }
        this._type = value;

        if (this._type === <any>Polygon) {
            if (this._polygon.length === 0) {
                let [x, y, width, height] = this._getNodeRect();
                this._polygon.push(v2(x, y), v2(x + width, y), v2(x + width, y + height), v2(x, y + height));
            }
        }

        this.markForUpdateRenderData(false);
        this._updateMaterial();

        if (this._type !== Mask.Type.IMAGE_STENCIL) {
            this._spriteFrame = null;
            this._updateGraphics();
            if (this._renderData) {
                this.destroyRenderData();
                this._renderData = null;
            }
        } else {
            this._useRenderData();

            if (this._graphics) {
                this._graphics.clear();
            }
        }
    }

    _getNodeRect() {
        let width = this.node.getComponent(UITransform)!.width;
        let height = this.node.getComponent(UITransform)!.height;
        let x = -width * this.node.getComponent(UITransform)!.anchorPoint.x;
        let y = -height * this.node.getComponent(UITransform)!.anchorPoint.y;
        return [x, y, width, height];
    }

    _updateGraphics() {
        if (!this._graphics || (this._type !== Mask.Type.RECT && this._type !== Mask.Type.ELLIPSE && this.type !== <any>Polygon)) {
            return;
        }

        const uiTrans = this.node._uiProps.uiTransformComp!;
        const graphics = this._graphics;
        // Share render data with graphics content
        graphics.clear();

        const size = uiTrans.contentSize;
        const width = size.width;
        const height = size.height;
        const ap = uiTrans.anchorPoint;
        const x = -width * ap.x;
        const y = -height * ap.y;
        if (this._type === Mask.Type.RECT) {
            graphics.rect(x, y, width, height);
        } else if (this._type === Mask.Type.ELLIPSE) {
            const center = new Vec3(x + width / 2, y + height / 2, 0);
            const radius = new Vec3(width / 2, height / 2, 0);
            const points = _calculateCircle(center, radius, this._segments);
            for (let i = 0; i < points.length; ++i) {
                const point = points[i];
                if (i === 0) {
                    graphics.moveTo(point.x, point.y);
                } else {
                    graphics.lineTo(point.x, point.y);
                }
            }
            graphics.close();
        }
        else if (this.type === <any>Polygon) {
            this._polygon = this._polygon || [];
            if (this._polygon.length === 0) this._polygon.push(v2(0, 0));
            graphics.moveTo(this._polygon[0].x, this._polygon[0].y);
            for (let i = 1; i < this._polygon.length; i++) {
                graphics.lineTo(this._polygon[i].x, this._polygon[i].y);
            }
            graphics.lineTo(this._polygon[0].x, this._polygon[0].y);
            graphics.close();
        }

        graphics.fill();
    }

    isHit(cameraPt: Vec2) {
        const uiTrans = this.node._uiProps.uiTransformComp!;
        const size = uiTrans.contentSize;
        const w = size.width;
        const h = size.height;
        const testPt = _vec2_temp;

        this.node.getWorldMatrix(_worldMatrix);
        Mat4.invert(_mat4_temp, _worldMatrix);
        Vec2.transformMat4(testPt, cameraPt, _mat4_temp);
        const ap = uiTrans.anchorPoint;
        testPt.x += ap.x * w;
        testPt.y += ap.y * h;

        let result = false;
        if (this.type === Mask.Type.RECT || this.type === Mask.Type.GRAPHICS_STENCIL) {
            result = testPt.x >= 0 && testPt.y >= 0 && testPt.x <= w && testPt.y <= h;
        } else if (this.type === Mask.Type.ELLIPSE) {
            const rx = w / 2;
            const ry = h / 2;
            const px = testPt.x - 0.5 * w;
            const py = testPt.y - 0.5 * h;
            result = px * px / (rx * rx) + py * py / (ry * ry) < 1;
        }
        else if (this.type === <any>Polygon) {
            const px = testPt.x - 0.5 * w;
            const py = testPt.y - 0.5 * h;
            result = _isInPolygon(v2(px, py), this.polygon);
        }

        if (this._inverted) {
            result = !result;
        }

        return result;
    }
}

const _circlePoints: Vec3[] = [];
function _calculateCircle(center: Vec3, radius: Vec3, segments: number) {
    _circlePoints.length = 0;
    const anglePerStep = Math.PI * 2 / segments;
    for (let step = 0; step < segments; ++step) {
        _circlePoints.push(new Vec3(radius.x * Math.cos(anglePerStep * step) + center.x,
            radius.y * Math.sin(anglePerStep * step) + center.y));
    }

    return _circlePoints;
}

function _isInPolygon(checkPoint: Vec2, polygonPoints: Vec2[]) {
    var counter = 0;
    var i;
    var xinters;
    var p1, p2;
    var pointCount = polygonPoints.length;
    p1 = polygonPoints[0];

    for (i = 1; i <= pointCount; i++) {
        p2 = polygonPoints[i % pointCount];
        if (
            checkPoint.x > Math.min(p1.x, p2.x) &&
            checkPoint.x <= Math.max(p1.x, p2.x)
        ) {
            if (checkPoint.y <= Math.max(p1.y, p2.y)) {
                if (p1.x != p2.x) {
                    xinters = (checkPoint.x - p1.x) * (p2.y - p1.y) / (p2.x - p1.x) + p1.y;
                    if (p1.y == p2.y || checkPoint.y <= xinters) {
                        counter++;
                    }
                }
            }
        }
        p1 = p2;
    }
    if (counter % 2 == 0) {
        return false;
    } else {
        return true;
    }
}
