import { _decorator, gfx, UIRenderable, Vec2 } from 'cc';
import PageEffectAssemblerBase from "./page-effect-assembler-base";

let vfmtPosUvColorFront = new gfx.VertexFormat([
    { name: gfx.ATTR_POSITION, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
    { name: gfx.ATTR_UV0, type: gfx.ATTR_TYPE_FLOAT32, num: 2 },
    { name: gfx.ATTR_COLOR, type: gfx.ATTR_TYPE_UINT8, num: 4, normalize: true },
    { name: "a_isFront", type: gfx.ATTR_TYPE_FLOAT32, num: 1},
]);

export default class BezierAssembler extends PageEffectAssemblerBase {
    protected angle:number = 0
    public updateRenderData (comp: any) {
        if (comp) {
                let pointNum: number = comp.getPointCount()
                if (pointNum < 2) {
                        return
                }

                let node = comp.node
                let height = node.height
                let width = node.width
        // 左下角的坐标
        let posX = - width * node.anchorX
        let posY = - height * node.anchorY
        // 根据角度获得控制点的位置
        let ctrlPosData = this._getCtrlPosByAngle(width)
        let startPos = ctrlPosData.startPos
        let endPos = ctrlPosData.endPos
        let ctrlPos1 = ctrlPosData.ctrlPos1
        let ctrlPos2 = ctrlPosData.ctrlPos2
// // 记录各个顶点的位置
        let bezierPosList: cc.Vec2[] = []
        bezierPosList[0] = startPos
// // 当前所有顶点连线的总长
        let realWidth = 0
// // 上一个点的纹理坐标
        let lastU = 0
// // 下一个点的纹理坐标
        let nextU = 0

        let floatsPerVert = this.floatsPerVert;
        let verts = this.renderData.vDatas[0];
// // 写verts时的下标
        let dstOffset = 0;
        for (let i = 1; i < pointNum; i++) {
        let isTail = i === pointNum - 1
        let lastBezierPos = bezierPosList[i - 1]
        let nextBezierPos = this._getBezierPos(i / (pointNum - 1) , startPos, endPos, ctrlPos1, ctrlPos2)
        let fixedData = this._fixWidth(lastBezierPos, nextBezierPos, width, realWidth, isTail)
        let gapWidth = fixedData.gapWidth
        nextBezierPos = fixedData.nextBezierPos
        realWidth += gapWidth
        bezierPosList[i] = nextBezierPos
// // 根据当前小矩形的宽度占总长度的比例来计算纹理坐标的间隔
        let gapU = gapWidth / width
        nextU = lastU + gapU
        /*
          分别计算小矩形四个顶点的坐标和纹理坐标
          各顶点的坐标计算方法为在左下角坐标的基础上加上顶点在贝塞尔曲线上的坐标，如果是书页顶部的顶点则还要加上书页的高度
        */

        // 将4个顶点数据写入verts
        dstOffset = floatsPerVert * (i-1) * 4;
        verts[dstOffset]     = posX + lastBezierPos.x;
        verts[dstOffset + 1] = posY + lastBezierPos.y;
        verts[dstOffset + 2] = lastU;
        verts[dstOffset + 3] = 1;
        dstOffset += floatsPerVert;

        verts[dstOffset]     = posX + nextBezierPos.x;
        verts[dstOffset + 1] = posY + nextBezierPos.y;
        verts[dstOffset + 2] = nextU;
        verts[dstOffset + 3] = 1;
        dstOffset += floatsPerVert;

        verts[dstOffset]     = posX + lastBezierPos.x;
        verts[dstOffset + 1] = posY + height + lastBezierPos.y;
        verts[dstOffset + 2] = lastU;
        verts[dstOffset + 3] = 0;
        dstOffset += floatsPerVert;

        verts[dstOffset]     = posX + nextBezierPos.x;
        verts[dstOffset + 1] = posY + height + nextBezierPos.y;
        verts[dstOffset + 2] = nextU;
        verts[dstOffset + 3] = 0;

        lastU = nextU
        }

        this.updateColor(comp, null);
        this.updateIsFront(comp, 5);
        }
    }

    init(comp: UIRenderable) {
        super.init(comp);

// //@ts-ignore
        let segmentCount = comp.getPointCount() - 1;
        this.verticesCount = 4 * segmentCount;
        this.indicesCount = 6 * segmentCount;
        this.floatsPerVert = 6;

        this.initData();
    }
    getVfmt() {
        return vfmtPosUvColorFront;
    }
    private _getCtrlPosByAngle(width: number): {startPos: Vec2, endPos: Vec2, ctrlPos1: Vec2, ctrlPos2: Vec2} {
        let startPos = new cc.Vec2(0, 0)
        let endPos = null
        let ctrlPos1 = null
        let ctrlPos2 = null
        let rad = this.angle * Math.PI / 180
        let per = rad * 2 / Math.PI
        if(this.angle <= 90) {
// // 终点的x坐标变换 width => 0，速度先慢后快，使用InCubic缓动函数
        let endPosX = width * (1 - Math.pow(per, 3))
// // InCubic
// // 终点的y坐标变换 0 => width / 4, 速度先快后慢，使用OutQuart缓动函数
        let endPosY = width / 4 * (1 - Math.pow(1 - per, 4))
        endPos = new cc.Vec2(endPosX, endPosY)

// // 中间两个控制点坐标匀速变换
// // x坐标 width => width * 3 / 4
        let ctrlPosX = width * (1 - 1 / 4 * per)
// // 控制点1y坐标 0 => width / 16
        let ctrlPos1Y = width * 1 / 16 * per
// // 控制点2y坐标 0 => width * 3 / 16
        let ctrlPos2Y = width * 3 / 16 * per
        ctrlPos1 = new cc.Vec2(ctrlPosX, ctrlPos1Y)
        ctrlPos2 = new cc.Vec2(ctrlPosX, ctrlPos2Y)
        } else {
        per = per - 1
// // 终点的x坐标变换 0 => width，速度先快后慢，使用OutCubic缓动函数
        let endPosX = - width * (1 - Math.pow(1 - per, 3))
// // 终点的y坐标变换 width / 4 => 0, 速度先慢后快，使用InQuart缓动函数
        let endPosY = width / 4 * (1 - Math.pow(per, 4))
        endPos = new cc.Vec2(endPosX, endPosY)

// // 控制点1x坐标 width * 3 / 4 => 0
        let ctrlPos1X = width * 3 / 4 * (1 - per)
// // 控制点2x坐标 width * 3 / 4 => 0
        let ctrlPos2X = width * 3 / 4 * Math.pow(1 - per, 3)
// // 控制点1y坐标 width / 16 => 0
        let ctrlPos1Y = width * 1 / 16 *  (1 - per)
// // 控制点2y坐标 width * 3 / 16 => 0
        let ctrlPos2Y = width * 3 / 16 * (1 - Math.pow(per, 4))
        ctrlPos1 = new cc.Vec2(ctrlPos1X, ctrlPos1Y)
        ctrlPos2 = new cc.Vec2(ctrlPos2X, ctrlPos2Y)
        }

        return {
        startPos: startPos,
        endPos: endPos,
        ctrlPos1: ctrlPos1,
        ctrlPos2: ctrlPos2
        }
    }
// // 修正宽度
    private _fixWidth(lastBezierPos: Vec2, nextBezierPos: Vec2, width: number, realWidth: number, isTail: boolean) {
        let deltaVector = nextBezierPos.sub(lastBezierPos)
// // 两个顶点的间距
        let gapWidth = deltaVector.mag()
// // 当前的总长
        let curWidth = realWidth + gapWidth
        if(isTail) {
// // 如果是最后一个顶点则将总长度修正至书页的真实宽度
        gapWidth = width - realWidth
        let direction = deltaVector.normalize()
        nextBezierPos = lastBezierPos.add(direction.mul(gapWidth))
        } else if(curWidth >= width) {
// // 如果当前总长超过了书页的真实宽度，就衰减超过部分的1.1倍
        let delta = curWidth - width
        gapWidth = gapWidth - delta * 1.1
        gapWidth = Math.max(0, gapWidth)
        let direction = deltaVector.normalize()
        nextBezierPos = lastBezierPos.add(direction.mul(gapWidth))
        }

        return {
        gapWidth: gapWidth,
        nextBezierPos: nextBezierPos,
        }
    }
    
    // 贝塞尔曲线公式
    private _getBezierPos(t: number, startPos: Vec2, endPos: Vec2, ctrlPos1: Vec2, ctrlPos2: Vec2): Vec2 {
        startPos = startPos.mul(Math.pow(1 - t, 3))
        ctrlPos1 = ctrlPos1.mul(3 * t * Math.pow(1 - t, 2))
        ctrlPos2 = ctrlPos2.mul(3 * (1 - t) * Math.pow(t, 2))
        endPos = endPos.mul(Math.pow(t, 3))
        return startPos.add(ctrlPos1.add(ctrlPos2.add(endPos)))
    }
}
