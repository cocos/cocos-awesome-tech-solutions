import { _decorator, Component, Prefab, Node, instantiate, UITransform, director } from 'cc';
import NodeX from './NodeX';
const { ccclass, property } = _decorator;

import { QuadTree, NodeQ, BoundsNode } from "./QuadTree";

@ccclass('Controller')
export default class Controller extends Component {
    @property(Prefab)
    nodePrefab: Prefab | null = null;

    private nodes: Array<Node> = [];
    private tree: QuadTree<Node> = null;

    start() {
        var bounds = {
            x: 0,
            y: 0,
            width: screen.width,
            height: screen.height
        }
        this.tree = new QuadTree(bounds, true);

        for (let i = 0; i < 250; i++) {
            let newNode = instantiate(this.nodePrefab);
            this.node.addChild(newNode);
            this.nodes.push(newNode);
        }
        this.tree.insert(this.nodes);
    }

    update(dt: number) {
        for (let i in this.nodes) {

            this.nodes[i].getComponent(NodeX).setIsCollision(false);
        }

        this.tree.clear();
        this.tree.insert(this.nodes);

        for (let i in this.nodes) {
            let curNode = this.nodes[i];
            let items = this.tree.retrieve(curNode);
            for (let i in items) {
                let item = items[i];
                if (item.uuid == curNode.uuid) {
                    continue;
                }

                let curScript = curNode.getComponent(NodeX);
                let itemScript = item.getComponent(NodeX);

                // @ts-ignore
                if (curScript.isCollision && itemScript.isCollision) {
                    continue;
                }

                let isCollisionBox = this.isCollision(curNode, item);
                // @ts-ignore
                if (!curScript.isCollision) {
                    // @ts-ignore
                    curScript.setIsCollision(isCollisionBox);
                }

                // @ts-ignore
                if (!itemScript.isCollision) {
                    // @ts-ignore
                    itemScript.setIsCollision(isCollisionBox);
                }
            }
        }
    }

    isCollision(node1: Node, node2: Node) {
        let nodePos1 = node1.getPosition();
        let nodePos2 = node2.getPosition();
        let node1Left = nodePos1.x;
        let node2Left = nodePos2.x;
        let nodeTrans1 = node1.getComponent(UITransform);
        let nodeTrans2 = node2.getComponent(UITransform);
        let node1Top = nodePos1.y - nodeTrans1.height;
        let node2Top = nodePos2.y - nodeTrans2.height;

        return node1Left < node2Left + nodeTrans2.width &&
            node1Left + nodeTrans1.width > node2Left &&
            node1Top < node2Top + nodeTrans2.height &&
            node1Top + nodeTrans1.height > node2Top
    }

    onClickOff() {
        director.loadScene("NoOptimization");
    }
}
