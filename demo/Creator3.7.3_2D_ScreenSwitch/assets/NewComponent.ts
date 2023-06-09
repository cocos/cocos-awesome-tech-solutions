
import { _decorator, Component, screen, sys, macro, view, Size, find, Canvas, Widget, ResolutionPolicy } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = NewComponent
 * DateTime = Tue Feb 08 2022 17:22:05 GMT+0800 (中国标准时间)
 * Author = Koei
 * FileBasename = NewComponent.ts
 * FileBasenameNoExtension = NewComponent
 * URL = db://assets/NewComponent.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */

@ccclass('NewComponent')
export class NewComponent extends Component {
    // [1]
    // dummy = '';

    // [2]
    // @property
    // serializableDummy = 0;
    _dir = '';
    canvas: Canvas = null;

    start() {
        this.canvas = this.node.getComponent(Canvas)
        find('Canvas/bt').on('click', this.onClick, this)

    }

    onClick() {
        this._dir = this._dir == 'V' ? 'H' : 'V'  //H横屏  V竖屏
        if (sys.os == sys.OS.ANDROID)
            jsb.reflection.callStaticMethod('com/cocos/game/AppActivity', 'setOrientation', '(Ljava/lang/String;)V', this._dir)
        else if (sys.os == sys.OS.IOS)
            jsb.reflection.callStaticMethod('AppDelegate', 'setOrientation:', this._dir)

        let frameSize = screen.windowSize;
        console.log('frameSize: ' + frameSize.width + '   ' + frameSize.height)
        // return
        if (this._dir == 'V') {
            view.setOrientation(macro.ORIENTATION_PORTRAIT)
            if (frameSize.width > frameSize.height)
                screen.windowSize = new Size(frameSize.height, frameSize.width)
            // this.canvas.designResolution = new Size(720,1280)
            view.setDesignResolutionSize(720, 1280, ResolutionPolicy.FIXED_HEIGHT)


        }
        else {
            view.setOrientation(macro.ORIENTATION_LANDSCAPE)
            if (frameSize.height > frameSize.width)
                screen.windowSize = new Size(frameSize.height, frameSize.width)
            // this.canvas.designResolution =  new Size(1280,720)
            view.setDesignResolutionSize(1280, 720, ResolutionPolicy.FIXED_WIDTH);

        }
        // 手机浏览器切换
        if (sys.platform == sys.Platform.MOBILE_BROWSER) {
            window.dispatchEvent(new Event('resize'));
        }

    }

    // update (deltaTime: number) {
    //     // [4]
    // }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.4/manual/zh/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.4/manual/zh/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.4/manual/zh/scripting/life-cycle-callbacks.html
 */
