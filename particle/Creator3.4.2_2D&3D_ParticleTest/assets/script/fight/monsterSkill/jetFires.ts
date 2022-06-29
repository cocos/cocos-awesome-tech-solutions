import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;
//直线范围型的火焰
@ccclass('JetFires')
export class JetFires extends Component {
    public skillInfo: any = null!;//技能信息
    public baseInfo: any = null!;

    start () {
        // [3]
    }

    public init (skillInfo: any, baseInfo: any, scriptParent: any) {
        this.skillInfo = skillInfo;
        this.baseInfo = baseInfo;
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}
