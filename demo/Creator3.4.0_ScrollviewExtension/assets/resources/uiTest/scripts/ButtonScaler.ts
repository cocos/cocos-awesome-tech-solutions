import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ButtonScaler')
export class ButtonScaler extends Component {
    @property
    public pressedScale = 1;
    @property
    public transDuration = 0;

    onLoad () {
        //var self = this;
        //self.initScale = this.node.scale;
        //self.button = self.getComponent(cc.Button);
        //self.scaleDownAction = cc.scaleTo(self.transDuration, self.pressedScale);
        //self.scaleUpAction = cc.scaleTo(self.transDuration, self.initScale);
        //function onTouchDown (event) {
        //    this.stopAllActions();
        //    this.runAction(self.scaleDownAction);
        //}
        //function onTouchUp (event) {
        //    this.stopAllActions();
        //    this.runAction(self.scaleUpAction);
        //}
        //this.node.on('touchstart', onTouchDown, this.node);
        //this.node.on('touchend', onTouchUp, this.node);
        //this.node.on('touchcancel', onTouchUp, this.node);
    }

}


/**
 * 注意：已把原脚本注释，由于脚本变动过大，转换的时候可能有遗落，需要自行手动转换
 */
// cc.Class({
//     extends: cc.Component,
// 
//     properties: {
//         pressedScale: 1,
//         transDuration: 0
//     },
// 
//     // use this for initialization
//     onLoad: function () {
//         var self = this;
//         self.initScale = this.node.scale;
//         self.button = self.getComponent(cc.Button);
//         self.scaleDownAction = cc.scaleTo(self.transDuration, self.pressedScale);
//         self.scaleUpAction = cc.scaleTo(self.transDuration, self.initScale);
//         function onTouchDown (event) {
//             this.stopAllActions();
//             this.runAction(self.scaleDownAction);
//         }
//         function onTouchUp (event) {
//             this.stopAllActions();
//             this.runAction(self.scaleUpAction);
//         }
//         this.node.on('touchstart', onTouchDown, this.node);
//         this.node.on('touchend', onTouchUp, this.node);
//         this.node.on('touchcancel', onTouchUp, this.node);
//     }
// });
