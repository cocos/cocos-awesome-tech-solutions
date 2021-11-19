import { _decorator, Component, Node, find, SystemEventType, Graphics, Vec2, Touch, PhysicsSystem2D, ERaycast2DType, RaycastResult2D, Intersection2D, director, RigidBody2D, PolygonCollider2D, Vec3, EPhysics2DDrawFlags } from 'cc';
const { ccclass, type } = _decorator;

// http://www.emanueleferonato.com/2011/08/05/slicing-splitting-and-cutting-objects-with-box2d-part-4-using-real-graphics/

const EPSILON = 0.1;
const POINT_SQR_EPSILON = 5;

function compare (a: RaycastResult2D, b: RaycastResult2D) {
    if (a.fraction > b.fraction) {
        return 1;
    } else if (a.fraction < b.fraction) {
        return -1;

    }
    return 0;
}

function equals (a: number, b: number, epsilon?: number) {
    epsilon = epsilon === undefined ? EPSILON : epsilon;
    return Math.abs(a - b) < epsilon;
}

function pointInLine (point: Vec2, a: Vec2, b: Vec2) {
    return Intersection2D.pointLineDistance(point, a, b, true) < 1;
}

@ccclass('CuttingObjects')
export class CuttingObjects extends Component {

    touching = false;
    @type(Graphics)
    ctx: Graphics = null;

    touchStartPoint = new Vec2;
    touchPoint = new Vec2;

    r1: RaycastResult2D[] = []
    r2: RaycastResult2D[] = []
    results: RaycastResult2D[] = []

    start () {
        this.node.on(SystemEventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(SystemEventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(SystemEventType.TOUCH_MOVE, this.onTouchMove, this);

        this.ctx.node.worldPosition = Vec3.ZERO;
    }

    onTouchStart (event: Touch) {
        this.touching = true;
        this.r1.length = 0;
        this.r2.length = 0;
        this.results.length = 0;

        this.touchStartPoint.set(event.getUILocation());
        this.touchPoint.set(event.getUILocation());
    }

    onTouchMove (event: Touch) {
        this.touchPoint.set(event.getUILocation());
    }

    onTouchEnd (event: Touch) {
        this.touchPoint.set(event.getUILocation());
        this.recalcResults();
        this.touching = false;

        if (equals(Vec2.squaredDistance(this.touchStartPoint, event.getUILocation()), 0)) return;

        // recalculate fraction, make fraction from one direction
        this.r2.forEach(r => {
            r.fraction = 1 - r.fraction;
        });

        let results = this.results;

        let pairs: RaycastResult2D[][] = [];

        for (let i = 0; i < results.length; i++) {
            let find = false;
            let result = results[i];

            for (let j = 0; j < pairs.length; j++) {
                let pair = pairs[j];
                if (pair[0] && result.collider === pair[0].collider) {
                    find = true;

                    // one collider may contains several fixtures, so raycast may through the inner fixture side
                    // we need remove them from the result
                    let r = pair.find((r) => {
                        return Vec2.squaredDistance(r.point, result.point) <= POINT_SQR_EPSILON;
                    });

                    if (r) {
                        pair.splice(pair.indexOf(r), 1);
                    }
                    else {
                        pair.push(result);
                    }

                    break;
                }
            }

            if (!find) {
                pairs.push([result]);
            }
        }

        for (let i = 0; i < pairs.length; i++) {
            let pair = pairs[i];
            if (pair.length < 2) {
                continue;
            }

            // sort pair with fraction
            pair = pair.sort(compare);

            let splitResults = [];

            // first calculate all results, not split collider right now
            for (let j = 0; j < (pair.length - 1); j += 2) {
                let r1 = pair[j];
                let r2 = pair[j + 1];

                if (r1 && r2) {
                    this.split(r1.collider, r1.point, r2.point, splitResults);
                }
            }

            if (splitResults.length <= 0) {
                continue;
            }

            let collider = pair[0].collider as PolygonCollider2D;

            let maxPointsResult;
            for (let j = 0; j < splitResults.length; j++) {
                let splitResult = splitResults[j];

                for (let k = 0; k < splitResult.length; k++) {
                    if (typeof splitResult[k] === 'number') {
                        splitResult[k] = collider.points[splitResult[k]];
                    }
                }

                if (!maxPointsResult || splitResult.length > maxPointsResult.length) {
                    maxPointsResult = splitResult;
                }
            }

            if (maxPointsResult.length < 3) {
                continue;
            }

            // keep max length points to origin collider
            collider.points = maxPointsResult;
            collider.apply();

            let body = collider.body;

            for (let j = 0; j < splitResults.length; j++) {
                let splitResult = splitResults[j];

                if (splitResult.length < 3) continue;
                if (splitResult == maxPointsResult) continue;

                // create new body
                let node = new Node();
                node.parent = this.node;
                node.worldPosition = body.node.worldPosition;
                node.worldRotation = body.node.worldRotation;

                node.addComponent(RigidBody2D);

                let newCollider = node.addComponent(PolygonCollider2D);
                newCollider.points = splitResult;
                newCollider.apply();
            }

        }
    }

    split (collider, p1, p2, splitResults) {
        let body = collider.body;
        let points = collider.points;


        // The manager.rayCast() method returns points in world coordinates, so use the body.getLocalPoint() to convert them to local coordinates.
        p1 = body.getLocalPoint(p1);
        p2 = body.getLocalPoint(p2);


        let newSplitResult1 = [p1, p2];
        let newSplitResult2 = [p2, p1];

        let index1, index2;
        for (let i = 0; i < points.length; i++) {
            let pp1 = points[i];
            let pp2 = i === points.length - 1 ? points[0] : points[i + 1];

            if (index1 === undefined && pointInLine(p1, pp1, pp2)) {
                index1 = i;
            }
            else if (index2 === undefined && pointInLine(p2, pp1, pp2)) {
                index2 = i;
            }

            if (index1 !== undefined && index2 !== undefined) {
                break;
            }
        }

        // console.log(index1 + ' : ' + index2);

        if (index1 === undefined || index2 === undefined) {
            debugger
            return;
        }

        let splitResult, indiceIndex1 = index1, indiceIndex2 = index2;
        if (splitResults.length > 0) {
            for (let i = 0; i < splitResults.length; i++) {
                let indices = splitResults[i];
                indiceIndex1 = indices.indexOf(index1);
                indiceIndex2 = indices.indexOf(index2);

                if (indiceIndex1 !== -1 && indiceIndex2 !== -1) {
                    splitResult = splitResults.splice(i, 1)[0];
                    break;
                }
            }
        }

        if (!splitResult) {
            splitResult = points.map((p, i) => {
                return i;
            });
        }

        for (let i = indiceIndex1 + 1; i !== (indiceIndex2 + 1); i++) {
            if (i >= splitResult.length) {
                i = 0;
            }

            let p = splitResult[i];
            p = typeof p === 'number' ? points[p] : p;

            if (Vec2.squaredDistance(p, p1) < POINT_SQR_EPSILON || Vec2.squaredDistance(p, p2) < POINT_SQR_EPSILON) {
                continue;
            }

            newSplitResult2.push(splitResult[i]);
        }

        for (let i = indiceIndex2 + 1; i !== indiceIndex1 + 1; i++) {
            if (i >= splitResult.length) {
                i = 0;
            }

            let p = splitResult[i];
            p = typeof p === 'number' ? points[p] : p;

            if (Vec2.squaredDistance(p, p1) < POINT_SQR_EPSILON || Vec2.squaredDistance(p, p2) < POINT_SQR_EPSILON) {
                continue;
            }

            newSplitResult1.push(splitResult[i]);
        }

        splitResults.push(newSplitResult1);
        splitResults.push(newSplitResult2);
    }

    recalcResults () {
        if (!this.touching) return;

        let startPoint = this.touchStartPoint;
        let point = this.touchPoint;

        this.ctx.clear();
        this.ctx.moveTo(startPoint.x, startPoint.y);
        this.ctx.lineTo(point.x, point.y);
        this.ctx.stroke();

        // manager.rayCast() method calls this function only when it sees that a given line gets into the body - it doesnt see when the line gets out of it.
        // I must have 2 intersection points with a body so that it can be sliced, thats why I use manager.rayCast() again, but this time from B to A - that way the point, at which BA enters the body is the point at which AB leaves it!
        let r1 = PhysicsSystem2D.instance.raycast(startPoint, point, ERaycast2DType.All);
        let r2 = PhysicsSystem2D.instance.raycast(point, startPoint, ERaycast2DType.All);

        let results = r1.concat(r2);

        results = results.filter(r => r.collider instanceof PolygonCollider2D);

        for (let i = 0; i < results.length; i++) {
            let p = results[i].point;
            this.ctx.circle(p.x, p.y, 5);
        }
        this.ctx.fill();

        this.r1 = r1.concat([]);
        this.r2 = r2.concat([]);
        this.results = results;
    }

    // called every frame, uncomment this function to activate update callback
    update (dt) {
        // body maybe moving, need calc raycast results in update
        this.recalcResults();
    }
}
