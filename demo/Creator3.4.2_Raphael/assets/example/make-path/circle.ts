import { _decorator, Component, director } from 'cc';
const { ccclass } = _decorator;
import { RPath } from '../../raphael/RPath';
@ccclass('Circle')
export class Circle extends Component {

    onLoad() {
        var path = this.addComponent(RPath);
        // @ts-ignore
        path.selected = true;
        path.circle(0, 0, 100);
        path.makePath();
    }
    backToList(){
        director.loadScene('TestList');
    }
}

