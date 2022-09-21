import { _decorator, Component, Node, Vec2, Vec3, Mat4, systemEvent, SystemEventType, Touch, CameraComponent, geometry, PhysicsSystem, ModelComponent, instantiate, utils, ColliderComponent, BoxColliderComponent, MeshColliderComponent, RigidBodyComponent, MeshRenderer, Mesh, assetManager, resources, Material } from 'cc';
import { FastHull } from './FastHull'

const { ccclass, property } = _decorator;

@ccclass('TouchSplit')
export class TouchSplit extends Component {

    @property(CameraComponent)
    cameraCom: CameraComponent = null!;


    @property
    cutOnce: boolean = false;

    protected addRig: boolean = false;

    public raycastCount: number = 256;

    protected started: boolean = false;
    protected startPos: Vec3 = new Vec3();
    protected endPos: Vec3 = new Vec3();

    protected near: number = 0;

    protected physicsSystem = PhysicsSystem.instance;

    start() {
        this.startPos = new Vec3(0, 0, 0);
        this.endPos = new Vec3(0, 0, 0);

        systemEvent.on(SystemEventType.TOUCH_START, this.onTouchStart, this);
        systemEvent.on(SystemEventType.TOUCH_END, this.onTouchEnd, this);
    }

    onTouchStart(touch: Touch) {

        this.near = this.cameraCom.near;

        this.startPos.set(touch.getLocationX(), touch.getLocationY(), this.near);

        this.started = true;
    }

    onTouchEnd(touch: Touch) {

        if (!this.started) return;

        this.started = false;

        this.endPos.set(touch.getLocationX(), touch.getLocationY(), this.near);

        let line = Vec3.subtract(new Vec3(), this.cameraCom.screenToWorld(this.endPos), this.cameraCom.screenToWorld(this.startPos));


        let splitMeshs: any[] = [];

        for (let i = 0; i < this.raycastCount; i++) {
            let pos = Vec3.lerp(new Vec3(), this.startPos, this.endPos, i / this.raycastCount)
            let ray = this.cameraCom.screenPointToRay(pos.x, pos.y);

            if (this.physicsSystem.raycast(ray)) {
                let results = this.physicsSystem.raycastResults;
                results.forEach((result) => {
                    let splitPlane = geometry.plane.fromNormalAndPoint(new geometry.plane(), Vec3.cross(new Vec3(), line, ray.d).normalize(), result.hitPoint);
                    let splitNode = result.collider.node;
                    let splitMesh = { splitNode: splitNode, plane: splitPlane };

                    if (!splitMeshs.some((splitMesh) => splitMesh.splitNode == splitNode)) {
                        splitMeshs.push(splitMesh);
                    }
                })
            }
        }

        for (let i = 0, l = splitMeshs.length; i < l; i++) {
            this.splitMesh(splitMeshs[i].splitNode, splitMeshs[i].plane);
        }

    }

    splitMesh(splitNode: Node, plane: geometry.plane) {
        let meshRender = splitNode.getComponent(MeshRenderer);
        let modelMesh = meshRender?.mesh as Mesh;

        let mesh = utils.readMesh(modelMesh);

        mesh.minPos = modelMesh.minPosition;
        mesh.maxPos = modelMesh.maxPosition;

        // let splitSize = Vec3.subtract(new Vec3(), mesh.maxPos as Vec3, mesh.minPos as Vec3);
        let splitCenter = Vec3.add(new Vec3(), mesh.maxPos as Vec3, mesh.minPos as Vec3).multiplyScalar(1 / 2);
        let splitMaterial = meshRender?.sharedMaterial;
        let splitCollider = splitNode.getComponent(ColliderComponent)

        let hull = new FastHull(mesh);


        let localPoint = Vec3.transformMat4(new Vec3(), plane.n.multiplyScalar(plane.d), Mat4.invert(new Mat4(), splitNode.worldMatrix));
        let localNormal = Vec3.transformMat4(new Vec3(), plane.n, Mat4.invert(new Mat4(), splitNode.getWorldRS()));

        localNormal.normalize();

        let hullArray = hull.Split(localPoint, localNormal, true);

        hullArray.forEach((meshData, index) => {
            let mesh = utils.createMesh(meshData, new Mesh(), { calculateBounds: true });;
            let node = new Node();
            let model = node.addComponent(MeshRenderer);

            model.mesh = mesh;

            model.setMaterial(splitMaterial!, 0);

            node.setScale(splitNode.scale);

            node.setRotation(splitNode.rotation);

            node.setParent(this.node.parent);

            if (!this.cutOnce) {
                if (splitCollider instanceof MeshColliderComponent) {
                    let colliderComponent = node.addComponent(MeshColliderComponent);
                    colliderComponent.mesh = mesh;
                }
                else if (splitCollider instanceof BoxColliderComponent) {
                    let colliderComponent = node.addComponent(BoxColliderComponent);
                    colliderComponent.shape.setCenter(splitCenter);
                }
            }

            if (this.addRig) {
                node.addComponent(RigidBodyComponent);
            }
            else {
                if (index == 0) {
                    node.setPosition(Vec3.transformMat4(new Vec3(), localNormal, Mat4.invert(new Mat4(), splitNode.getWorldRS())).multiply(splitNode.scale).multiplyScalar(0.2).add(splitNode.position));
                }
                else {
                    node.setPosition(Vec3.transformMat4(new Vec3(), Vec3.negate(new Vec3(), localNormal), Mat4.invert(new Mat4(), splitNode.getWorldRS())).multiply(splitNode.scale).multiplyScalar(0.2).add(splitNode.position));
                }
            }
        })

        if (hullArray.length > 0) {
            splitNode.destroy();
        }

    }

}




