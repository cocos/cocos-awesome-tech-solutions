import { Vec3, math } from 'cc';
import { TimeEx } from './TimeEx';

export function SmoothDampV3(current: Vec3, target: Vec3, currentVelocity: Vec3, smoothTime: number, maxSpeed: number = Infinity, deltaTime: number = TimeEx.deltaTime) {
    let output_x = 0;
    let output_y = 0;
    let output_z = 0;

    // Based on Game Programming Gems 4 Chapter 1.10
    deltaTime = Math.max(0.0001, deltaTime);
    smoothTime = Math.max(0.0001, smoothTime);
    let omega = 2 / smoothTime;

    let x = omega * deltaTime;
    let exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

    let change_x = current.x - target.x;
    let change_y = current.y - target.y;
    let change_z = current.z - target.z;
    let originalTo: Vec3 = target.clone();

    // Clamp maximum speed
    let maxChange = maxSpeed * smoothTime;

    let maxChangeSq = maxChange * maxChange;
    let sqrmag = change_x * change_x + change_y * change_y + change_z * change_z;
    if (sqrmag > maxChangeSq) {
        var mag = Math.sqrt(sqrmag);
        change_x = change_x / mag * maxChange;
        change_y = change_y / mag * maxChange;
        change_z = change_z / mag * maxChange;
    }

    target.x = current.x - change_x;
    target.y = current.y - change_y;
    target.z = current.z - change_z;

    let temp_x = (currentVelocity.x + omega * change_x) * deltaTime;
    let temp_y = (currentVelocity.y + omega * change_y) * deltaTime;
    let temp_z = (currentVelocity.z + omega * change_z) * deltaTime;

    currentVelocity.x = (currentVelocity.x - omega * temp_x) * exp;
    currentVelocity.y = (currentVelocity.y - omega * temp_y) * exp;
    currentVelocity.z = (currentVelocity.z - omega * temp_z) * exp;

    output_x = target.x + (change_x + temp_x) * exp;
    output_y = target.y + (change_y + temp_y) * exp;
    output_z = target.z + (change_z + temp_z) * exp;

    // Prevent overshooting
    let origMinusCurrent_x = originalTo.x - current.x;
    let origMinusCurrent_y = originalTo.y - current.y;
    let origMinusCurrent_z = originalTo.z - current.z;
    let outMinusOrig_x = output_x - originalTo.x;
    let outMinusOrig_y = output_y - originalTo.y;
    let outMinusOrig_z = output_z - originalTo.z;

    if (origMinusCurrent_x * outMinusOrig_x + origMinusCurrent_y * outMinusOrig_y + origMinusCurrent_z * outMinusOrig_z > 0) {
        output_x = originalTo.x;
        output_y = originalTo.y;
        output_z = originalTo.z;

        currentVelocity.x = (output_x - originalTo.x) / deltaTime;
        currentVelocity.y = (output_y - originalTo.y) / deltaTime;
        currentVelocity.z = (output_z - originalTo.z) / deltaTime;
    }

    return new Vec3(output_x, output_y, output_z);
}

export function Clamp(val: number, min: number, max: number) {
    if (val <= min) val = min;
    if (val >= max) val = max;

    return val;
}

export function SmoothDamp(current: number, target: number, currentVelocity: number[], smoothTime: number, maxSpeed: number = Infinity, deltaTime: number = TimeEx.deltaTime) {
    deltaTime = Math.max(0.0001, deltaTime);
    // Based on Game Programming Gems 4 Chapter 1.10
    smoothTime = Math.max(0.0001, smoothTime);
    let omega = 2 / smoothTime;

    let x = omega * deltaTime;
    let exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);
    let change = current - target;
    let originalTo = target;

    // Clamp maximum speed
    let maxChange = maxSpeed * smoothTime;
    change = math.clamp(change, -maxChange, maxChange);
    target = current - change;

    let temp = (currentVelocity[0] + omega * change) * deltaTime;
    currentVelocity[0] = (currentVelocity[0] - omega * temp) * exp;
    let result = target + (change + temp) * exp;

    // Prevent overshooting
    if (originalTo - current > 0.0 == result > originalTo) {
        result = originalTo;
        currentVelocity[0] = (result - originalTo) / deltaTime;
    }

    return result;
}
