
import { _decorator, Component, Node, Prefab, instantiate, Intersection2D, math, UITransform, director } from 'cc';
import NodeX from './NodeX';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = Compare
 * DateTime = Mon Mar 14 2022 11:59:37 GMT+0800 (中国标准时间)
 * Author = 蒋立鑫
 * FileBasename = Compare.ts
 * FileBasenameNoExtension = Compare
 * URL = db://assets/Compare.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('Compare')
export class Compare extends Component {
    @property(Prefab)
    nodePrefab: Prefab | null = null;
    private nodes: Array<Node> = [];

    start() {
        // [3]


        for (let i = 0; i < 250; i++) {
            let newNode = instantiate(this.nodePrefab);
            this.node.addChild(newNode);
            this.nodes.push(newNode);
        }
    }

    update(deltaTime: number) {
        for (let i in this.nodes) {
            this.nodes[i].getComponent(NodeX).setIsCollision(false);
        }
        for (let i in this.nodes) {
            for (let j in this.nodes) {
                if (this.nodes[i].uuid == this.nodes[j].uuid) {
                    continue;
                }
                let curScript: NodeX = this.nodes[i].getComponent(NodeX);
                let itemScript: NodeX = this.nodes[j].getComponent(NodeX);
                if (curScript.isCollision && itemScript.isCollision) {
                    continue;
                }
                let isCollisionBox: boolean = this.nodes[i].getComponent(UITransform).getBoundingBoxToWorld().intersects(this.nodes[j].getComponent(UITransform).getBoundingBoxToWorld())
                if (!curScript.isCollision) {
                    curScript.setIsCollision(isCollisionBox); 
                }
                if (!itemScript.isCollision) {
                    itemScript.setIsCollision(isCollisionBox);
                }
               
            }
        }
    }

    onClickOpen() {
        director.loadScene("main");
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
}

