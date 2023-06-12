import { _decorator, Component, director } from 'cc';
const { ccclass } = _decorator;
import { RPath } from '../raphael/RPath';

@ccclass('Smooth')
export class Smooth extends Component {

    onLoad () {
        var path = this.addComponent(RPath);
        path.lineWidth = 4;
        path.showHandles = true;
        //@ts-ignore
        path.rect(-100, -100, 200, 200);
        path.makePath();
        path.smoothFunc();
    }
    backToList(){
        director.loadScene('TestList');
    }
}
