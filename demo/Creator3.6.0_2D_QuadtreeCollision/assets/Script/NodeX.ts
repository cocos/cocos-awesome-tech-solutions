import { _decorator, Component, Color, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('NodeX')
export default class NodeX extends Component {
    public isCollision: boolean = false;

    start() {
        let pos = this.node.getPosition();
        pos.x = Math.random() * screen.width;
        pos.y = Math.random() * screen.height;
        this.node.setPosition(pos);
    }

    update(dt) {
        let speed = 1.5;
        
        let pos = this.node.getPosition();
        pos.x += Math.random() * speed;
        pos.y += Math.random() * speed;
        this.node.setPosition(pos);
    }

    public setIsCollision(isCollision) {
        this.isCollision = isCollision;
        if (isCollision) {
            this.node.getComponent(Sprite).color = new Color(255, 0, 0);
        } else {
            this.node.getComponent(Sprite).color = new Color(255, 255, 255);
        }
    }
}
