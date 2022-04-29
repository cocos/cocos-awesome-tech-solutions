import { _decorator, Component, director } from 'cc';
const { ccclass } = _decorator;
import { RPath } from '../../raphael/RPath';

@ccclass('RectEx')
export class RectEx extends Component {

    onLoad() {
        var path = this.addComponent(RPath);
        // @ts-ignore
        path.rect(-150, -150, 300, 200);
        path.makePath();
    }
    backToList(){
        director.loadScene('TestList');
    }
}

