import { _decorator, Component, Node, Event, EventTouch, Vec3 } from 'cc';
import { NavAgent } from './common/nav_agent';
const {ccclass, property} = _decorator;

@ccclass('MainScene')
export default class MainScene extends Component {
    @property(Node)
    player: Node | null = null;
    onLoad () {
        this.node.on(Node.EventType.TOUCH_START, this.playerMove, this)
    }
    playerMove(e: EventTouch) {
        let pos = e.getUILocation();
        this.player.getComponent(NavAgent).nav_to_map(new Vec3(pos.x,pos.y,0));
    }
    start () {

    }
// // update (dt) {}
}



function nav_agent(nav_agent: any) {
    throw new Error('Function not implemented.');
}


