import { _decorator, Component, Node, Vec3 } from 'cc';
import { FogOfWarEffect, FowMapPos } from './FogOfWarEffect';
const { ccclass, property } = _decorator;

// //视野数据-由于计算fov是在子线程操作，通过将视野数据以object类型参数传入，使用简单数据类型或结构体会产生装箱操作，因此将视野封装成类

// export class FOWFieldData {
//     position: Vec3 = new Vec3();
//     radius: number = 0;
//     radiuSquare: number = 0;
//     diameter: number = 0;

//     constructor (position: Vec3, radius: number) {
//         this.position = position;
//         this.radius = radius;
//         this.radiuSquare = this.radiuSquare;
//     }
// }

// @ccclass('FogOfWarExplorer')
// export class FogOfWarExplorer extends Component{

//     @property({tooltip: "视野半径"})
//     radius: number = 0;

//     m_OriginPosition: Vec3 = new Vec3();

//     m_FowMapPos: FowMapPos = new Vec3();

//     m_FieldData: FOWFieldData = null!;

//     m_IsInitialized: boolean = false;

//     start () {
//         this.m_FieldData = new FOWFieldData(this.node.position, this.radius);
//     }

//     update () {
//         if (this.radius <= 0) return;
//         this.m_FieldData.position = this.node.position;
//         this.m_FieldData.radius = this.radius;
//         // FogOfWarEffect.updateFOWFieldData(this.m_FieldData);
//     }
// }

