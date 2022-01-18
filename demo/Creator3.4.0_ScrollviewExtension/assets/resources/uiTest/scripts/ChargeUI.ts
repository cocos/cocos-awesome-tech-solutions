import { _decorator, Component } from 'cc';
const { ccclass } = _decorator;

@ccclass('ChargeUI')
export class ChargeUI extends Component {

    init (home: any, parentBtns: any) {
        //this.home = home;
        //this.parentBtns = parentBtns;
    }

    show () {
        //this.node.active = true;
        //this.node.emit('fade-in');
        //this.home.toggleHomeBtns(false);
        //this.parentBtns.pauseSystemEvents();
    }

    hide () {
        //this.node.emit('fade-out');
        //this.home.toggleHomeBtns(true);
        //this.parentBtns.resumeSystemEvents();
    }

}


/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// cc.Class({
//     extends: cc.Component,
// 
//     properties: {
// 
//     },
// 
//     // use this for initialization
//     init: function (home, parentBtns) {
//         this.home = home;
//         this.parentBtns = parentBtns;
//     },
// 
//     show: function () {
//         this.node.active = true;
//         this.node.emit('fade-in');
//         this.home.toggleHomeBtns(false);
//         this.parentBtns.pauseSystemEvents();
//     },
// 
//     hide: function () {
//         this.node.emit('fade-out');
//         this.home.toggleHomeBtns(true);
//         this.parentBtns.resumeSystemEvents();
//     },
// });
