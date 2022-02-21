import { _decorator, Node, Component, Label, Material, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SpriteDissolve')
export default class SpriteDissolve extends Component {
  @property(Label)
  tip : Label | null = null;
  @property(Node)
  node1 : Node | null = null;

  materialList: Material[] = [];
  fadePct: number = 0; // 溶解百分比
  activeFlag: boolean = false; // 溶解进行中
  symbol: number = 1; // 色彩叠加的正负
  speed: number = 0.5; // 色彩叠加的速度

  start() {
    this.materialList.push(
      this.node1!.getComponent(Sprite)!.getMaterial(0)!,
    );
  }

  toggle() {
    if (this.activeFlag) return;
    this.activeFlag = true;
  }

  update(dt: number) {
    if (!this.activeFlag) return;
    this.materialList.forEach((material) => material.setProperty('fade_pct', this.fadePct));

    if (this.fadePct >= 0 && this.fadePct <= 1) {
      this.fadePct += this.symbol * dt * this.speed;
      this.tip!.string = "溶解程度 " + this.fadePct.toFixed(1);
    } else {
      this.fadePct = this.fadePct > 1 ? 1 : 0;
      this.symbol = -this.symbol;
      this.activeFlag = false;
    }
  }
}
