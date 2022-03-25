import { _decorator, Component, Label, Sprite, Button, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ListItem')
export class ListItem extends Component {
    @property(Label)
    public label: Label = null;
    @property
    public url = '';
    @property(Sprite)
    public bg: Sprite | null = null;
    @property(Button)
    public btn: Button | null = null;
    index = -1;
    menu = null;
    init (menu: any) {
        this.index = -1;
        this.menu = menu;
    }

    loadExample () {
        if (this.url) {
           this.menu.loadScene(this.url);
        }
    }

    updateItem (idx: any, y: any, name: any, url: any) {
        let isDir = !url;
        this.index = idx;
        this.node.setPosition(new Vec3(isDir ? 50 : 100,y,0));
        this.label.string = name;
        this.url = url;
        this.bg.enabled = !isDir;
        this.btn.interactable = !isDir;
    }

}
