import { _decorator, Component, Animation, Sprite, Node } from 'cc';
import { ChargeUI } from './ChargeUI';
const { ccclass, property } = _decorator;

@ccclass('ShopUI')
export class ShopUI extends Component {
    @property(Animation)
    public anim: Animation | null = null;
    @property(Sprite)
    public figure: Sprite | null = null;
    @property(Node)
    public btnsNode: Node | null = null;
    @property
    public chargeUI = 'ChargeUI';

    init (home: any, panelType: any) {
        //this.home = home;
        //this.node.active = false;
        //this.anim.play('shop_reset');
        //this.panelType = panelType;
        //this.figure.node.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(1, 1, 0.96), cc.scaleTo(1, 1, 1))));
        //this.chargeUI.init(home, this.btnsNode);
    }

    show () {
        //this.node.active = true;
        //this.anim.play('shop_intro');
    }

    hide () {
        //this.anim.play('shop_outro');
    }

    onFinishShow () {
        //this.home.curPanel = this.panelType;
    }

    onFinishHide () {
        //this.node.active = false;
    }

}


/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// const ChargeUI = require('ChargeUI');
// 
// cc.Class({
//     extends: cc.Component,
// 
//     properties: {
//         anim: cc.Animation,
//         figure: cc.Sprite,
//         btnsNode: cc.Node,
//         chargeUI: ChargeUI
//     },
// 
//     // use this for initialization
//     init: function (home, panelType) {
//         this.home = home;
//         this.node.active = false;
//         this.anim.play('shop_reset');
//         this.panelType = panelType;
//         this.figure.node.runAction(cc.repeatForever(cc.sequence(cc.scaleTo(1, 1, 0.96), cc.scaleTo(1, 1, 1))));
//         this.chargeUI.init(home, this.btnsNode);
//     },
// 
//     show: function () {
//         this.node.active = true;
//         this.anim.play('shop_intro');
//     },
// 
//     hide: function () {
//         this.anim.play('shop_outro');
//     },
// 
//     onFinishShow: function () {
//         this.home.curPanel = this.panelType;
//     },
// 
//     onFinishHide: function () {
//         this.node.active = false;
//     }
// 
//     // called every frame, uncomment this function to activate update callback
//     // update: function (dt) {
// 
//     // },
// });
