import { _decorator, Component, Node, Camera, renderer, Color, CCObject, Vec3, gfx, Material, RenderTexture, Vec4, Layers, director, builtinResMgr, Texture2D } from 'cc';
import { EDITOR } from 'cc/env';
import { Config } from '../utils/config';
const { ccclass, property, executeInEditMode, type } = _decorator;

const neutralVector = new Color(0.5 * 255, 0, 0.5 * 255, 0);

const _colorAttachment = new gfx.ColorAttachment(gfx.Format.RGBA16F);
const _depthStencilAttachment = new gfx.DepthStencilAttachment();
const _renderPassInfo = new gfx.RenderPassInfo([_colorAttachment], _depthStencilAttachment);

@ccclass('GrassBenderRenderer')
@executeInEditMode
export class GrassBenderRenderer extends Component {

    @type(Node)
    followTarget: Node | null = null;

    @property
    _range = 32
    @property
    get range () {
        return this._range;
    }
    set range (v) {
        this._range = v;
        if (this._renderCamera) {
            this._renderCamera.orthoHeight = this.range;
        }
    }

    @property
    _resolution = 512;
    @property
    get resolution () {
        return this._resolution;
    }
    set resolution (v) {
        if (v === this._resolution) {
            return;
        }
        this._resolution = v;

        this._createRenderTexture(true);
    }

    @type(Material)
    bendMaterials: Material[] = []

    _renderCamera: Camera | null = null;
    get renderCamera () {
        return this._renderCamera;
    }

    _renderTexture: RenderTexture | null = null;
    _createRenderTexture (force = false) {
        if (force) {
            if (this._renderTexture) {
                this._renderTexture.destroy();
                this._renderTexture = null;
            }
        }
        if (this._renderTexture) {
            return;
        }
        let renderTexture = new RenderTexture();
        renderTexture.reset({ width: this.resolution, height: this.resolution, passInfo: _renderPassInfo });
        this._renderTexture = renderTexture;
    }


    _createRenderCamera () {
        if (!this._renderCamera) {
            let node = new Node('GrassBendCamera');
            node._objFlags |= CCObject.Flags.DontSave | CCObject.Flags.HideInHierarchy;
            node.parent = this.node;
            node.eulerAngles = new Vec3(-90, 0, 0);

            const bitmask = this.node.layer;

            let camera = node.addComponent(Camera);
            camera.projection = renderer.scene.CameraProjection.ORTHO;
            camera.orthoHeight = this.range;
            camera.far = this.range * 2;
            camera.clearColor = neutralVector;
            camera.clearFlags = gfx.ClearFlagBit.NONE;
            camera.visibility = bitmask;
            camera.priority = -100;
            camera.targetTexture = this._renderTexture;

            this._renderCamera = camera;
        }
    }

    _grass_bend_uv = new Vec4;
    _updateMaterials () {
        let materials = this.bendMaterials;

        let pos = this.renderCamera!.node.worldPosition;
        this._grass_bend_uv.set(
            pos.x,
            pos.z,
            this.range * 2,
            1
        )

        for (let i = 0; i < materials.length; i++) {
            materials[i].setProperty('grass_bend_map', this._renderTexture);
            materials[i].setProperty('grass_bend_uv', this._grass_bend_uv);
        }
    }

    start () {
        this.setEditorCameraVisibility();

        if (!Config.supportBendGrass) {
            this.node.active = false;
            return;
        }

        this._createRenderTexture();
        this._createRenderCamera();
    }

    onDisable () {
        let materials = this.bendMaterials;
        this._grass_bend_uv.w = 0;
        for (let i = 0; i < materials.length; i++) {
            materials[i].setProperty('grass_bend_uv', this._grass_bend_uv);
        }
    }

    setEditorCameraVisibility () {
        if (EDITOR) {
            const bitmask = this.node.layer;
            (globalThis.cce).Camera._camera.visibility &= ~bitmask;
            (globalThis.cce).Camera._camera._uiEditorCamera.visibility &= ~bitmask;
            (globalThis.cce).Camera._camera._uiEditorGizmoCamera.visibility &= ~bitmask;
        }
    }

    update (deltaTime: number) {
        if (this.followTarget && this._renderCamera) {
            let followPosition = this.followTarget.worldPosition;
            let worldPosition = this._renderCamera.node.worldPosition;
            if (followPosition.x !== worldPosition.x || followPosition.y + this.range !== worldPosition.y || followPosition.z !== worldPosition.z) {
                this._renderCamera.node.setWorldPosition(followPosition.x, followPosition.y + this.range, followPosition.z);
            }

            if (EDITOR) {
                this._renderCamera.targetTexture = this._renderTexture;
            }

            this._updateMaterials()
        }
    }
}
