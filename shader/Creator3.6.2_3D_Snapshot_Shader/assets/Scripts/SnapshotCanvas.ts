import { _decorator, Component, Node, Label, Sprite } from 'cc';
import { SnapshotFilter } from './SnapshotFilter';
const { ccclass, property } = _decorator;

@ccclass('SnapshotCanvas')
export class SnapshotCanvas extends Component {
    @property(Label)
    filterEffectText: Label = null;

    SetFilterProperties(filter: SnapshotFilter) {
        this.filterEffectText.string = filter.GetName();
    }
}
