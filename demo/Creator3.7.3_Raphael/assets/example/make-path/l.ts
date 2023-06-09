import { _decorator, Component, director } from 'cc';
const { ccclass } = _decorator;
import { RPath } from '../../raphael/RPath';

@ccclass('L')
export class L extends Component {

    onLoad () {
        var path = this.addComponent(RPath);
        // @ts-ignore
        path.selected = true;
        // @ts-ignore
        path.M(-50, -100);
        // @ts-ignore
        path.L(50, -100);
        // @ts-ignore
        path.L(0, 100);
        // @ts-ignore
        path.Z();
        path.makePath();
    }
    backToList(){
        director.loadScene('TestList');
    }
}


/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// cc.Class({
//     extends: cc.Component,
// 
//     // use this for initialization
//     onLoad: function () {
//         var path = this.addComponent('R.path');
//         
//         path.selected = true;
//         
//         path.M(-50, -100);
//         path.L(50, -100);
//         path.L(0, 100);
//         path.Z();
// 
//         path.makePath();
//     },
// });
