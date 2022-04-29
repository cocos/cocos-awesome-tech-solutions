import { _decorator, Component, director } from 'cc';
const { ccclass } = _decorator;
import { RPath } from '../../raphael/RPath';

@ccclass('Q')
export class Q extends Component {

    onLoad () {
        var path = this.addComponent(RPath);
        // @ts-ignore
        path.selected = true;
        path.fillColor = null;
        // @ts-ignore
        path.M(-200, 0);
        // @ts-ignore
        path.Q(-100, 200, 0,0);
        // @ts-ignore
        path.T(200,0);
        path.makePath();
    }
    backToList(){
        director.loadScene('TestList');
    }
}


