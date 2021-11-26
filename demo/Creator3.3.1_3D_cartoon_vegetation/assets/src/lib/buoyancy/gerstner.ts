import { Vec2, Vec3, Vec4 } from 'cc';

const { sin, cos, PI } = Math;

let tempVec2_1 = new Vec2;
let tempVec2_2 = new Vec2;


let tempOffset = new Vec3;
let tempNormal = new Vec3;
let tempTangent = new Vec3;
let tempBinormal = new Vec3;

export function gerstner (position: Vec3, steepness: number, wavelength: number, speed: number, direction: number, time: number, offset: Vec3, tangent: Vec3, binormal: Vec3) {
    direction = direction * 2. - 1.;
    tempVec2_1.set(cos(PI * direction), sin(PI * direction));

    let d = tempVec2_1.normalize();
    let s = steepness;
    let k = 2. * PI / wavelength;
    let f = k * (d.dot(tempVec2_2.set(position.x, position.z)) - speed * time);
    let a = s / k;

    let cf = cos(f);
    let sf = sin(f);

    tangent.add3f(
        -d.x * d.x * s * sf,
        d.x * s * cf,
        -d.x * d.y * s * sf
    );

    binormal.add3f(
        -d.x * d.y * s * sf,
        d.y * s * cf,
        -d.y * d.y * s * sf
    );

    offset.add3f(
        d.x * a * cf,
        a * sf,
        d.y * a * cf
    );
}


export function gerstnerWaves (p: Vec3, visuals: Vec4, directions: Vec4, time: number, offset: Vec3, normal?: Vec3, tangent?: Vec3, binormal?: Vec3) {
    let steepness = visuals.x;
    let wavelength = visuals.y;
    let speed = visuals.z;

    offset = offset || tempOffset;
    normal = normal || tempNormal;
    tangent = tangent || tempTangent;
    binormal = binormal || tempBinormal;

    offset.set(0, 0, 0);
    tangent.set(1, 0, 0);
    binormal.set(0, 0, 1);

    gerstner(p, steepness, wavelength, speed, directions.x, time, offset, tangent, binormal);
    gerstner(p, steepness, wavelength, speed, directions.y, time, offset, tangent, binormal);
    gerstner(p, steepness, wavelength, speed, directions.z, time, offset, tangent, binormal);
    gerstner(p, steepness, wavelength, speed, directions.w, time, offset, tangent, binormal);

    Vec3.cross(normal, binormal, tangent)
    normal.normalize();

    return offset;
}
