
import * as SplitHelper from "./helper"
import { _decorator, Node, Renderable2D, Vec3, IAssembler, ccenum, Vec2, Mat4, Texture2D, v2, v3, EventTouch, gfx, SpriteFrame } from 'cc';

const { ccclass, property, executeInEditMode } = _decorator;

const vec3_temps: Vec3[] = [];
for (let i = 0; i < 4; i++) {
    vec3_temps.push(new Vec3());
}

class AssemblerSplit implements IAssembler {
    createData(com: SplitRender) {
        let vertexCount = 4;
        let indexCount = 6;

        const renderData = com.requestRenderData();
        renderData.dataLength = vertexCount;
        renderData.resize(vertexCount, indexCount);
        return renderData;
    }

    resetData(com: SplitRender) {
        let points = com.polygon;
        if (!points || points.length < 3) return;

        let vertexCount = points.length;
        let indexCount = vertexCount + (vertexCount - 3) * 2;

        com.renderData.clear();
        com.renderData.dataLength = vertexCount;
        com.renderData.resize(vertexCount, indexCount);

        let material = com.renderData.material;
        com.renderData.material = material;
    }

    updateRenderData(com: SplitRender) {
        // dynamicAtlasManager.packToDynamicAtlas(com, frame);
        const renderData = com.renderData;
        if (renderData.vertDirty) {
            this.resetData(com);
            this.updateVertexData(com);
            this.updateUvs(com);
            this.updateColor(com);
            renderData.updateRenderData(com, com.spriteFrame);
        }
    }

    updateWorldVerts(com: SplitRender, verts: Float32Array) {
        let floatsPerVert = 9;

        let matrix: Mat4 = com.node.worldMatrix;
        let a = matrix.m00, b = matrix.m01, c = matrix.m04, d = matrix.m05,
            tx = matrix.m12, ty = matrix.m13;

        let justTranslate = a === 1 && b === 0 && c === 0 && d === 1;
        if (justTranslate) {
            let polygon = com.polygon;
            for (let i = 0; i < polygon.length; i++) {
                verts[i * floatsPerVert] = polygon[i].x + tx;
                verts[i * floatsPerVert + 1] = polygon[i].y + ty;
            }
        } else {
            let polygon = com.polygon;
            for (let i = 0; i < polygon.length; i++) {
                verts[i * floatsPerVert] = a * polygon[i].x + c * polygon[i].y + tx;
                verts[i * floatsPerVert + 1] = b * polygon[i].x + d * polygon[i].y + ty;
            }
        }

        // @ts-ignore
        com.node._uiProps.uiTransformDirty = false;
    }

    fillBuffers(com: SplitRender, renderer: any) {
        const chunk = com.renderData.chunk;
        // indices generated
        let indicesArr = SplitHelper.splitPolygon(com.polygon);
        this.updateWorldVerts(com, chunk.vb);

        // quick version
        const bid = chunk.bufferId;
        const vid = chunk.vertexOffset;
        const meshBuffer = chunk.vertexAccessor.getMeshBuffer(bid);
        const ib = chunk.vertexAccessor.getIndexBuffer(bid);
        let indexOffset = meshBuffer.indexOffset;

        // fill indices
        for (let i = 0, l = indicesArr.length; i < l; i++) {
            ib[indexOffset++] = vid + indicesArr[i];
        }
        meshBuffer.indexOffset += indicesArr.length;
    }

    updateVertexData(com: SplitRender) {
        const renderData = com.renderData;
        if (!renderData) {
            return;
        }
        const dataList = renderData.data;

        let polygon = com.polygon;
        for (let i = 0; i < polygon.length; i++) {
            dataList[i].x = polygon[i].x;
            dataList[i].y = polygon[i].y;
        }

        const chunk = com.renderData.chunk;
        const vid = chunk.vertexOffset;
        const ib = chunk.ib as any;

        let indicesArr = SplitHelper.splitPolygon(com.polygon);
        for (let i = 0, l = indicesArr.length; i < l; i++) {
            ib[i] = vid + indicesArr[i];
        }
    }

    updateUvs(com: SplitRender) {
        let uvOffset = 3, floatsPerVert = 9;
        const vData = com.renderData.chunk.vb;

        let uvs = [];
        if (com.spriteFrame.texture) {
            uvs = SplitHelper.computeUv(com.polygon, com.spriteFrame.texture.width, com.spriteFrame.texture.height)
        }

        let polygon = com.polygon;
        for (let i = 0; i < polygon.length; i++) {
            vData[uvOffset] = uvs[i].x;
            vData[uvOffset + 1] = uvs[i].y;
            uvOffset += floatsPerVert;
        }
    }

    updateColor(com: SplitRender) {
        const renderData = com.renderData!;

        let colorOffset = 5, floatsPerVert = renderData.floatStride;
        let vData = renderData.chunk.vb;

        const color = com.color;
        const colorR = color.r / 255;
        const colorG = color.g / 255;
        const colorB = color.b / 255;
        const colorA = color.a / 255;

        let polygon = com.polygon;
        for (let i = 0; i < polygon.length; i++) {
            vData![colorOffset] = colorR;
            vData![colorOffset + 1] = colorG;
            vData![colorOffset + 2] = colorB;
            vData![colorOffset + 3] = colorA;
            colorOffset += floatsPerVert;
        }
    }
};

enum TextureType {
    Cut,            // 裁剪
    Stretch         // 拉伸, 暂未实现
}
ccenum(TextureType);

let _vec2_temp = new Vec2();
let _mat4_temp = new Mat4();

@ccclass('SplitRender')
@executeInEditMode
export class SplitRender extends Renderable2D {
    static Type = TextureType;

    @property({ type: SpriteFrame, serializable: true })
    protected _spriteFrame: SpriteFrame | null = null;
    @property({ type: SpriteFrame, serializable: true })
    get spriteFrame() {
        return this._spriteFrame;
    }

    set spriteFrame(value) {
        if (!value || this._spriteFrame === value) {
            this._spriteFrame = value;
            return;
        }

        this._spriteFrame = value;

        let l = -value.width / 2, b = -value.height / 2, t = value.height / 2, r = value.width / 2;
        this.polygon = [v2(l, b), v2(r, b), v2(r, t), v2(l, t)];

        this.markForUpdateRenderData(false);
        this._applySpriteSize();
    }

    @property({ type: TextureType, serializable: true })
    _type: TextureType = 0;
    @property({ type: TextureType, serializable: true })
    get type() {
        return this._type;
    }
    set type(val: TextureType) {
        this._type = val;
        this.markForUpdateRenderData();
    }

    @property
    editing: boolean = false;

    @property({ type: [Vec2], serializable: true })
    _polygon: Vec2[] = [];
    @property({ type: [Vec2], serializable: true })
    public get polygon() {
        return this._polygon;
    }
    public set polygon(points: Vec2[]) {
        this._polygon = points;
        this.markForUpdateRenderData();
    }

    protected _assembler: IAssembler = null;

    constructor() {
        super();
    }

    onLoad() {
        this._renderEntity.setNode(this.node);
        this.node['_hitTest'] = this._hitTest.bind(this);
    }

    start() {
        // this.node.on(Node.EventType.TOUCH_START, (e: EventTouch) => {
        //     console.log("click texture plus -");
        // }, this);

        // this.node.on(Node.EventType.TOUCH_MOVE, (e: EventTouch) => {
        //     console.log("click texture plus +");
        //     this.node.setPosition(v3(this.node.position.x + e.getDeltaX(),
        //         this.node.position.y + e.getDeltaY(),
        //         this.node.position.z));
        // }, this);
        console.log(this.node.uuid);
    }

    _hitTest(cameraPt: Vec2) {
        let node = this.node;
        let testPt = _vec2_temp;

        node.updateWorldTransform();
        // If scale is 0, it can't be hit.
        if (!Mat4.invert(_mat4_temp, node.worldMatrix)) {
            return false;
        }

        Vec2.transformMat4(testPt, cameraPt, _mat4_temp);
        return SplitHelper.isInPolygon(testPt, this.polygon);
    }

    private _applySpriteSize() {
        if (this._spriteFrame) {
            const size = this._spriteFrame.originalSize;
            this.node._uiProps.uiTransformComp!.setContentSize(size);
        }

        this._activateMaterial();
    }

    private _activateMaterial() {
        const spriteFrame = this._spriteFrame;
        const material = this.getRenderMaterial(0);
        if (spriteFrame) {
            if (material) {
                this.markForUpdateRenderData();
            }
        }

        if (this.renderData) {
            this.renderData.material = material;
        }
    }

    protected _render(render: any) {
        render.commitComp(this, this.renderData, this._spriteFrame, this._assembler!);
    }

    protected _canRender() {
        if (!super._canRender()) {
            return false;
        }

        const spriteFrame = this._spriteFrame;
        if (!spriteFrame || !spriteFrame.texture) {
            return false;
        }

        return true;
    }

    protected _flushAssembler(): void {
        if (this._assembler == null) {
            this.destroyRenderData();
            this._assembler = new AssemblerSplit();
        }

        if (!this.renderData) {
            if (this._assembler && this._assembler.createData) {
                this._renderData = this._assembler.createData(this);
                this.renderData!.material = this.getRenderMaterial(0);
                this.markForUpdateRenderData();
                this._updateColor();
            }
        }
    }

    protected updateMaterial() {
        if (this._customMaterial) {
            this.setMaterial(this._customMaterial, 0);
            // this._customMaterial.overridePipelineStates({ priority: 128 }, 0);
            // this._blendHash = -1;
            return;
        }
        const mat = this._updateBuiltinMaterial();
        this.setMaterial(mat, 0);
        this._updateBlendFunc();
    }
}
