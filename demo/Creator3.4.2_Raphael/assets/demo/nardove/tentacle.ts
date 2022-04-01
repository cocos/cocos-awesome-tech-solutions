import { _decorator, Component, Vec2, Graphics } from 'cc';
const { ccclass } = _decorator;

@ccclass('Tentacle')
export class Tentacle extends Component {
    path = null;
    numSegments = null;
    segmentLength = null;
    points = [];
    anchor = null;
    onLoad () {
    }

    init (group: any, numSegments: any, length: any) {
        this.path = group.addPath();
        this.path.fillColor = 'none';
        this.numSegments = numSegments;
        this.segmentLength = Math.random() * 1 + length - 1;
        for (var i = 0; i < this.numSegments; i++) {
           this.points.push(new Vec2(0, i * this.segmentLength));
        }
        this.path.lineCap = Graphics.LineCap.ROUND;
        this.anchor = this.points[0];
    }

    update () {
        this.points[1].x = this.anchor.x;
        this.points[1].y = this.anchor.y - 1;
        for (let i = 2; i < this.numSegments; i++) {
           var px = this.points[i].x - this.points[i-2].x;
           var py = this.points[i].y - this.points[i-2].y;
           var pt = new Vec2(px, py);
           var len = pt.length();
           if (len > 0.0) {
               this.points[i].x = this.points[i-1].x + (pt.x * this.segmentLength) / len;
               this.points[i].y = this.points[i-1].y + (pt.y * this.segmentLength) / len;
           }
        }
        this.path.points(this.points);
    }

}

