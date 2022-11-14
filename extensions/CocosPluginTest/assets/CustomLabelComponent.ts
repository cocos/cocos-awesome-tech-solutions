import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CustomLabelComponent')
export class CustomLabelComponent extends Component {

    @property
    label = "";

    start() {

    }

    update(deltaTime: number) {
        
    }
}

