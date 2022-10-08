import { _decorator, Component, Node, RenderPipeline, director, Material, getPhaseID } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SetPipeline')
export class SetPipeline extends Component {
    @property(RenderPipeline)
    private pipelines: RenderPipeline = null!;

    start() {
        director.root?.setRenderPipeline(this.pipelines);
    }
}
