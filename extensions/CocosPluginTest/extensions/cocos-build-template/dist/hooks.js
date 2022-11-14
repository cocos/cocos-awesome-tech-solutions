"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unload = exports.onAfterBuild = exports.onAfterCompressSettings = exports.onBeforeCompressSettings = exports.onBeforeBuild = exports.load = exports.throwError = void 0;
const PACKAGE_NAME = 'custom-build-example';
exports.throwError = true;
const load = async function () {
    console.log(PACKAGE_NAME, exports.load);
};
exports.load = load;
const onBeforeBuild = async function (options) {
    // Todo some thing
    console.log(PACKAGE_NAME, 'onBeforeBuild');
};
exports.onBeforeBuild = onBeforeBuild;
const onBeforeCompressSettings = async function (options, result) {
    // Todo some thing
    console.log(PACKAGE_NAME, 'onBeforeCompressSettings');
};
exports.onBeforeCompressSettings = onBeforeCompressSettings;
const onAfterCompressSettings = async function (options, result) {
    // Todo some thing
    console.log(PACKAGE_NAME, 'onAfterCompressSettings');
};
exports.onAfterCompressSettings = onAfterCompressSettings;
const onAfterBuild = async function (options, result) {
    console.log(PACKAGE_NAME, 'onAfterBuild');
};
exports.onAfterBuild = onAfterBuild;
const unload = async function () {
    console.log(PACKAGE_NAME, 'unload');
};
exports.unload = unload;
