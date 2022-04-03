import { _decorator, Component, Prefab, Node, instantiate, UITransform, director } from 'cc';
import NodeX from './NodeX';
const { ccclass, property } = _decorator;

import { Quadtree } from "./QuadTree";
/**
 * Predefined variables
 * Name = Controller
 * DateTime = Mon Mar 14 2022 11:59:37 GMT+0800 (中国标准时间)
 * Author = 热心网友蒋先生
 * FileBasename = Controller.ts
 * FileBasenameNoExtension = Controller
 * URL = db://assets/Controller.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('Controller')
export default class Controller extends Component {
    @property(Prefab)
    nodePrefab: Prefab | null = null;

    private nodes: Array<Node> = [];
    private tree: Quadtree = null;

    start() {
        var bounds = {
            x: 0,
            y:0,
            width: screen.width,
            height: screen.height
        }
        this.tree = new Quadtree(bounds, true);

        for (let i = 0; i < 250; i++) {
            let newNode = instantiate(this.nodePrefab);
            this.node.addChild(newNode);
            this.nodes.push(newNode);
             this.tree.insert(newNode);
        }
    }
    
    update(dt: number) {
       
        this.quadTreeCheck();
    }

    /**
     * 四叉树碰撞检测
     */
     quadTreeCheck() {
        for (let node of this.nodes) {
            node.getComponent(NodeX).setIsCollision(false)
            this.tree.insert(node);
        }
        for (let i = 0; i < this.nodes.length; i++) {
            let node = this.nodes[i]
            let targetNodes = this.tree.retrieve(node)
            console.log("targetNodes=",targetNodes.length);
            for (let j = 0; j < targetNodes.length; j++) {
                let targetNode = targetNodes[j]
                if (targetNode === node) continue
                let isCollision: any = this.isCollision(targetNode,node)
                if (isCollision) {
                    node.getComponent(NodeX).setIsCollision(isCollision)
                    targetNode.getComponent(NodeX).setIsCollision(isCollision)
                }

            }
        }
        this.tree.clear();
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
