import { _decorator, Component, VideoClip, RenderableComponent, Texture2D, loader, EventHandler, game, Game, CCString, Material, Sprite, SpriteFrame, gfx, director, VideoPlayer } from 'cc';
import { JSB } from 'cc/env';
const { ccclass, property} = _decorator;
export enum EventType {     //事件类型
    PREPARING = 1,      //准备中
    LOADED = 2,         //已加载
    READY = 3,          //准备完毕
    COMPLETED = 4,      //播放完成
    ERROR = 5,          //播放错误
    PLAYING = 6,        //播放中
    PAUSED = 7,         //暂停
    STOPPED = 8,        //停止
    BUFFER_START = 9,       //
    BUFFER_UPDATE = 10,
    BUFFER_END = 11
};

enum VideoState {       //视频状态
    ERROR = -1,         // 出错状态   
    IDLE = 0,           // 置空状态
    PREPARING = 1,      //准备中
    PREPARED = 2,       //准备完成
    PLAYING = 3,        //播放中
    PAUSED = 4,         //暂停
    STOP = 5,
    COMPLETED = 5       //播放完成
};

enum ReadyState {       //准备状态
    HAVE_NOTHING = 0,       
    HAVE_METADATA = 1,
    HAVE_CURRENT_DATA = 2,
    HAVE_FUTURE_DATA = 3,
    HAVE_ENOUGH_DATA = 4    
};

enum PixelFormat {  //像素格式
    NONE = -1,      
    I420 = 0,        //yuv
    RGB = 2,        //rgb
    NV12 = 23,      //nv12
    NV21 = 24,      //nv21
    RGBA = 26       //rgba
};

const regions: gfx.BufferTextureCopy[] = [new gfx.BufferTextureCopy()];
const buffers: ArrayBufferView[] = [];
@ccclass('MediaVideo')
export class MediaVideo extends Component {

    @property
    private _source: string = '';             //视频链接
    @property
    private _clip: VideoClip = null;            //视频资源

    private _seekTime: number = 0;               //搜寻时间 
    private _nativeDuration: number = 0;         //原生的持续时间
    private _nativeWidth: number = 0;           //原生的视频宽          
    private _nativeHeight: number = 0;          //原生的视频高
    private _currentState = VideoState.IDLE;    //当前状态
    private _targetState = VideoState.IDLE;       //目标状态       
    private _pixelFormat = PixelFormat.RGBA;             //像素格式
    private _video: any = null;
    private _texture0: Texture2D = new Texture2D();     //通道0
    private _texture1: Texture2D = new Texture2D();     //通道1
    private _texture2: Texture2D = new Texture2D();     //通道2
    private _loaded: boolean = false;                   //是否加载
    private _isBuffering: boolean = false;              
    private _inBackground: boolean = false;             //是否在后台
    private _lastPlayState: boolean = false;            //上一次播放状态
    private _volume: number = -1;
    
    @property(VideoClip)
    get clip() {
        return this._clip;
    }

    set clip(value: VideoClip) {
        this._clip = value;
    }

    @property(VideoPlayer)
    VideoView: VideoPlayer = null;

    @property
    get source() {
        return this._source;
    }

    set source(value: string) {
        this._source = value;
    }

    // loop property
    @property
    cache: boolean = false;

    // loop property
    @property
    loop: boolean = false;
    
    @property(RenderableComponent)
    public render: RenderableComponent = null;

    // rgb material
    @property([Material])
    protected rgb: Material[] = [];

    // rgb material
    @property([Material])
    protected rgba: Material[] = [];

    // i420 material
    @property([Material])
    protected i420: Material[] = [];

    // nv12 material
    @property([Material])
    protected nv12: Material[] = [];

    // nv21 material
    @property([Material])
    protected nv21: Material[] = [];

    // video event handler for editor
    @property([EventHandler])
    public videoPlayerEvent: EventHandler[] = [];
    

    // current position of the video which is playing
    get currentTime() {
        if (!this._video) return 0;
        if (this._isInPlaybackState()) {
            if (JSB) {
                return this._video.currentTime();
            } else {
                return this._video.currentTime;
            }
        } else {
                return this._seekTime;
        }
    }
    
    // seek to position
    set currentTime(value: number) {
        if (!this._video) return;
        if (this._isInPlaybackState()) {
            if (JSB) {
                this._video.seek(value);
            } else {
                this._video.currentTime = value;
            }
        } else {
            this._seekTime = value;
        }
    }
    
        // duration of the video
    get duration(): number {
        if (!this._video) return 0;
        if (this._nativeDuration > 0) return this._nativeDuration;
        if (JSB) {
                this._nativeDuration = this._video.duration();
        } else {
            let duration = this._video.duration;
            this._nativeDuration = isNaN(duration) ? 0 : duration;
        }
        return this._nativeDuration;
    }
    
    get width(): number {
        if (!this._isInPlaybackState()) return 0;
        if (this._nativeWidth > 0) return this._nativeWidth;
        if (JSB) {
            this._nativeWidth = this._video.width();
        } else {
            let width = this._video.videoWidth;
            this._nativeWidth = isNaN(width) ? 0 : width;
        }
        return this._nativeWidth;
    }
    
    get height(): number {
        if (!this._isInPlaybackState()) return 0;
        if (this._nativeHeight > 0) return this._nativeHeight;
        if (JSB) {
            this._nativeHeight = this._video.height();
        } else {
            let height = this._video.videoHeight;
            this._nativeHeight = isNaN(height) ? 0 : height;
        }
        return this._nativeHeight;
    }
    
    // not accurate because native event is async, larger than actual percentage.
    get bufferPercentage(): number {
        if (!this._video) return 0;
        if (JSB) {
            return this._video.bufferPercentage();
        } else {
            return 0;
        }
    }

    start() {
        this._initialize();
        if (this._video) {
            this._updateVideoSource();
        }
    }

    /**
     * 初始化
     */
    private _initialize() {
        if (JSB) {
            this._initializeNative();
        } else {
            this._initializeBrowser();
        }
    }

    /**
     * 初始化原生
     */
    private _initializeNative() {
        //原生平台使用 FFmpeg 解析视频，不需要从 VideoPlayer 组件中获取数据源
        this.VideoView.node.destroy();

        this._video = new window.gfx.Video();
        this._video.addEventListener('loaded', () => this._onMetaLoaded());
        this._video.addEventListener('ready', () => this._onReadyToPlay());
        this._video.addEventListener('completed', () => this._onCompleted());
        this._video.addEventListener('error', () => this._onError());
        this._video.addEventListener('buffer_start', () => this._onBufferStart());
        this._video.addEventListener('buffer_update', () => this._onBufferUpdate());
        this._video.addEventListener('buffer_end', () => this._onBufferEnd());
        this._video.addEventListener('frame_update', () => this._onFrameUpdate());

    }

    /**
     * initialize browser player, register video event handler
     */
     private _initializeBrowser(): void {
        // @ts-ignore
        this._video = this.VideoView._impl._video;
        this._video.crossOrigin = 'anonymous';
        this._video.autoplay = false;
        this._video.loop = false;
        this._video.muted = false;
        // this.textures = [
        //     // @ts-ignore
        //     new cc.renderer.Texture2D(cc.renderer.device, {
        //         wrapS: gfx.WRAP_CLAMP,
        //         wrapT: gfx.WRAP_CLAMP,
        //         genMipmaps: false,
        //         premultiplyAlpha: false,
        //         flipY: false,
        //         format: gfx.TEXTURE_FMT_RGBA8
        //     })
        // ];
        this._video.addEventListener('loadedmetadata', () => this._onMetaLoaded());
        this._video.addEventListener('ended', () => this._onCompleted());
        this._loaded = false;
        let onCanPlay = () => {
            if (this._loaded || this._currentState == VideoState.PLAYING)
                return;
            if (this._video.readyState === ReadyState.HAVE_ENOUGH_DATA ||
                this._video.readyState === ReadyState.HAVE_METADATA) {
                this._video.currentTime = 0;
                this._loaded = true;
                this._onReadyToPlay();
            }
        };
        this._video.addEventListener('canplay', onCanPlay);
        this._video.addEventListener('canplaythrough', onCanPlay);
        this._video.addEventListener('suspend', onCanPlay);

        // @ts-ignore
        // let gl = cc.renderer.device._gl;
        // this.update = dt => {
        //     if (this._isInPlaybackState()) {
        //         gl.bindTexture(gl.TEXTURE_2D, this.textures[0]._glID);
        //         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.impl);
        //         // @ts-ignore
        //         cc.renderer.device._restoreTexture(0);
        //     }
        // };
    }

    /**
     * 处理视频资源
     */
    private _updateVideoSource() {
        let url = '';
        if (this._source) {
            url = this._source;
        }
        if (this._clip) {
            url = this._clip.nativeUrl;
        }
        if (url && loader.md5Pipe) {
            url = loader.md5Pipe.transformURL(url);
        }

        console.log('_updateVideoSource', url);
        if (JSB) {
            this._video.stop();
            this._video.setURL(url, this.cache);
            this._video.prepare();
        } else {
            this._loaded = false;
            this._video.pause();
            this._video.src = url;
        }

        this.node.emit('preparing', this);
        EventHandler.emitEvents(this.videoPlayerEvent, this, EventType.PREPARING);
    }

    /**
     * register game show and hide event handler
     */
     public onEnable(): void {
        game.on(Game.EVENT_SHOW, this._onShow, this);
        game.on(Game.EVENT_HIDE, this._onHide, this);
    }

    // unregister game show and hide event handler
    public onDisable(): void {
        game.off(Game.EVENT_SHOW, this._onShow, this);
        game.off(Game.EVENT_HIDE, this._onHide, this);
        this.stop();
    }

    private _onShow(): void {
        if (!this._inBackground) return;
        this._inBackground = false;
        if (this._lastPlayState) this.resume();
    }

    private _onHide(): void {
        if (this._inBackground) return;
        this._inBackground = true;
        this._lastPlayState = this.isPlaying();
        if (this._lastPlayState) this.pause();
    }

    update(deltaTime: number) {
        if (this._isInPlaybackState() && !JSB) {
            this._texture0.uploadData(this._video);
            this._updateMaterial();
        } 
    }

    private _copyTextureToTexture2D(texture2D: Texture2D, texture: gfx.Texture) {
        if (!buffers.length) {
            buffers[0] = new Uint8Array(texture.size);
        }
        regions[0].texExtent.width = texture.width;
        regions[0].texExtent.height = texture.height;
        regions[0].texSubres.mipLevel = 0;
        regions[0].texSubres.baseArrayLayer = 0;
        director.root.device.copyTextureToBuffers(texture, buffers, regions);
        texture2D.uploadData(buffers[0]);

    }

    /**
     * 更新材质
     */
    protected _updateMaterial(): void {
        let material = this.render.getMaterialInstance(0);
        if (material) {
            material.setProperty('texture0', this._texture0);
            switch (this._pixelFormat) {
                case PixelFormat.I420:
                    material.setProperty('texture2', this._texture2);
                // fall through
                case PixelFormat.NV12:
                case PixelFormat.NV21:
                    material.setProperty('texture1', this._texture1);
                    break;
            }
        }
    }


    /**
     * 更新贴图
     */
    private _updateTexture() {
        if (this.render instanceof Sprite) {
            let sprite: Sprite = this.render;
            if (sprite.spriteFrame === null) {
                sprite.spriteFrame = new SpriteFrame();
            }
            let texture = new Texture2D(); 
            this._resetTexture(texture, this.width, this.height);   
            sprite.spriteFrame.texture = texture;
        }
        this._resetTexture(this._texture0, this.width, this.height);
        let material = this.render?.material;
        material?.setProperty('texture0', this._texture0);
        switch (this._pixelFormat) {
            case PixelFormat.I420:
                this._resetTexture(this._texture1, this.width >> 1, this.height >> 1);
                material?.setProperty('texture1', this._texture1);
                this._resetTexture(this._texture2, this.width >> 1, this.height >> 1);
                material?.setProperty('texture2', this._texture2);
                break;
                // fall through
            case PixelFormat.NV12:
            case PixelFormat.NV21:
                this._resetTexture(this._texture1, this.width >> 1, this.height >> 1, gfx.Format.RG8);
                material?.setProperty('texture1', this._texture1);
                break;
        }
    }

    /**
     * 重置贴图状态
     * @param texture 贴图
     * @param width 宽
     * @param height 高
     */
    private _resetTexture(texture: Texture2D, width: number, height: number, format?: number) {
        texture.setFilters(Texture2D.Filter.LINEAR, Texture2D.Filter.LINEAR);
        texture.setMipFilter(Texture2D.Filter.LINEAR);
        texture.setWrapMode(Texture2D.WrapMode.CLAMP_TO_EDGE, Texture2D.WrapMode.CLAMP_TO_EDGE);
        

        texture.reset({
            width: width,
            height: height,
            //@ts-ignore
            format:  format ? format : JSB ?gfx.Format.R8: gfx.Format.RGB8
        });
    }

    private _onMetaLoaded() {
        this.node.emit('loaded', this);
        EventHandler.emitEvents(this.videoPlayerEvent, this, EventType.LOADED);
    }

    private _onReadyToPlay() {        
        this._updatePixelFormat();
        this._currentState = VideoState.PREPARED;
        if (this._seekTime > 0.1) {
            this.currentTime = this._seekTime;
        }
        this._updateTexture();
        this.node.emit('ready', this);
        EventHandler.emitEvents(this.videoPlayerEvent, this, EventType.READY);
        this._targetState == VideoState.PLAYING && this.play();
    }

    private _onCompleted() {
        if (this.loop) {
            if (this._currentState == VideoState.PLAYING) {
                this.currentTime = 0;
                this._video.play();
            }
        } else {
            this._currentState = VideoState.COMPLETED;
            this._targetState = VideoState.COMPLETED;
            this.node.emit('completed', this);
            EventHandler.emitEvents(this.videoPlayerEvent, this, EventType.COMPLETED);
        }
    }

    private _onError() {
        this._currentState = VideoState.ERROR;
        this._targetState = VideoState.ERROR;
        this.node.emit('error', this);
        EventHandler.emitEvents(this.videoPlayerEvent, this, EventType.ERROR);
    }

    private _onBufferStart() {
        this._isBuffering = true;
        this.node.emit('buffer_start', this);
        EventHandler.emitEvents(this.videoPlayerEvent, this, EventType.BUFFER_START);
    }

    private _onBufferUpdate() {
        this.node.emit('buffer_update', this);
        EventHandler.emitEvents(this.videoPlayerEvent, this, EventType.BUFFER_UPDATE);
    }

    private _onBufferEnd() {
        this._isBuffering = false;
        this.node.emit('buffer_end', this);
        EventHandler.emitEvents(this.videoPlayerEvent, this, EventType.BUFFER_END);
    }

    private _onFrameUpdate() {
        if (this._isInPlaybackState() && JSB) {
            // return
            let datas: any = this._video.getDatas();
            if (!datas.length) return;

            if (datas.length > 0) this._texture0.uploadData(datas[0]);
            if (datas.length > 1) this._texture1.uploadData(datas[1]);
            if (datas.length > 2) this._texture2.uploadData(datas[2]);
            // let textures: any = this._video.getTextures();
            // if (textures.length > 0) this._copyTextureToTexture2D(this._texture0, textures[0]);
            // if (textures.length > 1) this._copyTextureToTexture2D(this._texture1, textures[1]);
            // if (textures.length > 2) this._copyTextureToTexture2D(this._texture2, textures[2]);
            // let material = this.render.getMaterial(0);
            // if (textures.length > 0) material.setProperty('texture0', textures[0]);
            // if (textures.length > 1) material.setProperty('texture1', textures[1]);
            // if (textures.length > 2) material.setProperty('texture2', textures[2]);
            // material.passes[0].update();
            this._updateMaterial();
        } 
    }
    

    private _updatePixelFormat(): void {
        let index: number = this.render instanceof Sprite ? 1 : 0; 
        let pixelFormat = JSB ? this._video.pixelFormat() : PixelFormat.RGB;
        if (this._pixelFormat == pixelFormat) return;
        this._pixelFormat = pixelFormat;
        switch (pixelFormat) {
            case PixelFormat.RGB:
                this.render.setMaterial(this.rgb[index], 0);
                break;
            case PixelFormat.RGBA:
                this.render.setMaterial(this.rgba[index], 0);
                break;
            case PixelFormat.I420:
                this.render.setMaterial(this.i420[index], 0);
                break;
            case PixelFormat.NV12:
                this.render.setMaterial(this.nv12[index], 0);
                break;
            case PixelFormat.NV21:
                this.render.setMaterial(this.nv21[index], 0);
                break;
        }
    }

    /**
     * 播放视频
     */
     public play() {
        if (this._isInPlaybackState()) {
            if (this._currentState == VideoState.COMPLETED) {
                this.currentTime = 0;
            }
            if (this._currentState != VideoState.PLAYING) {
                if (this._volume !== -1) {
                    this.setVolume(this._volume);
                    this._volume = -1;
                } 
                this._video.play();
                this.node.emit('playing', this);
                this._currentState = VideoState.PLAYING;
                this._targetState = VideoState.PLAYING;
                EventHandler.emitEvents(this.videoPlayerEvent, this, EventType.PLAYING);
            }
        } else {
            this._targetState = VideoState.PLAYING;
        }
    }

    /**
     * 恢复视频
     */
    public resume() {
        if (this._isInPlaybackState() && this._currentState != VideoState.PLAYING) {
            if (JSB) {
                this._video.resume();
            } else {
                this._video.play();
            }
            this.node.emit('playing', this);
            this._currentState = VideoState.PLAYING;
            this._targetState = VideoState.PLAYING;
            EventHandler.emitEvents(this.videoPlayerEvent, this, EventType.PLAYING);
        } else {
            this._targetState = VideoState.PLAYING;
        }
    }

    /**
     * 暂停视频
     */
    public pause() {
        if (this._isInPlaybackState() && this._currentState != VideoState.PAUSED) {
            this._video.pause();
            this.node.emit('paused', this);
            this._currentState = VideoState.PAUSED;
            this._targetState = VideoState.PAUSED;
            EventHandler.emitEvents(this.videoPlayerEvent, this, EventType.PAUSED);
        } else {
            this._targetState = VideoState.PAUSED;
        }
    }

    /**
     * 停止视频
     */
    public stop() {
        this._seekTime = 0;
        if (this._isInPlaybackState() && this._currentState != VideoState.STOP) {
            // if (JSB) {
            //     // this._video.stop();
            // } else {
            //     this._video.pause();
            //     this._video.currentTime = 0;
            // }
            this._video.pause();
            this._video.currentTime = 0;

            this.node.emit('stopped', this);
            this._currentState = VideoState.STOP;
            this._targetState = VideoState.STOP;
            EventHandler.emitEvents(this.videoPlayerEvent, this, EventType.STOPPED);
        } else {
            this._targetState = VideoState.STOP;
        }
    }

    /**
     * 设置音量
     * @param volume 音量 0-1
     * @returns 
     */
    public setVolume(volume) {
        if (!this._isInPlaybackState()) {
            this._volume = volume;
            return;
        }
        if(JSB) {
            this._video.setVolume(volume);
        } else {
            this._video.volume = volume;
        }
    }

    public clear() {

    }

    /**
     * 播放状态
     * @returns 播放状态
     */
    public isPlaying() {
        return this._currentState == VideoState.PLAYING || this._targetState == VideoState.PLAYING;
    }

    private _isInPlaybackState() {
        return !!this._video && this._currentState != VideoState.IDLE && this._currentState != VideoState.PREPARING && this._currentState != VideoState.ERROR;
    }
}

