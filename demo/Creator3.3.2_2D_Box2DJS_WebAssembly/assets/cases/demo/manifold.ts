import { _decorator, Component, Node, tween, SpriteComponent, Color, instantiate, Collider2D, Contact2DType } from 'cc';
const { ccclass, property, type } = _decorator;

@ccclass('Manifold')
export class Manifold extends Component {
    @type(Node)
    pointTemp: Node = null;

    start () {
        // Your initialization goes here.
        let collider = this.getComponent(Collider2D);
        if (collider) {
            collider.on(Contact2DType.PRE_SOLVE, this.onPreSolve, this);
        }
    }

    // update (deltaTime: number) {
    //     // Your update function goes here.
    // }

    onPreSolve (selfCollider, otherCollider, contact: any) {
        let worldManifold = contact.getWorldManifold();
        let points = worldManifold.points;
 
        for (let i = 0; i < points.length; i++) {
            let p = points[i];
            
            let node = instantiate(this.pointTemp);
            node.active = true;
 
            let sprite = node.getComponent(SpriteComponent);
            let newColor = new Color(sprite.color);
            newColor.a = 0;
            tween(sprite)
                .to(0.5, { color: newColor} )
                .call(() => {
                    node.parent = null;
                })
                .start();
 
            node.parent = this.node.parent;
            node.setWorldPosition(p.x, p.y, 0);
        }
    }
}
