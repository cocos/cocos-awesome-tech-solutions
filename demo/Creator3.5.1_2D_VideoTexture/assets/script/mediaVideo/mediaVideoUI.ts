import { _decorator, Component, Node, sys } from 'cc';
import { MediaVideo } from './mediaVideo';
const { ccclass, property } = _decorator;

@ccclass('MediaVideoUI')
export class MediaVideoUI extends Component {
    @property(MediaVideo)
    public mediaVideo: MediaVideo = null;

    start() {
        
        // 
        // this.mediaVideo.setVolume(0);
        // this.scheduleOnce(() => {
            // this.mediaVideo.setVolume(1);
        // }, 5);
    }

    update(deltaTime: number) {
        
    }
}

