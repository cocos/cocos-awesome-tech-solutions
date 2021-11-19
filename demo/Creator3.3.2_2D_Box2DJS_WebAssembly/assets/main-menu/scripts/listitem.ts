import { _decorator, ButtonComponent, Component, director, LabelComponent, Node } from 'cc';
import { BackButton } from './backbutton';
import { sceneArray } from './scenelist';
const { ccclass, property } = _decorator;

@ccclass('ListItem')
export class ListItem extends Component {

    public index = -1;
    public _name = '';
    public label: LabelComponent | null = null;
    public button: ButtonComponent | null = null;

    public onload () {

    }

    public start () {
        // Your initialization goes here.
        this.index = this.node.getSiblingIndex();
        this._name = '';
        if (this.node){
            this.label = this.node.getComponentInChildren(LabelComponent) as LabelComponent;
            this.button = this.node.getComponent(ButtonComponent) as ButtonComponent;
        }
        this.updateItem(this.index, sceneArray[this.index]);
    }

    public loadScene () {
        BackButton.saveOffset();
        BackButton.saveIndex(this.index);
        this.button.interactable = false;
        director.loadScene(this._name, BackButton.refreshButton);
    }

    public updateItem (idx: number, name: string) {
        this.index = idx;
        this._name = name;
        this.label.string = name;
    }
}
