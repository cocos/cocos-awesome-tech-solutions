import { _decorator, Component, Node, GraphicsComponent, Vec2, PhysicsSystem2D, IVec2Like, Vec3 } from 'cc';
const { ccclass, property, type } = _decorator;

@ccclass('RayCastReflection')
export class RayCastReflection extends Component {
    @property
    radius = 1000;
    @type(GraphicsComponent)
    ctx: GraphicsComponent = null;

    angle  = 0;
    
    begin = new Vec2;
    end = new Vec2;

    remainLength = 0;

    start () {
        if (!this.ctx) {
            return;
        }
        this.ctx.node.worldPosition = Vec3.ZERO;
        this.angle = 0;
    }

    update (dt) {
        if (!this.ctx) {
            return;
        }

        this.angle += Math.PI / 20 * dt;

        let p1 = this.begin.set(this.node.worldPosition.x, this.node.worldPosition.y);
        let p2 = this.end.set(Math.cos(this.angle), Math.sin(this.angle)).multiplyScalar(this.radius).add( p1 );

        this.ctx.clear();
    
        this.remainLength = this.radius;
        this.raycast(p1, p2);
    }

    raycast (p1: Vec2, p2: Vec2) {
        let result = PhysicsSystem2D.instance.raycast(p1, p2)[0];

        if (result) {
            p2.set(result.point);
            this.ctx.circle(p2.x, p2.y, 5);
            this.ctx.fill();
        }

        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.stroke();

        if (!result) return;

        let len = Vec2.distance(p2, p1);
        if (len == 0) return;
        
        this.remainLength = this.remainLength -len;
        if (this.remainLength < 1) return;

        p1.set(p2);
        p2.set(result.normal).multiplyScalar(this.remainLength).add(p1);
        this.raycast(p1, p2);
    }
}
