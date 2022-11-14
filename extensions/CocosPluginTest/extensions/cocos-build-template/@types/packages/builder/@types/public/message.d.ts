import { IBundleConfig, ISettings, IOutputSettings } from './build-result';
import { IBuildTaskItemJSON } from './options';
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
            settings: IOutputSettings;
            script2library: Record<string, string>;
            bundleConfigs: IBundleConfig[];
        }>,
    },
    'query-tasks-info': {
        params: [],
        result: {
            queue: Record<string, IBuildTaskItemJSON>,
            free: Promise<boolean>,
        },
    },
    'query-task': {
        params: string[],
        result: Promise<IBuildTaskItemJSON>,
    },
    /**
     * 预览合图
     * @param {object} pacUuid
     */
    'preview-pac': {
        params: string[],
        result: Promise<IBuildTaskItemJSON>,
    },

}
