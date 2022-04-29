import { _decorator, Component, Vec3, Vec2, Color, director } from 'cc';
const { ccclass, property } = _decorator;
import { RPath } from '../raphael/RPath';
@ccclass('AnimateDashLine')
export class AnimateDashLine extends Component {
    @property
    public duration = 2;
    path = null;
    time = 0;
    pathLength = 0;
    onLoad() {
        let path = this.addComponent(RPath);
        path.strokeColor = Color.WHITE;
        path.lineWidth = 4;
        path.fillColor = 'none';
        path.scale = new Vec2(4, -4);
        this.path = path;
        let pathStrings = path.getDemoData();
        let i = 0;
        let self = this;
        function animate() {
            let pathString = pathStrings[i];
            path.path(pathString);
            path.center(0, 0);
            i = ++i % pathStrings.length;
            self.time = 0;
            self.pathLength = path.getTotalLength();
            path.dashOffset = self.pathLength;
            path.dashArray = [self.pathLength];
        }
        animate();
        this.schedule(animate, this.duration * 1.5 * 1000);
    }

    update(dt: any) {
        this.time += dt;
        let percent = this.time / this.duration;
        if (percent > 1) {
            return;
        }
        this.path.dashOffset = this.pathLength * (1 - percent);
        this.path._dirty = true;
    }

    backToList(){
        director.loadScene('TestList');
    }
}

