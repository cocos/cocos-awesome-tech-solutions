import { _decorator, Component, Prefab, ScrollView, instantiate, Vec2, Vec3, game, path, assetManager, UITransform, Size } from 'cc';
import { ListItem } from './ListItem';
const { ccclass, property } = _decorator;

@ccclass('SceneList')
export class SceneList extends Component {
    @property(Prefab)
    public itemPrefab: Prefab = null;
    @property
    public initItemCount = 0;
    @property(ScrollView)
    public scrollView: ScrollView | null = null;
    @property
    public bufferZone = 0;
    menu = null;
    sceneList = [];
    itemList = [];
    updateTimer = 0;
    updateInterval = 0.2;
    lastContentPosY = 0;
    createItem(x: any, y: any, name: any, url: any) {
        var item = instantiate(this.itemPrefab);
        var itemComp = item.getComponent(ListItem);
        var label = itemComp.label;
        label.string = name;
        if (url) {
            itemComp.url = url;
        }
        item.setPosition(new Vec3(x, y, 0));

        this.node.addChild(item);
        return item;
    }

    init(menu: any) {
        this.menu = menu;
        this.sceneList = [];
        this.itemList = [];
        this.updateTimer = 0;
        this.updateInterval = 0.2;
        this.lastContentPosY = 0; // use this variable to detect if we are scrolling up or down
        this.initList();
    }

    initList() {
        // var scenes = game._sceneInfos; //is deprecated
        let scenes = [];
        if (assetManager.main) {
            assetManager.main.config.scenes.forEach((val) => {
                scenes.push(val);
            });
        }
        var dict = {};
        if (scenes) {
            var i, j;
            for (i = 0; i < scenes.length; ++i) {
                let url = scenes[i].url;
                let dirname = path.dirname(url).replace('db://assets/cases/', '');
                if (dirname === 'db://assets/resources/test assets') {
                    continue;
                }
                let scenename = path.basename(url, '.fire');
                if (scenename === 'TestList') continue;
                if (!dirname) dirname = '_root';
                if (!dict[dirname]) {
                    dict[dirname] = {};
                }
                dict[dirname][scenename] = url;
            }
        } else {
            console.log('failed to get scene list!');
        }
        let dirs = Object.keys(dict);
        dirs.sort();
        for (let i = 0; i < dirs.length; ++i) {
            this.sceneList.push({
                name: dirs[i],
                url: null
            });
            let scenenames = Object.keys(dict[dirs[i]]);
            scenenames.sort();
            for (let j = 0; j < scenenames.length; ++j) {
                let name = scenenames[j];
                this.sceneList.push({
                    name: name,
                    url: dict[dirs[i]][name]
                });
            }
        }
        let y = 0;
        let com = this.node.getComponent(UITransform);
        com.setContentSize(new Size(com.width,(this.sceneList.length + 1) * 50))
        for (let i = 0; i < this.initItemCount; ++i) {
            let item = instantiate(this.itemPrefab).getComponent(ListItem);
            let itemInfo = this.sceneList[i];
            item.init(this.menu);
            this.node.addChild(item.node);
            y -= 50;
            item.updateItem(i, y, itemInfo.name, itemInfo.url);
            this.itemList.push(item);
        }
    }

    getPositionInView(item: any) {
        let worldPos = item.parent.getComponent(UITransform).convertToWorldSpaceAR(item.position);
        let viewPos = this.scrollView.node.getComponent(UITransform).convertToNodeSpaceAR(worldPos);
        return viewPos;
    }

    update(dt: any) {
        this.updateTimer += dt;
        if (this.updateTimer < this.updateInterval) {
           return; // we don't need to do the math every frame
        }
        this.updateTimer = 0;
        let items = this.itemList;
        let buffer = this.bufferZone;
        let isDown = this.node.position.y < this.lastContentPosY; // scrolling direction
        let curItemCount = this.itemList.length;
        let offset = 50 * curItemCount;
        for (let i = 0; i < curItemCount; ++i) {
           let item = items[i];
           let itemNode = item.node;
           let viewPos = this.getPositionInView(itemNode);
           if (isDown) {
               if (viewPos.y < -buffer && itemNode.y + offset < 0) {
                   let newIdx = item.index - curItemCount;
                   let newInfo = this.sceneList[newIdx];
                   item.updateItem(newIdx, itemNode.y + offset, newInfo.name, newInfo.url );
               }
           } else {
               if (viewPos.y > buffer && itemNode.y - offset > -this.node.getComponent(UITransform).height) {
                   let newIdx = item.index + curItemCount;
                   let newInfo = this.sceneList[newIdx];
                   item.updateItem(newIdx, itemNode.y - offset, newInfo.name, newInfo.url);
               }
           }
        }
        this.lastContentPosY = this.node.position.y;
    }

}


