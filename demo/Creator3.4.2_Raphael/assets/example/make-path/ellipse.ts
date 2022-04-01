import { _decorator, Component, director } from 'cc';
const { ccclass } = _decorator;
import { RPath } from '../../raphael/RPath';

@ccclass('Ellipse')
export class Ellipse extends Component {

    onLoad () {
        var path = this.addComponent(RPath);
        // @ts-ignore
        path.selected = true;
        path.ellipse(0, 0, 100, 50);
        path.makePath();
    }
    backToList(){
        director.loadScene('TestList');
    }
}



