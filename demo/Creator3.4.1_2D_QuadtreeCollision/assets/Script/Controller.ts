import { _decorator, Component, Prefab, Node, instantiate, UITransform } from 'cc';
import NodeX from './NodeX';
const { ccclass, property } = _decorator;

import { QuadTree, NodeQ, BoundsNode } from "./QuadTree";

@ccclass('Controller')
export default class NewClass extends Component {
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

        for (let i = 0; i < 150; i++) {
        let newNode = instantiate(this.nodePrefab);
        this.node.addChild(newNode);
        this.nodes.push(newNode);
        }
        this.tree.insert(this.nodes);
    }

    update(dt) {

        for (let i in this.nodes) {
            // @ts-ignore
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

                let isCollision = this.isCollision(curNode, item);

                // @ts-ignore
                if (!curScript.isCollision) {
                    // @ts-ignore
                    curScript.setIsCollision(isCollision);
                }

                // @ts-ignore
                if (!itemScript.isCollision) {
                    // @ts-ignore
                    itemScript.setIsCollision(isCollision);
                }
            }
        }
    }

    isCollision(node1: Node, node2: Node) {
        let node1Left = node1.getPosition().x;
        let node2Left = node2.getPosition().x;
        let node1Top = node1.getPosition().y - node1.getComponent(UITransform).height;
        let node2Top = node2.getPosition().y - node2.getComponent(UITransform).height;

        return node1Left < node2Left + node2.getComponent(UITransform).width &&
            node1Left + node1.getComponent(UITransform).width > node2Left &&
            node1Top < node2Top + node2.getComponent(UITransform).height &&
            node1Top + node1.getComponent(UITransform).height > node2Top
    }
}
