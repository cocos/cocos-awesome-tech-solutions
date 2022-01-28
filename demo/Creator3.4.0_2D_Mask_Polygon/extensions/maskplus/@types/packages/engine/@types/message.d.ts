export interface message extends EditorMessageMap {
    'query-info': {
        params: [] | [
            string,
        ],
        result: {
            type: string;
            version: string;
            path: string;
            nativeVersion: string; // 原生引擎类型 'custom' 'builtin'
            nativePath: string;
            editor: string;
            renderPipeline: string;
        },
    },
}
