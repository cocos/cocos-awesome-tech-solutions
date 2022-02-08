
import { _decorator, Component, Node, CCInteger, CCFloat, Vec3, tween } from 'cc';
const { ccclass, property } = _decorator;
 
@ccclass('NewComponent')
export class NewComponent extends Component {

    @property(CCFloat)
    delayTime: number = 100;

    @property(CCInteger)
    playTime: number = 5;

    start () {
        setTimeout(()=>{
            this.playfruitsTween();
        }, this.delayTime)
    }

    playfruitsTween () {
        var fruit = this.node;
        var startPos = fruit.position;
        var startAngle = fruit.eulerAngles;
        var fruitTween = tween(startPos);
        const mixY = 6;
        const maxY = 12;
        const mixX = 0;
        const maxX = 0;
        var progressX = function (start, end, current, t) {
            //@ts-ignore
            current = cc.bezier(start, mixX, maxX, end, t);
            return current;
        };
        var progressY = function (start, end, current, t) {
            //@ts-ignore
            current = cc.bezier(start, mixY, maxY, end, t);
            return current;
        };

        fruitTween.parallel(
            tween().to( this.playTime, {x: -fruit.position.x}, {progress: progressX, easing: "smooth", onUpdate: ()=>{
                fruit.setPosition(startPos);
            }}),
            tween().to( this.playTime, {y: 0}, { progress: progressY, easing: "smooth", onUpdate: ()=>{
                fruit.setPosition(startPos);
            }}),
        ).start();
        tween(startAngle).to( this.playTime, {z: 360}, {onUpdate: ()=>{
            fruit.eulerAngles = startAngle;
        }}).start();
    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/decorator.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
