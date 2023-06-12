import { _decorator, Component, director } from 'cc';
const { ccclass } = _decorator;
import { RGroup } from '../raphael/RGroup';
@ccclass('Group')
export class Group extends Component {

    onLoad () {
        var group = this.addComponent(RGroup);
        var path = group.addPath();
        path.rect(-100, -100, 100, 100);
        path.makePath();
        path = group.addPath();
        path.circle(50, 50, 50);
        path.makePath();
        group.rotation = 45;
    }
    backToList(){
        director.loadScene('TestList');
    }
}
