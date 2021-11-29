import { _decorator, Component, Node, UITransform, Vec2, Vec3, assetManager,
    AssetManager, Button, EventHandler, Sprite, Color } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('DrawHelper')
export default class DrawHelper extends Component {
    private static tempVec3 = new Vec3();

    static convertToDrawNodePos(drawNode: Node, worldPos: Vec2): Vec2 {
        this.tempVec3.set(worldPos.x, worldPos.y, 0);
        let pos = drawNode.getComponent(UITransform).convertToNodeSpaceAR(this.tempVec3);
        pos.x += drawNode.getComponent(UITransform).width * drawNode.getComponent(UITransform).anchorX;
        pos.y += drawNode.getComponent(UITransform).height * drawNode.getComponent(UITransform).anchorY;
        pos.y = drawNode.getComponent(UITransform).height - pos.y;
        return new Vec2(pos.x, pos.y);
    }

    /**
     * 加载资源
     * @param bundlePath bundle的路径
     * @param prefabPath 资源预制体的路径
     * @param resType 加载的资源类型
     * @param parent 父节点
     * @param callback 回调
     */
    static loadRes (bundlePath: string, prefabPath: string, resType: any, callback:Function = null!) {
        assetManager.loadBundle(bundlePath, (err: any, bundle: AssetManager.Bundle) => {
            if (err) {
                console.log(`bundle load error, reason :${err}`);
                return ;
            }

            bundle.load(prefabPath, resType, (err: any, data: any) => {
                if (err) {
                    console.log(`prefab load error, reason :${err}`);
                    return ;
                }

                if (callback) {
                    callback(data);
                }
            })
        });
    }

    /**
     * 添加按钮的监听方法
     * @param child 子节点
     * @param target 目标节点
     * @param component 脚本名
     * @param handler 函数名
     * @param customEventData 自定义参数
     */
    static addButtonEvent (child: Node, target: Node, component: string, handler: string, customEventData: any) {
        let button = child.addComponent(Button);
        let evt = new EventHandler();
        evt.target = target;
        evt.component = component;
        evt.handler = handler;
        evt.customEventData = customEventData;
        button.clickEvents.push(evt);
    }
};