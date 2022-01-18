import { _decorator, Component, Animation, Button, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SubBtnsUI')
export class SubBtnsUI extends Component {
    @property(Animation)
    public subBtnsAnim: Animation | null = null;
    @property(Button)
    public btnShowSub: Button | null = null;
    @property(Button)
    public btnHideSub: Button | null = null;
    @property(Node)
    public btnContainer: Node | null = null;

    onLoad () {
        //this.btnShowSub.node.active = true;
        //this.btnHideSub.node.active = false;
    }

    showSubBtns () {
        //this.btnContainer.active = true;
        //this.subBtnsAnim.play('sub_pop');
    }

    hideSubBtns () {
        //this.subBtnsAnim.play('sub_fold');
    }

    onFinishAnim (finishFold: any) {
        //this.btnShowSub.node.active = finishFold;
        //this.btnHideSub.node.active = !finishFold;
    }

}


/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// cc.Class({
//     extends: cc.Component,
// 
//     properties: {
//         subBtnsAnim: cc.Animation,
//         btnShowSub: cc.Button,
//         btnHideSub: cc.Button,
//         btnContainer: cc.Node
//     },
// 
//     // use this for initialization
//     onLoad: function () {
//         this.btnShowSub.node.active = true;
//         this.btnHideSub.node.active = false;
//     },
// 
//     showSubBtns: function () {
//         this.btnContainer.active = true;
//         this.subBtnsAnim.play('sub_pop');
//     },
// 
//     hideSubBtns: function () {
//         this.subBtnsAnim.play('sub_fold');
//     },
// 
//     onFinishAnim: function (finishFold) {
//         this.btnShowSub.node.active = finishFold;
//         this.btnHideSub.node.active = !finishFold;
//     },
//     // called every frame, uncomment this function to activate update callback
//     // update: function (dt) {
// 
//     // },
// });
