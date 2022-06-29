import { constant } from './../../framework/constant';
import { GameManager } from './../../fight/gameManager';
import { poolManager } from './../../framework/poolManager';
import { _decorator, Component, Node, SpriteFrame, Prefab, LayoutComponent, Vec3, find, UITransformComponent, SpriteComponent, tween, clamp } from 'cc';
//血条组件

const { ccclass, property } = _decorator;
@ccclass('PlayerBloodBar')
export class PlayerBloodBar extends Component {

    @property
    public lineWidth: number = 1;//中间线的宽度

    @property(Prefab)
    public pbLine: Prefab = null!//中间线预制体

    @property(Node)
    public ndContainer: Node = null!;//血块容器

    @property(LayoutComponent)
    public layoutContainer: LayoutComponent = null!;//container节点的layout组件

    @property(UITransformComponent)
    public UIComWhiteBar: UITransformComponent = null!;//白色进度条的UI组件

    @property(Node)
    public ndWhiteBar: Node = null!;//白色进度条节点

    @property(UITransformComponent)
    public UIComCurBloodBar: UITransformComponent = null!;//血量进度条的UI组件

    @property(Node)
    public ndCurBloodBar: Node = null!;//血量进度条节点

    @property(SpriteComponent)
    public spComBloodBar: SpriteComponent = null!;//血条背景色

    @property(SpriteFrame)
    public sfRed: SpriteFrame = null!//小怪和bos是红色背景

    @property(SpriteFrame)
    public sfGreen: SpriteFrame = null!//玩家是绿色背景

    @property(UITransformComponent)
    public UIComBloodBar: UITransformComponent = null!;//血条容器节点

    public curBlood: number = 0;//当前血量值

    private _minBloodBarWidth: number = 100;//最小整体血条宽度
    private _bloodBarWidth: number = 0;//当前整体血条宽度
    private _minBloodBarItemWidth: number = 10;//最小单个血块宽度
    private _maxItemBlood: number = 200;//每隔血条
    private _totalBlood: number = 0;//总的血量
    private _ndTarget: Node = null!;//跟随目标
    private _offsetPos: Vec3 = null!;//偏差
    private _curPos: Vec3 = new Vec3()!;//当前血条位置
    private _scriptParent: any = null!;//血条所在节点绑定的脚本
    private _scale: Vec3 = new Vec3();//血条缩放倍数
    private _bloodBarHeight: number = 15;//血条高度
    private _oriContainerPos: Vec3 = new Vec3();//初始线条容器节点位置
    private _curContainerPos: Vec3 = new Vec3();//当前线条容器节点位置
    private _bloodBarPos = new Vec3();//血条位置
    private _whiteBarPos = new Vec3();//白条位置

    start () {
        // [3]
    }

    /**
     * 展示血条
     *
     * @param {*} scriptParent 血条使用者绑定的节点，如玩家或者小怪
     * @param {number} totalBlood 总血量
     * @param {number} bloodBarType 血条类型
     * @param {Vec3} offsetPos 血条位置偏差
     * @param {Vec3} scale 血条缩放大小
     * @param {(Function | null)} [callback] 
     * @memberof BloodBar
     */
    public show (scriptParent: any, totalBlood: number, curBlood: number, offsetPos: Vec3, scale: Vec3, callback?: Function | null) {
        this._scriptParent = scriptParent!;
        this._totalBlood = totalBlood;
        this._offsetPos = offsetPos;
        this._scale = scale;
        this._ndTarget = scriptParent.node;

        this.node.setScale(scale);

        // if (isInit) {
            // this._curBlood = this._totalBlood;
        // }

        this.curBlood = curBlood;

        //血块数量
        let bloodItemNum = Math.ceil(totalBlood / this._maxItemBlood);
        //当前血量条最小长度
        this._bloodBarWidth = this._minBloodBarItemWidth * bloodItemNum;
        //所需血条总宽度大于最小整体血条宽度，需增大血条大小，反之使用最小血条宽度
        let isOutOfRange = this._bloodBarWidth > this._minBloodBarWidth;

        this._oriContainerPos.set(this.ndContainer.position);

        if (isOutOfRange) {
            this._curContainerPos.set(-this._bloodBarWidth * 0.5, this._oriContainerPos.y, 0);
            this.ndContainer.setPosition(this._curContainerPos);
        } else {
            this._bloodBarWidth = this._minBloodBarWidth;
        }

        //每个间隔线之间的距离，1为它本身的宽度，默认前后不显示
        this.layoutContainer.spacingX = this._bloodBarWidth / bloodItemNum - 1;

        this.ndContainer.children.forEach((item: any)=>{
            item.active = false;
        })

        //当前血量占全部的比例
        let ratio = this.curBlood / this._totalBlood;
        ratio = clamp(ratio, 0, 1);

        //设置整体大小
        this.UIComBloodBar.setContentSize(this._bloodBarWidth + 2, this._bloodBarHeight);
        // this.UIComBloodBar.priority = constant.PRIORITY.BLOOD;
        this.node.setSiblingIndex(constant.PRIORITY.ZERO);

        //根据当前血量刷新中间连接线
        for (let i = 0; i < bloodItemNum + 1; i++) {
            let ndLineItem: Node;

            if (i >= this.ndContainer.children.length) {
                ndLineItem = poolManager.instance.getNode(this.pbLine, this.ndContainer);
            } else {
                ndLineItem = this.ndContainer.children[i];
            }

            ndLineItem.active = true;

            let UICom = ndLineItem.getComponent(UITransformComponent) as UITransformComponent;

            if (i % 5 === 0) {
                UICom.setContentSize(1.5, 7);
            } else {
                UICom.setContentSize(1, 5);
            }
        }

        let layCom = this.ndContainer.getComponent(LayoutComponent) as LayoutComponent;
        //立即执行更新布局
        layCom.updateLayout();

        //头尾不展示中间线
        this.ndContainer.children.forEach((ndLineItem: Node, i: number)=>{
            let spComLine = ndLineItem.getComponent(SpriteComponent) as SpriteComponent;
            if (i === 0 || i === bloodItemNum || ndLineItem.position.x > this._bloodBarWidth * ratio) {
                spComLine.enabled = false;
            } else {
                spComLine.enabled = true;
            }
        })

        //设置白色进度条长度和位置
        this.UIComWhiteBar.setContentSize(ratio * this._bloodBarWidth, this._bloodBarHeight * 0.8);
        this._whiteBarPos.set(this.ndContainer.position.x, 0.5, this.ndContainer.position.z);
        this.ndWhiteBar.setPosition(this._whiteBarPos);

        //设置血量进度条长度和位置
        this.UIComCurBloodBar.setContentSize(ratio * this._bloodBarWidth, this._bloodBarHeight * 0.8);
        this._bloodBarPos.set(this.ndContainer.position.x, 0, this.ndContainer.position.z);
        this.ndCurBloodBar.setPosition(this._bloodBarPos);

        callback && callback();
    }

    /**
     * 刷新血量
     *
     * @param {number} num 血量值
     * @param {boolean} [isIncreaseLimit=false] //是否增加上限
     * @memberof PlayerBloodBar
     */
    public refreshBlood (num: number, isIncreaseLimit: boolean = false) {
        this.curBlood += num;
        this.curBlood = clamp(this.curBlood, 0, this._totalBlood);
        let ratio = this.curBlood / this._totalBlood;

        if (num < 0) {//减血
            ratio = ratio <= 0 ? 0 : ratio;
    
            this.UIComCurBloodBar.setContentSize(this._bloodBarWidth * ratio, this._bloodBarHeight * 0.8);
    
            if (ratio > 0) {
                this.ndContainer.children.forEach((ndChild: Node)=>{
                    let spComLine = ndChild.getComponent(SpriteComponent) as SpriteComponent;
    
                    if (spComLine.enabled && ndChild.position.x > this._bloodBarWidth * ratio) {
                        spComLine.enabled = false;
                    }
                })
                
                tween(this.UIComWhiteBar)
                .to(0.7, {width: this._bloodBarWidth * ratio})
                .call(()=>{
                    
                })
                .start();
            } else {
                // poolManager.instance.putNode(this.node);
                this.node.active = false;
                this._scriptParent.isDie = true;
                this.curBlood = 0;
            }
        } else {//加血
            if (isIncreaseLimit) {//增加上限,并增加多出来的血量，最多不超过上限
                this.curBlood += num;
                this._totalBlood += num;
                this.curBlood = this.curBlood >= this._totalBlood ? this._totalBlood : this.curBlood;
                ratio = this.curBlood / this._totalBlood;
            } else {//普通加血，最多不超过上限                
                ratio = ratio >= 1 ? 1 : ratio;
            }

            tween(this.UIComCurBloodBar)
            .to(1, {width: this._bloodBarWidth * ratio})
            .call(()=>{
                this.show(this._scriptParent, this._totalBlood, this.curBlood, this._offsetPos, this._scale, null);

                })
            .start();
        }
    }

    update (deltaTime: number) {
        // [4]
        //血条跟随人物移动
        if (this.node.parent && this.node.active && this._ndTarget && this._ndTarget.parent) {
            GameManager.mainCamera?.convertToUINode(this._ndTarget.worldPosition, find("Canvas") as Node, this._curPos);
            this._curPos.add(this._offsetPos);
            this.node.setPosition(this._curPos);
        }
        
    }
}
