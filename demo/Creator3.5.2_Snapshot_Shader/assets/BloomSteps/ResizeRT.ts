import { _decorator, Component, Node, RenderTexture, view } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ResizeStatic')
export class ResizeStatic extends Component {
    @property([RenderTexture])
    rts: RenderTexture[] = [];

    start() {
        this.rts.forEach(rt => {
            rt.resize(view.getFrameSize().width * view.getDevicePixelRatio(), view.getFrameSize().height * view.getDevicePixelRatio());
        })
    }

    update(deltaTime: number) {

    }
}

