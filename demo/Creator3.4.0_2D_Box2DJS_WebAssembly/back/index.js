
let box2d = require('./build/box2d/box2d.umd');
let b2 = {};

if (window['BOX2D_WASM']) {    
    box2d = window['BOX2D_WASM']
}

for (var key in box2d) {
    if (key.indexOf('b2_') !== -1) {
        continue;
    }
    let newKey = key.replace('b2', '');
    b2[newKey] = box2d[key];
}

if (undefined == b2.pointsToVec2Array) {
    b2.pointsToVec2Array = function(array) {return [array];}
}

module.exports = b2;