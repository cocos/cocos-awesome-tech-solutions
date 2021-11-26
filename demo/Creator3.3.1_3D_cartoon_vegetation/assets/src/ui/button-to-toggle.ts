
import { _decorator, Component, Node, Toggle, Button, EventHandler } from 'cc';
const { ccclass, type } = _decorator;

@ccclass('ButtonToToggle')
export class ButtonToToggle extends Component {
    @type(Toggle)
    toggle: Toggle | null = null;

    start () {
        this.node.on(Node.EventType.TOUCH_END, this.changeToggle, this);
    }

    changeToggle () {
        let btn = this.node.getComponent(Button);
        if (btn && btn.interactable && this.toggle) {
            this.toggle.isChecked = !this.toggle.isChecked;
        }
    }
}
