import * as AssetDB from './packages/asset-db/@types/message';
import * as Scene from './packages/scene/@types/message';
import * as Engine from './packages/engine/@types/message';
import * as Builder from './packages/builder/@types/public/message';
import * as Programming from './packages/programming/@types/message';
// import * as Extension from './packages/extension/@types/message';

declare global {
    interface EditorMessageContent {
        params: any[],
        result: any;
    }

    interface EditorMessageMap {
        [x: string]: EditorMessageContent;
    }

    interface EditorMessageMaps {
        [x: string]: EditorMessageMap;
        'asset-db': AssetDB.message;
        'scene': Scene.message;
        'engine': Engine.message;
        'builder': Builder.message;
        'programming': Programming.message,
        // 'extension': Extension.message;
    }
}
