export interface message extends EditorMessageMap {
    'query-shared-settings': {
        params: [],
        result: {
            useDefineForClassFields: boolean;
            allowDeclareFields: boolean;
            loose: boolean;
            guessCommonJsExports: boolean;
            exportsConditions: string[];
            importMap?: {
                json: {
                    imports?: Record<string, string>;
                    scopes?: Record<string, Record<string, string>>;
                };
                url: string;
            };
        }
    };
}
