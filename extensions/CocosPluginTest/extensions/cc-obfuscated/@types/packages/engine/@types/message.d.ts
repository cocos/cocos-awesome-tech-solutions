import { EngineInfo } from './index';
export interface message extends EditorMessageMap {
    'query-info': {
        params: [] | [
            string,
        ],
        result: {
            version: string;
            path: string;
            nativeVersion: string; // 原生引擎类型 'custom' 'builtin'
            nativePath: string;
            editor: string;
        },
    },
    'query-engine-info': {
        params: [] | [
            string,
        ],
        result: EngineInfo,
    },
}

