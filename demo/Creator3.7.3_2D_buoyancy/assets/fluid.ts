import { _decorator, Component, v2, find, Vec2, Collider2D, IPhysics2DContact, RigidBody2D, PolygonCollider2D, UITransform, Contact2DType, math, PhysicsSystem2D } from 'cc';
import { PhysicManager } from './physicManager';
const { ccclass, property } = _decorator;

interface IComputeAC{
    area: number;
    centroid: Vec2;
}

// 浮力工作步骤：
// 1. 计算两个多边形交点
// 2. 计算多边形的面积和质心
// 3. 根据质心和面积施加浮力
// 4. 添加阻力减缓流速

function inside(cp1: Vec2, cp2: Vec2, p: Vec2) {
    return (cp2.x - cp1.x) * (p.y - cp1.y) > (cp2.y - cp1.y) * (p.x - cp1.x);
}
function intersection(cp1: Vec2, cp2: Vec2, s: Vec2, e: Vec2) {
    let dc = v2(cp1.x - cp2.x, cp1.y - cp2.y);
    let dp = v2(s.x - e.x, s.y - e.y);
    let n1 = cp1.x * cp2.y - cp1.y * cp2.x;
    let n2 = s.x * e.y - s.y * e.x;
    let n3 = (dc.x * dp.y - dc.y * dp.x);
    return v2((n1 * dp.x - n2 * dc.x) / n3, (n1 * dp.y - n2 * dc.y) / n3);
}
function computeAC(vs: Vec2[]): IComputeAC {
    let count = vs.length;
    let c = v2(0, 0);
    let area = 0.0;
    let p1X = 0.0;
    let p1Y = 0.0;
    let inv3 = 1.0 / 3.0;
    for (let i = 0; i < count; ++i) {
        let p2 = vs[i];
        let p3 = i + 1 < count ? vs[i + 1] : vs[0];
        let e1X = p2.x - p1X;
        let e1Y = p2.y - p1Y;
        let e2X = p3.x - p1X;
        let e2Y = p3.y - p1Y;
        let D = (e1X * e2Y - e1Y * e2X);
        let triangleArea = 0.5 * D; area += triangleArea;
        c.x += triangleArea * inv3 * (p1X + p2.x + p3.x);
        c.y += triangleArea * inv3 * (p1Y + p2.y + p3.y);
    }
    return { area, centroid: c };
}
@ccclass('Fluid')
export class Fluid extends Component {
    @property
    public density = 1;
    @property
    public angularDrag = 1;
    @property
    public linearDrag = 1;

    inFluid: PolygonCollider2D[] = [];
    physicManager: PhysicManager = null!;
    gravity = new Vec2();
    fluidCollider: PolygonCollider2D = null!;
    // body: RigidBody2D = null!;
    polygonCollider: PolygonCollider2D = null!;

    onLoad () {
        this.createFluid();
        this.inFluid.length = 0;
        this.physicManager = find('Canvas/physicManager').getComponent(PhysicManager);
        this.gravity.set(this.physicManager.gravity.x, -this.physicManager.gravity.y);
    }


    // 计算相交多边形面积和质心
    findIntersectionAreaAndCentroid(collider: PolygonCollider2D): IComputeAC {
        // let fixtureB = body.m_fixtureList;
        let fixtureB = collider.body.impl.impl.m_fixtureList;
        if (!fixtureB || fixtureB.GetType() !== 2) {
            return;
        }

        let centroid = v2(0, 0);
        let area = 0;
        let mass = 0;
        while (fixtureB) {
            let outputList = this.getVertices(this.polygonCollider);
            let clipPolygon = this.getVertices(collider);
            let cp1 = clipPolygon[clipPolygon.length - 1];
            for (let j = 0; j < clipPolygon.length; j++) {
                let cp2 = clipPolygon[j];
                let inputList = outputList;
                outputList = [];
                let s = inputList[inputList.length - 1]; //last on the input list
                for (let i = 0; i < inputList.length; i++) {
                    let e = inputList[i];
                    if (inside(cp1, cp2, e)) {
                        if (!inside(cp1, cp2, s)) {
                            outputList.push(intersection(cp1, cp2, s, e));
                        }
                        outputList.push(e);
                    }
                    else if (inside(cp1, cp2, s)) {
                        outputList.push(intersection(cp1, cp2, s, e));
                    }
                    s = e;
                }
                cp1 = cp2;
            }
            let ac = computeAC(outputList);
            let density = fixtureB.GetDensity();
            mass += ac.area * density;
            area += ac.area;
            centroid.x += ac.centroid.x * density;
            centroid.y += ac.centroid.y * density;
            fixtureB = fixtureB.GetNext();
        }
        centroid.multiplyScalar(1 / mass);
        return {area, centroid};
    }

    createFluid () {
        const uiTransform = this.node.getComponent(UITransform);
        let  w = uiTransform.width / 2;
        let  h = uiTransform.height / 2;
        this.fluidCollider = this.node.getComponent(PolygonCollider2D);
        const body = this.node.getComponent(RigidBody2D);
        body.type = 0;
        body.enabledContactListener = true;
        let polygonCollider = this.polygonCollider = this.node.getComponent(PolygonCollider2D);
        polygonCollider.points = [v2(-w, -h), v2(w, -h), v2(w, h), v2(-w, h)];
        polygonCollider.sensor = true;
        polygonCollider.density = this.density;
        polygonCollider.apply();

        if (polygonCollider) {
            polygonCollider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            polygonCollider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
        }
    }

    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact?: IPhysics2DContact) {
        const bodyB = otherCollider as PolygonCollider2D;
        this.inFluid.push(bodyB);
        if(contact){
            contact.disabled = false;
        }
    }

    onEndContact (selfCollider: Collider2D, otherCollider: Collider2D, contact?: IPhysics2DContact) {
        let bodyB = otherCollider as PolygonCollider2D;
        let index = this.inFluid.indexOf(bodyB);
        this.inFluid.splice(index, 1);
        if(contact){
            contact.disabled = true;
        }
    }

    //
    applyBuoyancy(collider: PolygonCollider2D) {
        const AC = this.findIntersectionAreaAndCentroid(collider);//get the area and centroid
        if (AC.area !== 0) {
            const b2Body = collider.body.impl.impl;
            let mass = AC.area * this.density;
            let centroid = AC.centroid;
            let b2Vec2 = PhysicsSystem2D.instance.physicsWorld.impl.m_gravity.constructor;

            let buoyancyForce = new b2Vec2(mass * this.gravity.x, mass * this.gravity.y);
            b2Body.ApplyForce(buoyancyForce, centroid);
            let body_vw = v2();
            let fluidBody_vw = v2();
            b2Body.GetLinearVelocityFromWorldPoint(centroid, body_vw);
            this.fluidCollider.body.impl.impl.GetLinearVelocityFromWorldPoint(centroid, fluidBody_vw);
            let velDir = body_vw.subtract(fluidBody_vw);
            let dragMag = this.density * this.linearDrag * mass;
            let dragForce = velDir.multiplyScalar(-dragMag);
            b2Body.ApplyForce(dragForce, centroid);
            let torque = -b2Body.GetInertia() / b2Body.GetMass() * mass * b2Body.GetAngularVelocity() * this.angularDrag;
            b2Body.ApplyTorque(torque);
        }
    }

    getVertices(collider: PolygonCollider2D) {
        let b2Body = collider.body.impl.impl;
        let shape = b2Body.m_fixtureList.m_shape;

        let vertices: Vec2[] = [];
        for (var i = 0; i < shape.m_count; i++) {

            let pos = v2(shape.m_vertices[i].x, shape.m_vertices[i].y);

            let pos_w = v2();
            b2Body.GetWorldPoint(pos, pos_w);
            vertices.push(pos_w);
        }

        return vertices;
    }

    update (dt: number) {
        const l = this.inFluid.length;
        for (let i = 0; i < l; i++) {
           this.applyBuoyancy(this.inFluid[i]);
        }
    }

}