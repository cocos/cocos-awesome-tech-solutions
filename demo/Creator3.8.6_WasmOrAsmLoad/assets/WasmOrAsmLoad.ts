import { _decorator, Asset, assetManager, BufferAsset, Component, Game, game, Node, sys } from 'cc';
import { EDITOR } from 'cc/env';

const { ccclass, property, executeInEditMode } = _decorator;

if (sys.hasFeature(sys.Feature.WASM) || sys.os !== sys.OS.IOS) {
    if (sys.isNative) {
        //@ts-ignore
        assetManager.downloader.register('.wasm', assetManager.downloader._downloaders[".bin"]);
        //@ts-ignore
        assetManager.parser.register('.wasm', assetManager.parser._parsers[".bin"]);
    }
    else if (sys.isBrowser || sys.platform === sys.Platform.WECHAT_GAME) {
        //@ts-ignore
        assetManager.downloader.register('.wasm', assetManager.downloader._downloadArrayBuffer);
        //@ts-ignore
        assetManager.downloader.register('.mem', assetManager.downloader._downloadArrayBuffer);
    }
} else {
    if (sys.isNative) {
        //@ts-ignore
        assetManager.downloader.register('.mem', assetManager.downloader._downloaders[".bin"]);
        //@ts-ignore
        assetManager.parser.register('.mem', assetManager.parser._parsers[".bin"]);
    }
}

const PAGESIZE = 65536; // 64KiB

// How many pages of the wasm memory
// TODO: let this can be canfiguable by user.
const PAGECOUNT = 32 * 16;

// How mush memory size of the wasm memory
const MEMORYSIZE = PAGESIZE * PAGECOUNT; // 32 MiB

let Effekseer: any = null;

@ccclass('WasmOrAsmLoad')
@executeInEditMode
export class WasmOrAsmLoad extends Component {

    onLoad () {
        this.wasmOrAsmLoadTest();
    }

    wasmOrAsmLoadTest () {
        if (sys.hasFeature(sys.Feature.WASM) || sys.os !== sys.OS.IOS) {
            import('./effekseer.js').then(({ default: wasmFactory })=> {
                this.loadWasmOrAsm("wasmFiles", "effekseer", "44cacb3c-e901-455d-b3e1-1c38a69718e1").then((wasmFile)=>{
                    this.initWasm(wasmFactory, wasmFile).then((instance: any)=> {
                        Effekseer = instance;
                        Effekseer._myFunction();
                        console.log("effekseer wasm module inited", Effekseer);
                    }, (err) => {
                        console.error("effekseer wasm module init failed", err);
                    });
                    
                }, (err)=> {
                    console.error("wasm load failed", err);
                })
            });
        } else {
            import('./effekseer.asm.js').then(({ default: asmFactory })=> {

                this.loadWasmOrAsm("wasmFiles", "effekseer.asm", "3400003e-dc3c-43c1-8757-3e082429125a").then((asmFile)=> {
                    this.initAsm(asmFactory, asmFile).then((instance: any)=>{
                        Effekseer = instance;
                        Effekseer._myFunction();
                        console.log("effekseer asm module inited", Effekseer);
                    }, (err) => {
                        console.error("effekseer asm module init failed", err);
                    });

                }, (err)=> {
                    console.error("asm load failed", err);
                });
            });
        }
    }

    loadWasmOrAsm (bundleName, fileName, editorWasmOrAsmUuid): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            if (EDITOR) {
                //编辑器内通过 uuid 加载资源比较便捷，无法通过 bundle 加载
                if (editorWasmOrAsmUuid) {
                    assetManager.loadAny(editorWasmOrAsmUuid, (err, file: Asset)=> {
                        if (!err) {
                            //@ts-ignore
                            resolve(file);
                        } else {
                            reject(err);
                        }
                    })
                }
            } else {
                if (bundleName && fileName) {
                    assetManager.loadBundle(bundleName, (err, bundle)=>{
                        if (!err) {
                            bundle.load(fileName, Asset, (err2: any, file: Asset) => {
                                if (!err2) {
                                    //@ts-ignore
                                    resolve(file);
                                } else {
                                    reject(err2);
                                }
                            })
                        } else {
                            reject(err);
                        }
                    })
                }
            }
        })
    }

    initWasm (wasmFactory, file): Promise<void> {
        var self = this;
        return new Promise<void>((resolve, reject) => {
            wasmFactory({
                instantiateWasm (importObject, receiveInstance) {
                    self.instantiateWasm(file, importObject).then((result) => {
                        receiveInstance(result.instance, result.module);
                    }).catch((err) => reject(err));
                }
            }).then((instance: any)=>{
                resolve(instance);
            }).catch((err) => reject(err));
        });
    }

    initAsm (asmFactory, file): Promise<any> {
        const asmMemory: any = {};
        asmMemory.buffer = new ArrayBuffer(MEMORYSIZE);
        const module = {
            asmMemory,
            memoryInitializerRequest: {
                //@ts-ignore
                response: file._file,
                status: 200,
            } as Partial<XMLHttpRequest>,
        };
        return asmFactory(module);
    }

    instantiateWasm (wasmFile: Asset, importObject: WebAssembly.Imports): Promise<any> {
        if (sys.isBrowser || sys.isNative) {
            //@ts-ignore
            return WebAssembly.instantiate(wasmFile._file, importObject);
        } else if (sys.platform === sys.Platform.WECHAT_GAME){
            //@ts-ignore
            return CCWebAssembly.instantiate(wasmFile.nativeUrl, importObject)
        }
    }
}