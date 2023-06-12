
import { _decorator, Component, Node, Label, tween } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('touch')
export class touch extends Component {

    @property(Node)
    notify: Node = null!

    start () {
        this.node.on(Node.EventType.TOUCH_START, ()=>{
            if (this.notify.active) return;
            this.notify.active = true;
            this.scheduleOnce(()=>{
                this.notify.active = false;
            }, 0.4);            
        }, this, true);
    }
}
