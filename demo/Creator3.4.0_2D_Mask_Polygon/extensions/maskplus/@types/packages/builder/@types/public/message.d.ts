import { IBundleConfig, ISettings } from "./build-result";
import { ITaskItemJSON } from "./options";
export interface message extends EditorMessageMap {
    'open-devtools': {
        params: [],
        result: void,
    },
    open: {
        params: [],
        result: void,
    },
    'generate-preview-setting': {
        params: any[],
        result: Promise<{
            settings: ISettings;
            script2library: Record<string, string>;
            bundleConfigs: IBundleConfig[];
        }>,
    },
    'query-tasks-info': {
        params: [],
        result: {
            queue: Record<string, ITaskItemJSON>,
            free: Promise<boolean>,
        },
    },
    'query-task': {
        params: string[],
        result: Promise<ITaskItemJSON>,
    },
    /**
     * 预览合图
     * @param {object} pacUuid
     */
    'preview-pac': {
        params: string[],
        result: Promise<ITaskItemJSON>,
    },

}
