import { _decorator, Vec2, v2, UIRenderable, Texture2D } from 'cc';
const {ccclass, property} = _decorator;

import VerletAssembler from "./verlet-assembler";
class PagePoint {
    public oldPos:Vec2
    public newPos:Vec2
    constructor(x:number, y:number){
        this.oldPos = this.newPos = v2(x, y)
    }
}

@ccclass('VerletRender')
export default class VerletRender extends UIRenderable {
    @property({type: [Texture2D], displayName:"纹理"})
    public textureList: Texture2D[] = []
    @property({displayName:"每条边上的顶点数量"})
    public pointsCount:number = 30
    @property({displayName:"纠正次数"})
    public constraintTimes: number = 100
    @property({displayName:"速度衰减系数"})
    public damping: number = 0.1
    @property({displayName:"重力"})
    public gravity: number = 0
    protected _initedMaterial:boolean = false
    private _pointList: PagePoint[] = []
    private _angle: number = 0
    onEnable () {
        super.onEnable();
        this.initPointList();
        this.draw();
    }
    public _resetAssembler() {
        let assembler = this._assembler = new VerletAssembler()
        assembler.init(this)
    }
    protected _updateMaterial() {
        let material = this.getMaterial(0)
        if (material) {
        material.define('CC_USE_MODEL', 1);
        if (this.textureList.length === 2) {
        material.setProperty('texture0', this.textureList[0]);
        material.setProperty('texture1', this.textureList[1]);
        }
        }
    }
    protected updateMaterial () {
        if (this.textureList.length === 2) {
        this._updateMaterial()
        this._initedMaterial = true
        return
        }
    }
    public updateAngle(angle: number) {
        this._angle = angle
    }
    public getPointList() {
        let pointList: cc.Vec2[] = []
        for(let point of this._pointList) {
        pointList.push(new cc.Vec2(point.newPos.x, point.newPos.y))
        }

        return pointList
    }
// // 初始化质点
    public initPointList() {
        for(let i = 0; i < this.pointsCount; ++i) {
        let posX = i / (this.pointsCount - 1) * this.node.width
        this._pointList.push(new PagePoint(posX, 0))
        }
    }
    public update() {
        this.simulate()
        this.applyConstraint()
        this.draw()
    }
// // 使用verlet积分更新位置
    public simulate() {
        let gravity = cc.v2(0, this.gravity)
        for (let i = this.pointsCount - 1; i >= 1; i--) {
        let point = this._pointList[i]
// // 速度等于当前位置与上一个位置的差乘上衰减系数
        let velocity: cc.Vec2 = point.newPos.sub(point.oldPos).mul(this.damping)
// // 模拟一个水平放置的绳子，当y小于等于0时，将不再受重力影响
        if(point.newPos.y <= 0) {
        gravity.y = Math.max(0, gravity.y)
        }
        point.oldPos = point.newPos
        point.newPos = point.newPos.add(velocity)
        point.newPos = point.newPos.add(gravity)
        }
    }
    private _updateEndPos(endPos: Vec2) {
        let tailPoint = this._pointList[this.pointsCount - 1]
        tailPoint.newPos = new cc.Vec2(endPos.x, endPos.y)
    }
    private _getEndPos(): Vec2 {
        let endPos = new cc.Vec2(0, 0)
        let width = this.node.width
        let rad = this._angle * Math.PI / 180

// // 与贝塞尔曲线使用相同的运动轨迹
        let per = rad * 2 / Math.PI
        if(this._angle <= 90) {
        let endPosX = width * (1 - Math.pow(per, 3))
        let endPosY = width * 1 / 4 * (1 - Math.pow(1 - per, 4))
        endPos = new cc.Vec2(endPosX, endPosY)
        } else {
        per = per - 1
        let endPosX = - width * (1 - Math.pow(1 - per, 3))
        let endPosY = width * 1 / 4 * (1 - Math.pow(per, 4))
        endPos = new cc.Vec2(endPosX, endPosY)
        }


        return endPos
    }
// // 约束纠正
    public applyConstraint() {
// // 两个质点之间的固定距离
        let normalDistance = this.node.width / (this.pointsCount - 1)
        let endPos = this._getEndPos()
        for (let t = 0; t < this.constraintTimes; t++) {
        this._updateEndPos(endPos)
// //由最后一个质点开始依次纠正
        for (let i = this.pointsCount - 1; i >= 1; i--) {
        let firstPoint = this._pointList[i - 1]
        let secondPoint = this._pointList[i]
        let delatPos = secondPoint.newPos.sub(firstPoint.newPos)
        let distance = delatPos.mag()
        let fixDirection :cc.Vec2 = null
        if (distance < normalDistance) {
        fixDirection = delatPos.normalize().negate()
        } else if (distance > normalDistance) {
        fixDirection = delatPos.normalize()
        } else {
        continue
        }

        let fixLen = Math.abs(distance - normalDistance)
        if (i == 1) {
// // 由于第一个质点是固定的，所以只对第二个质点做纠正
        let fixVector = fixDirection.mul(fixLen)
        secondPoint.newPos.subSelf(fixVector)
        } else {
// // 将两个质点之间的距离纠正为固定长度
        let fixHalfVector = fixDirection.mul(fixLen * 0.5)
        firstPoint.newPos.addSelf(fixHalfVector)
        secondPoint.newPos.subSelf(fixHalfVector)
        }
        }
        }
    }
    public draw() {
        if (!this._initedMaterial) {
        this.updateMaterial()
        }

        this.setVertsDirty()
    }
}


/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// import VerletAssembler from "./verlet-assembler";
// 
// const {ccclass, property} = cc._decorator;
// 
// class PagePoint {
//     public oldPos:cc.Vec2
//     public newPos:cc.Vec2
// 
//     constructor(x:number, y:number){
//         this.oldPos = this.newPos = cc.v2(x, y)
//     }
// }
// 
// @ccclass
// export default class VerletRender extends cc.RenderComponent {
//     @property({type: [cc.Texture2D], displayName:"纹理"})
//     public textureList: cc.Texture2D[] = []
// 
//     @property({displayName:"每条边上的顶点数量"})
//     public pointsCount:number = 30
// 
//     @property({displayName:"纠正次数"})
//     public constraintTimes: number = 100
// 
//     @property({displayName:"速度衰减系数"})
//     public damping: number = 0.1
// 
//     @property({displayName:"重力"})
//     public gravity: number = 0
// 
//     protected _initedMaterial:boolean = false
//     private _pointList: PagePoint[] = []
//     private _angle: number = 0
//     onEnable () {
//         super.onEnable();
//         this.initPointList();
//         this.draw();
//     }
// 
//     public _resetAssembler() {
//         let assembler = this._assembler = new VerletAssembler()
//         assembler.init(this)
//     }
// 
//     protected _updateMaterial() {
//         let material = this.getMaterial(0)
//         if (material) {
//             material.define('CC_USE_MODEL', 1);
//             if (this.textureList.length === 2) {
//                 material.setProperty('texture0', this.textureList[0]);
//                 material.setProperty('texture1', this.textureList[1]);
//             }
//         }
//     }
// 
//     protected updateMaterial () {
//         if (this.textureList.length === 2) {
//             this._updateMaterial()
//             this._initedMaterial = true
//             return
//         }   
//     }
// 
//     public updateAngle(angle: number) {
//         this._angle = angle
//     }
// 
//     public getPointList() {
//         let pointList: cc.Vec2[] = []
//         for(let point of this._pointList) {
//             pointList.push(new cc.Vec2(point.newPos.x, point.newPos.y))
//         }
// 
//         return pointList
//     }
// 
//     // 初始化质点
//     public initPointList() {
//         for(let i = 0; i < this.pointsCount; ++i) {
//             let posX = i / (this.pointsCount - 1) * this.node.width
//             this._pointList.push(new PagePoint(posX, 0))
//         }
//     }
// 
//     public update() {
//         this.simulate()
//         this.applyConstraint()
//         this.draw()
//     }
// 
//     // 使用verlet积分更新位置
//     public simulate() {
//         let gravity = cc.v2(0, this.gravity)
//         for (let i = this.pointsCount - 1; i >= 1; i--) {
//             let point = this._pointList[i]
//             // 速度等于当前位置与上一个位置的差乘上衰减系数
//             let velocity: cc.Vec2 = point.newPos.sub(point.oldPos).mul(this.damping)
//             // 模拟一个水平放置的绳子，当y小于等于0时，将不再受重力影响
//             if(point.newPos.y <= 0) {
//                 gravity.y = Math.max(0, gravity.y)
//             }
//             point.oldPos = point.newPos
//             point.newPos = point.newPos.add(velocity)  
//             point.newPos = point.newPos.add(gravity)
//         }
//     }
// 
//     private _updateEndPos(endPos: cc.Vec2) {
//         let tailPoint = this._pointList[this.pointsCount - 1]
//         tailPoint.newPos = new cc.Vec2(endPos.x, endPos.y)       
//     }
// 
//     private _getEndPos(): cc.Vec2 {
//         let endPos = new cc.Vec2(0, 0)
//         let width = this.node.width
//         let rad = this._angle * Math.PI / 180
// 
//         // 与贝塞尔曲线使用相同的运动轨迹
//         let per = rad * 2 / Math.PI
//         if(this._angle <= 90) {
//             let endPosX = width * (1 - Math.pow(per, 3))
//             let endPosY = width * 1 / 4 * (1 - Math.pow(1 - per, 4))
//             endPos = new cc.Vec2(endPosX, endPosY)
//         } else {
//             per = per - 1
//             let endPosX = - width * (1 - Math.pow(1 - per, 3))
//             let endPosY = width * 1 / 4 * (1 - Math.pow(per, 4))
//             endPos = new cc.Vec2(endPosX, endPosY)
//         }
// 
// 
//         return endPos
//     }
//     // 约束纠正
//     public applyConstraint() {
//         // 两个质点之间的固定距离
//         let normalDistance = this.node.width / (this.pointsCount - 1)
//         let endPos = this._getEndPos()
//         for (let t = 0; t < this.constraintTimes; t++) {
//             this._updateEndPos(endPos)
//             //由最后一个质点开始依次纠正
//             for (let i = this.pointsCount - 1; i >= 1; i--) {
//                 let firstPoint = this._pointList[i - 1]
//                 let secondPoint = this._pointList[i]
//                 let delatPos = secondPoint.newPos.sub(firstPoint.newPos)
//                 let distance = delatPos.mag()
//                 let fixDirection :cc.Vec2 = null
//                 if (distance < normalDistance) {
//                     fixDirection = delatPos.normalize().negate()
//                 } else if (distance > normalDistance) {
//                     fixDirection = delatPos.normalize()
//                 } else {
//                     continue
//                 }
// 
//                 let fixLen = Math.abs(distance - normalDistance)
//                 if (i == 1) {
//                     // 由于第一个质点是固定的，所以只对第二个质点做纠正
//                     let fixVector = fixDirection.mul(fixLen)
//                     secondPoint.newPos.subSelf(fixVector)
//                 } else {
//                     // 将两个质点之间的距离纠正为固定长度
//                     let fixHalfVector = fixDirection.mul(fixLen * 0.5)
//                     firstPoint.newPos.addSelf(fixHalfVector)
//                     secondPoint.newPos.subSelf(fixHalfVector)
//                 }
//             }
//         }
//     }
// 
//     public draw() {
//         if (!this._initedMaterial) {
//             this.updateMaterial()
//         }
// 
//         this.setVertsDirty()
//     }
// }
