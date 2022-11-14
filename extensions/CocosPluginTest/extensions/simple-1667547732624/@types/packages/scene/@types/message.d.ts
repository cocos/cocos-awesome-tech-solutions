import {
    SetPropertyOptions,
} from './public';

export interface message extends EditorMessageMap {
    'update-create-node-template': {
        params: [],
        result: any,
    },
    'open': {
        params: [],
        result: any,
    },
    'open-devtools': {
        params: [],
        result: any,
    },
    'graphical-tools': {
        params: [
            boolean
        ],
        result: void,
    },
    'open-scene': {
        params: [
            string
        ],
        result: boolean,
    },
    'save-scene': {
        params: [] | [
            boolean
        ],
        result: boolean,
    },
    'save-as-scene': {
        params: [
            boolean
        ],
        result: boolean,
    },
    'close-scene': {
        params: [],
        result: boolean,
    },
    'set-property': {
        params: [
            SetPropertyOptions
        ],
        result: boolean,
    },
    'query-node-tree': {
        params: [] | [
            string
        ],
        result: any,
    },
    'execute-scene-script': {
        params: [] | [
            {
                name: string;
                method: string;
                args: any[];
            }
        ],
        result: any,
    },
}
