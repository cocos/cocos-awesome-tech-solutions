export * from './module';
export interface EngineInfo {
    typescript: {
        type: 'builtin' | 'custom'; // 当前使用的引擎类型（内置或自定义）
        custom: string; // 自定义引擎地址
        builtin: string, // 内置引擎地址
        path: string; // 当前使用的引擎路径，为空也表示编译失败
    },
    native: {
        type: 'builtin' | 'custom'; // 当前使用的引擎类型（内置或自定义）
        custom: string; // 自定义引擎地址
        builtin: string; // 内置引擎地址
        path: string; // 当前使用的引擎路径，为空也表示编译失败
    },
}
