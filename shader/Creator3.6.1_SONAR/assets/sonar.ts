import { _decorator, Component, Node, Vec4, MeshRenderer, ICollisionEvent, Collider, PhysicsSystem, director } from 'cc';
const { ccclass, property } = _decorator;

// The number of rings that can be rendered at once.
// Must be the samve value as the array size in the shader.
const QueueSize = 20;

@ccclass('Sonar')
export class Sonar extends Component {
    @property(Node)
    targets: Node = null!;

    // All the renderers that will have the sonar data sent to their shaders.
    private ObjectRenderers: MeshRenderer[] = [];

    // Throwaway values to set position to at the start.
    private static GarbagePosition: Vec4 = new Vec4(-5000, -5000, -5000, -5000);

    // Queue of start positions of sonar rings.
    // The xyz values hold the xyz of position.
    // The w value holds the time that position was started.
    private static positionsQueue: Vec4[] = [];

    // Queue of intensity values for each ring.
    // These are kept in the same order as the positionsQueue.
    private static intensityQueue: Vec4[] = [];

    // Make sure only 1 object initializes the queues.
    private static NeedToInitQueues = true;

    start() {
        // Get renderers that will have effect applied to them
        this.ObjectRenderers = this.targets.getComponentsInChildren(MeshRenderer);

        if (Sonar.NeedToInitQueues) {
            Sonar.NeedToInitQueues = false;
            // Fill queues with starting values that are garbage values
            for (let i = 0; i < QueueSize; i++) {
                Sonar.positionsQueue.push(Sonar.GarbagePosition);
                Sonar.intensityQueue.push(new Vec4(-5000));
            }
        }

        // 启动物理引擎
        PhysicsSystem.instance.enable = true;

        // 监听触发事件
        let collider = this.node.getComponent(Collider);
        collider.on('onCollisionEnter', this.OnCollisionEnter, this);
    }

    private sonarData(position: Vec4, intensity: number) {

        // Put values into the queue
        position.w = director.root.cumulativeTime; // (new Date()).getTime();
        Sonar.positionsQueue.splice(Sonar.positionsQueue.length - 1, 1);
        Sonar.positionsQueue.unshift(position);
        Sonar.intensityQueue.splice(Sonar.intensityQueue.length - 1, 1);
        Sonar.intensityQueue.unshift(new Vec4(intensity));

        // Send updated queues to the shaders
        this.ObjectRenderers.forEach(r => {
            r.material.setProperty("_hitPts", Sonar.positionsQueue);
            r.material.setProperty("_Intensity", Sonar.intensityQueue);
        })
    }
    private OnCollisionEnter(event: ICollisionEvent) {
        let pos: Vec4 = new Vec4();
        event.contacts[0].getWorldPointOnA(pos);
        // Start sonar ring from the contact point
        this.sonarData(pos, 1.0);
    }
}


