import { _decorator, Assembler, RenderData } from 'cc';
export default class PageEffectAssemblerBase extends Assembler {
// // 普通四边形的属性，根据实际的顶点格式、数量调整
    protected verticesCount = 4;
    protected indicesCount = 6;
    protected floatsPerVert = 5;
    protected colorOffset = 4;    
    protected renderData: RenderData | null = null;
    get verticesFloats() {
        return this.verticesCount * this.floatsPerVert;
    }
    getBuffer() {
// //@ts-ignore
        return cc.renderer._handle.getBuffer("mesh", this.getVfmt());
    }
    getVfmt() {
// // to be overwrite
        return null;
    }
    updateColor(comp, color) {
        let uintVerts = this.renderData.uintVDatas[0];
        if (!uintVerts) return;
        color = color != null ? color : comp.node.color._val;
        let floatsPerVert = this.floatsPerVert;
        let colorOffset = this.colorOffset;
        for (let i = colorOffset, l = uintVerts.length; i < l; i += floatsPerVert) {
        uintVerts[i] = color;
        }
    }
    updateIsFront(comp, dataOffset) {
        let verts = this.renderData.vDatas[0];
        let index = 0;
        let floatsPerVert = this.floatsPerVert;
        for (let i = 0, n = this.verticesCount; i < n; ++i) {
        index = i * floatsPerVert;
        let isFirstVert = i % 2 === 0;
        let firstVertX = isFirstVert ? verts[index] : verts[index - floatsPerVert];
        let secondVertX = isFirstVert ? verts[index + floatsPerVert] : verts[index];
        let isFront = firstVertX < secondVertX ? 1.0 : 0.0;
        verts[index + dataOffset] = isFront;
        }
    }
    
    initData() {
// //@ts-ignore
        this.renderData = new cc.RenderData();
        this.renderData.init(this);

        let data = this.renderData;
// // createFlexData支持创建指定格式的renderData
        data.createFlexData(0, this.verticesCount, this.indicesCount, this.getVfmt());

// // 顶点数固定的情况下索引不变化
        let indices = data.iDatas[0];
        let count = indices.length / 6;
        for (let i = 0, idx = 0; i < count; i++) {
        let vertextID = i * 4;
        indices[idx++] = vertextID;
        indices[idx++] = vertextID+1;
        indices[idx++] = vertextID+2;
        indices[idx++] = vertextID+1;
        indices[idx++] = vertextID+3;
        indices[idx++] = vertextID+2;
        }
    }
    fillBuffers(comp, renderer) {
        let renderData = this.renderData;
        let vData = renderData.vDatas[0];
        let iData = renderData.iDatas[0];

        let buffer = this.getBuffer();
        let offsetInfo = buffer.request(this.verticesCount, this.indicesCount);

        let vertexOffset = offsetInfo.byteOffset >> 2,
        vbuf = buffer._vData;

        if (vData.length + vertexOffset > vbuf.length) {
        vbuf.set(vData.subarray(0, vbuf.length - vertexOffset), vertexOffset);
        } else {
        vbuf.set(vData, vertexOffset);
        }

        let ibuf = buffer._iData,
        indiceOffset = offsetInfo.indiceOffset,
        vertexId = offsetInfo.vertexOffset;
        for (let i = 0, l = iData.length; i < l; i++) {
        ibuf[indiceOffset++] = vertexId + iData[i];
        }
    }
}


/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// export default class PageEffectAssemblerBase extends cc.Assembler {
//     // 普通四边形的属性，根据实际的顶点格式、数量调整
//     protected verticesCount = 4;
//     protected indicesCount = 6;
//     protected floatsPerVert = 5;
// 
//     protected colorOffset = 4;    
//     protected renderData: cc.RenderData = null;
// 
//     get verticesFloats() {
//         return this.verticesCount * this.floatsPerVert;
//     }
// 
//     getBuffer() {
//         //@ts-ignore
//         return cc.renderer._handle.getBuffer("mesh", this.getVfmt());
//     }
// 
//     getVfmt() {
//         // to be overwrite
//         return null;
//     }
// 
//     updateColor(comp, color) {
//         let uintVerts = this.renderData.uintVDatas[0];
//         if (!uintVerts) return;
//         color = color != null ? color : comp.node.color._val;
//         let floatsPerVert = this.floatsPerVert;
//         let colorOffset = this.colorOffset;
//         for (let i = colorOffset, l = uintVerts.length; i < l; i += floatsPerVert) {
//             uintVerts[i] = color;
//         }
//     }
// 
//     updateIsFront(comp, dataOffset) {
//         let verts = this.renderData.vDatas[0];
//         let index = 0;
//         let floatsPerVert = this.floatsPerVert;
//         for (let i = 0, n = this.verticesCount; i < n; ++i) {
//             index = i * floatsPerVert;
//             let isFirstVert = i % 2 === 0;
//             let firstVertX = isFirstVert ? verts[index] : verts[index - floatsPerVert];
//             let secondVertX = isFirstVert ? verts[index + floatsPerVert] : verts[index];
//             let isFront = firstVertX < secondVertX ? 1.0 : 0.0;
//             verts[index + dataOffset] = isFront;
//         }
//     }
//     
//     initData() {
//         //@ts-ignore
//         this.renderData = new cc.RenderData();
//         this.renderData.init(this);
// 
//         let data = this.renderData;
//         // createFlexData支持创建指定格式的renderData
//         data.createFlexData(0, this.verticesCount, this.indicesCount, this.getVfmt());
// 
//         // 顶点数固定的情况下索引不变化
//         let indices = data.iDatas[0];
//         let count = indices.length / 6;
//         for (let i = 0, idx = 0; i < count; i++) {
//             let vertextID = i * 4;
//             indices[idx++] = vertextID;
//             indices[idx++] = vertextID+1;
//             indices[idx++] = vertextID+2;
//             indices[idx++] = vertextID+1;
//             indices[idx++] = vertextID+3;
//             indices[idx++] = vertextID+2;
//         }
//     }
// 
//     fillBuffers(comp, renderer) {
//         let renderData = this.renderData;
//         let vData = renderData.vDatas[0];
//         let iData = renderData.iDatas[0];
// 
//         let buffer = this.getBuffer();
//         let offsetInfo = buffer.request(this.verticesCount, this.indicesCount);
// 
//         let vertexOffset = offsetInfo.byteOffset >> 2,
//             vbuf = buffer._vData;
// 
//         if (vData.length + vertexOffset > vbuf.length) {
//             vbuf.set(vData.subarray(0, vbuf.length - vertexOffset), vertexOffset);
//         } else {
//             vbuf.set(vData, vertexOffset);
//         }
// 
//         let ibuf = buffer._iData,
//             indiceOffset = offsetInfo.indiceOffset,
//             vertexId = offsetInfo.vertexOffset;
//         for (let i = 0, l = iData.length; i < l; i++) {
//             ibuf[indiceOffset++] = vertexId + iData[i];
//         }
//     }
// }
