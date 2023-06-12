import { _decorator, Component, director } from 'cc';
const { ccclass } = _decorator;
import { RPath } from '../raphael/RPath';

@ccclass('DashLine')
export class DashLine extends Component {

    onLoad () {
        var path = this.addComponent(RPath);
        path.dashOffset = 100;
        path.dashArray = [50, 10];
        //@ts-ignore
        path.rect(-100, -100, 200, 200);
        path.makePath();
    }
    
    backToList(){
        director.loadScene('TestList');
    }
}


