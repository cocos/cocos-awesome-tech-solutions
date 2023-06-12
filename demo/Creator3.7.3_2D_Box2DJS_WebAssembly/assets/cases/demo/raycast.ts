import { _decorator, Component, Node, Vec2, GraphicsComponent, Vec3, ERaycast2DType, PhysicsSystem2D } from 'cc';
const { ccclass, property, type } = _decorator;

@ccclass('Raycast')
export class Raycast extends Component {
    @property
    radius = 1000;
    @type(GraphicsComponent)
    ctx: GraphicsComponent = null;

    angle = 0;

    begin = new Vec2;
    end = new Vec2;

    raycastType = ERaycast2DType.Closest;

    start () {
        if (!this.ctx) {
            return;
        }
        this.ctx.node.worldPosition = Vec3.ZERO;
        this.angle = 0;
    }

    // called every frame, uncomment this function to activate update callback
    update (dt) {
        this.angle += Math.PI / 10 * dt;

        let p1 = this.begin.set(this.node.worldPosition.x, this.node.worldPosition.y);
        let p2 = this.end.set(Math.cos(this.angle), Math.sin(this.angle)).multiplyScalar(this.radius).add(p1);

        let results = PhysicsSystem2D.instance.raycast(p1, p2, this.raycastType);

        this.ctx.clear();

        if (this.raycastType === ERaycast2DType.Closest ||
            this.raycastType === ERaycast2DType.Any) {
            if (results[0]) {
                p2 = results[0].point;
            }
        }

        results.forEach(result => {
            this.ctx.circle(result.point.x, result.point.y, 5);
        });

        this.ctx.fill();

        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();
    }

    onClosestBtnClick () {
        this.raycastType = ERaycast2DType.Closest;
    }

    onAnyBtnClick () {
        this.raycastType = ERaycast2DType.Any;
    }

    onAllClosestBtnClick () {
        this.raycastType = ERaycast2DType.AllClosest;
    }

    onAllBtnClick () {
        this.raycastType = ERaycast2DType.All;
    }
}
