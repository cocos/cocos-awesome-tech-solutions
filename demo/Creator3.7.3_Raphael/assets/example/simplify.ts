import { _decorator, Component,Node, UITransform, Vec3, director } from 'cc';
const { ccclass } = _decorator;
import { RPath } from '../raphael/RPath';
let tempPoint = new Vec3()
@ccclass('Simplify')
export class Simplify extends Component {
    path = null;
    points = [];
    onLoad () {
        this.path = this.addComponent(RPath);
        this.path.fillColor = 'none';
        this.path.lineWidth = 5;
        this.path.showHandles = true;
        this.node.on(Node.EventType.TOUCH_START, this.onTouchBegan, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMoved, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnded, this);
    }

    onTouchBegan (event: any) {
        let touchLoc = event.getUILocation();
        // console.log(touchLoc ,'  touch',touch)
        // console.log(event ,'  event')
        this.points = [];

        let com = this.node.parent.getComponent(UITransform);

        touchLoc = com.convertToNodeSpaceAR(new Vec3(touchLoc.x,touchLoc.y,0) );
        this.points = [touchLoc];
        return true;
    }

    onTouchMoved (event: any) {
        let touchLoc = event.getUILocation();
        let com = this.node.parent.getComponent(UITransform);
        touchLoc = com.convertToNodeSpaceAR(new Vec3(touchLoc.x,touchLoc.y,0));
        this.points.push(touchLoc);
        this.path.points(this.points);
    }

    onTouchEnded (event: any) {
        this.path.points(this.points);
        this.path.simplify();
    }

    update (dt: any) {
    }

    backToList(){
        director.loadScene('TestList');
    }

}

