
import { _decorator, Component, Node, EventTouch, sys } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Fullscreen')
export class Fullscreen extends Component {
    start () {
        this.node.on(Node.EventType.TOUCH_END, this.checkFullScreen, this);
    }

    checkFullScreen (touch: EventTouch) {
        if (sys.isMobile && sys.isBrowser && document && document.documentElement && document.documentElement.requestFullscreen) {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            }
            // else {
            //     if (document.exitFullscreen) {
            //         document.exitFullscreen();
            //     }
            // }
        }
    }
}