
import { _decorator, Node, Renderable2D, Vec3, IAssembler, Mat4, gfx, PhysicsSystem2D, PHYSICS_2D_PTM_RATIO, UITransform, SpriteFrame, view, profiler, Collider2D, ECollider2DType, debug, BoxCollider2D, EPhysics2DDrawFlags, RigidBody2D, Vec2, RenderTexture, Camera, Sprite, sys } from 'cc';
import { EDITOR } from 'cc/env';

const { ccclass, property, executeInEditMode } = _decorator;

// @ts-ignore
const b2: any = b2 || null!

/*
  pos = a_position.xy;
  radius = a_position.z;
  center = a_texCoord;
 */
export const vfmtPosCoord = [
    new gfx.Attribute(gfx.AttributeName.ATTR_POSITION, gfx.Format.RGB32F),
    new gfx.Attribute(gfx.AttributeName.ATTR_TEX_COORD, gfx.Format.RG32F)
];

const vec3_temps: Vec3[] = [];
for (let i = 0; i < 4; i++) {
    vec3_temps.push(new Vec3());
}

class WaterAssembler implements IAssembler {
    createData(com: WaterRender) {
        return com.requestRenderData();
    }

    updateRenderData(com: WaterRender) {
    }

    fillBuffers(com: WaterRender, renderer: any) {
        let particles = com._particles;
        let particleCount = particles?.GetParticleCount();
        if (!particleCount) {
            return;
        }

        let verticesCount = particleCount * 4;
        let indicesCount = particleCount * 6;
        let posBuff = particles.GetPositionBuffer();
        let r = particles.GetRadius() * PHYSICS_2D_PTM_RATIO * 3;

        let buffer = renderer.acquireBufferBatch(vfmtPosCoord)!;
        let vertexOffset = buffer.byteOffset >> 2;
        let indicesOffset = buffer.indicesOffset;
        let vertexId = buffer.vertexOffset;

        const bufferUnchanged = buffer.request(verticesCount, indicesCount);
        if (!bufferUnchanged) {
            buffer = renderer.currBufferBatch!;
            vertexOffset = 0;
            indicesOffset = 0;
            vertexId = 0;
        }

        // fill vertices
        const vbuf = buffer.vData!;
        for (let i = 0; i < particleCount; ++i) {
            let x = posBuff[i].x * PHYSICS_2D_PTM_RATIO;
            let y = posBuff[i].y * PHYSICS_2D_PTM_RATIO;

            // left-bottom
            vbuf[vertexOffset++] = x - r;
            vbuf[vertexOffset++] = y - r;
            vbuf[vertexOffset++] = 0;
            vbuf[vertexOffset++] = x;
            vbuf[vertexOffset++] = y;

            // right-bottom
            vbuf[vertexOffset++] = x + r;
            vbuf[vertexOffset++] = y - r;
            vbuf[vertexOffset++] = 0;
            vbuf[vertexOffset++] = x;
            vbuf[vertexOffset++] = y;

            // left-top
            vbuf[vertexOffset++] = x - r;
            vbuf[vertexOffset++] = y + r;
            vbuf[vertexOffset++] = 0;
            vbuf[vertexOffset++] = x;
            vbuf[vertexOffset++] = y;

            // right-top
            vbuf[vertexOffset++] = x + r;
            vbuf[vertexOffset++] = y + r;
            vbuf[vertexOffset++] = 0;
            vbuf[vertexOffset++] = x;
            vbuf[vertexOffset++] = y;
        }

        // fill indices
        const ibuf = buffer.iData!;
        for (let i = 0; i < particleCount; ++i) {
            ibuf[indicesOffset++] = vertexId;
            ibuf[indicesOffset++] = vertexId + 1;
            ibuf[indicesOffset++] = vertexId + 2;
            ibuf[indicesOffset++] = vertexId + 1;
            ibuf[indicesOffset++] = vertexId + 3;
            ibuf[indicesOffset++] = vertexId + 2;
            vertexId += 4;
        }
    }
};

@ccclass('WaterRender')
export class WaterRender extends Renderable2D {
    protected _assembler: IAssembler = null;

    protected _world: any = null!;
    protected _particleGroup = null;
    public _particles: any = null!;

    @property(SpriteFrame)
    fixError: SpriteFrame = null!;

    @property(BoxCollider2D)
    particleBox: BoxCollider2D = null;

    @property(Camera)
    cam: Camera = null;

    @property(Sprite)
    present: Sprite = null;

    constructor() {
        super();
    }

    onLoad() {
        // 开启物理调试
        // PhysicsSystem2D.instance.debugDrawFlags = EPhysics2DDrawFlags.Aabb |
        //     EPhysics2DDrawFlags.Pair |
        //     EPhysics2DDrawFlags.CenterOfMass |
        //     EPhysics2DDrawFlags.Joint |
        //     EPhysics2DDrawFlags.Shape;

        PhysicsSystem2D.instance.enable = true;

        if (this.cam) {
            let trans = this.present.getComponent(UITransform);

            let renderTex = new RenderTexture();
            renderTex.initialize({
                width: trans.width,
                height: trans.height
            })

            this.cam.targetTexture = renderTex;

            let sp = new SpriteFrame();
            sp.texture = renderTex;

            // 当前版本 动态创建的RT(renderTexture) 在ios、macOS平台会上下翻转
            // HACK
            if (sys.platform == sys.Platform.IOS || sys.platform == sys.Platform.MACOS) {
                sp.flipUVY = true;
            }

            this.present.spriteFrame = sp;

            // @ts-ignore
            this.present.updateMaterial();
        }
    }

    start() {
        profiler.hideStats();

        // [3]
        this._world = PhysicsSystem2D.instance;

        var psd_def = {
            strictContactCheck: false,
            density: 1.0,
            gravityScale: 1.0,
            radius: 0.35,
            maxCount: 0,
            pressureStrength: 0.005,
            dampingStrength: 1.0,
            elasticStrength: 0.25,
            springStrength: 0.25,
            viscousStrength: 0.0,
            surfaceTensionPressureStrength: 0.2,
            surfaceTensionNormalStrength: 0.2,
            repulsiveStrength: 1.0,
            powderStrength: 0.5,
            ejectionStrength: 0.5,
            staticPressureStrength: 0.2,
            staticPressureRelaxation: 0.2,
            staticPressureIterations: 8,
            colorMixingStrength: 0.5,
            destroyByAge: true,
            lifetimeGranularity: 1.0 / 60.0
        };
        psd_def.radius = 0.35;
        psd_def.viscousStrength = 0;

        // @ts-ignore
        var psd = {
            ...psd_def,
            Clone: function () {
                return psd_def;
            }
        };
        this._particles = this._world.physicsWorld.impl.CreateParticleSystem(psd);

        if (!EDITOR) {
            this.scheduleOnce(() => {
                this.GenerateWater();
            })
        }
    }

    CreateParticlesGroup() {
        // @ts-ignore
        var particleGroupDef = {
            flags: 0,
            groupFlags: 0,
            angle: 0.0,
            linearVelocity: { x: 0, y: 0 },
            angularVelocity: 0.0,
            color: { r: 0, g: 0, b: 0, a: 0 },
            strength: 1.0,
            shapeCount: 0,
            stride: 0,
            particleCount: 0,
            lifetime: 0,
            userData: null,
            group: null,
            shape: null,
            position: {
                x: this.particleBox.node.getWorldPosition().x / PHYSICS_2D_PTM_RATIO,
                y: this.particleBox.node.getWorldPosition().y / PHYSICS_2D_PTM_RATIO
            },
            // @ts-ignore
            shape: this.particleBox._shape._createShapes(1.0, 1.0)[0]
        };

        this._particleGroup = this._particles.CreateParticleGroup(particleGroupDef);
        this.SetParticles(this._particles);

        let vertsCount = this._particles.GetParticleCount();
        console.log(vertsCount);
    }

    GenerateWater() {
        if (this._particleGroup != null) {
            this._particleGroup.DestroyParticles(false);
            this._particles.DestroyParticleGroup(this._particleGroup);
            this._particleGroup = null;
        }

        this.scheduleOnce(() => {
            this.CreateParticlesGroup();
        });
    }

    public SetParticles(particles) {
        //@ts-ignore
        this._particles = particles;

        let trans = this.node.getComponent(UITransform);
        // particles.GetRadius() * PTM_RATIO 是相对于场景(世界空间)的大小
        // particles.GetRadius() * PTM_RATIO / this.node.width 是相对于纹理的大小(纹理和屏幕同宽)，范围[0, 1]
        this.customMaterial.setProperty("radius", particles.GetRadius() * PHYSICS_2D_PTM_RATIO / trans.width);
        this.customMaterial.setProperty("yratio", trans.height / trans.width);
        this.customMaterial.setProperty("reverseRes", new Vec2(1.0 / trans.width, 1.0 / trans.height));

        this.markForUpdateRenderData();
    }

    protected _render(render: any) {
        render.commitComp(this, this.fixError, this._assembler!, null);
    }

    protected _canRender() {
        return true;
    }

    protected _flushAssembler(): void {
        if (this._assembler == null) {
            this.destroyRenderData();
            this._assembler = new WaterAssembler();
        }
    }
}
