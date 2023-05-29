import { _decorator, Component, Node, input, Input, EventTouch, Material, find, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NewComponent')
export class NewComponent extends Component {
    mat:Material = null;
    start() {
        input.on(Input.EventType.TOUCH_MOVE,this.onInputTouchMove,this);
        this.mat = find('Canvas/Sprite').getComponent(Sprite).customMaterial;
    }
    onInputTouchMove(event:EventTouch){
        // let delta = event.getUIDelta();
        // let deltaX = event.getDeltaX();
        let deltaY = event.getDeltaY();
        let inAngle:number = this.mat.getProperty('inAngle') as number;
        // if(inAngle){
            let angle = inAngle+deltaY;    
            this.mat.setProperty('inAngle',angle);
        // }
    }
    update(deltaTime: number) {
        
    }
}


