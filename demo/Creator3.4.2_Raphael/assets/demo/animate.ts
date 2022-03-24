import { _decorator, Component, Vec2, Color, director } from 'cc';
const { ccclass } = _decorator;
import { RPath } from '../raphael/RPath';
@ccclass('Animate')
export class Animate extends Component {
    path = null;
    onLoad () {
        var path = this.addComponent(RPath);
        path.strokeColor = Color.WHITE;
        path.lineWidth = 4;
        path.fillColor = 'none';
        path.scale =  new Vec2(4, -4);
        path.position = new Vec2(-100, 120);
        this.path = path;
        var pathStrings = path.getDemoData();
        var i = 0;
        var duration = 2;
        function animate () {
           var pathString1 = pathStrings[i];
           i = (i + 1) >= pathStrings.length ? 0 : (i + 1);
           var pathString2 = pathStrings[i];
           path.animateFunc(pathString1, pathString2, duration);
        }
        animate();
        setInterval(animate, duration * 1.5 * 1000);
    }

    backToList(){
        director.loadScene('TestList');
    }
}


