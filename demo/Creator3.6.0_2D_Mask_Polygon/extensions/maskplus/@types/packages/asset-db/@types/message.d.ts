import { AssetInfo, QueryAssetsOption, AssetOperationOption, AssetDBOptions, IAssetMeta } from './public';

export interface message extends EditorMessageMap {
    'query-ready': {
        params: [],
        result: boolean,
    },
    'create-asset': {
        params: [
            string,
            string | Buffer | null,
        ] | [
            string,
            string | Buffer | null,
            AssetOperationOption,
        ],
        result: AssetInfo | null,
    },
    'import-asset': {
        params: [
            string,
            string,
        ] | [
            string,
            string,
            AssetOperationOption,
        ],
        result: AssetInfo | null,
    },
    'copy-asset': {
        params: [
            string,
            string,
        ] | [
            string,
            string,
            AssetOperationOption,
        ],
        result: AssetInfo | null,
    },
    'move-asset': {
        params: [
            string,
            string,
        ] | [
            string,
            string,
            AssetOperationOption,
        ],
        result: AssetInfo | null,
    },
    'delete-asset': {
        params: [
            string,
        ],
        result: AssetInfo | null,
    },
    'open-asset': {
        params: [
            string,
        ],
        result: void,
    },
    'save-asset': {
        params: [
            string,
            string | Buffer,
        ],
        result: AssetInfo | null,
    },
    'save-asset-meta': {
        params: [
            string,
            string,
        ],
        result: AssetInfo | null,
    },
    'reimport-asset': {
        params: [
            string,
        ],
        result: boolean,
    },
    'refresh-asset': {
        params: [
            string
        ],
        result: boolean,
    },
    'query-asset-info': {
        params: [
            string,
        ],
        result: AssetInfo | null,
    },
    'query-asset-meta': {
        params: [
            string,
        ],
        result: IAssetMeta | null,
    },
    'query-path': {
        params: [
            string,
        ],
        result: string | null,
    },
    'query-url': {
        params: [
            string
        ],
        result: string | null,
    },
    'query-uuid': {
        params: [
            string
        ],
        result: string | null,
    },
    'query-assets': {
        params: [] | [
            QueryAssetsOption,
        ],
        result: AssetInfo[],
    },
    'generate-available-url': {
        params: [
            string,
        ],
        result: string,
    },

    // private

    'query-asset-mtime': {
        params: [
            string
        ],
        result: string | null,
    },
    'refresh': {
        params: [],
        result: void,
    },
    'open-devtools': {
        params: [],
        result: void,
    },
    'query-db-info': {
        params: [
            string,
        ],
        result: AssetDBOptions,
    },
    'create-asset-dialog': {
        params: [
            string,
        ] | [
            string,
            string,
        ],
        result: string | null,
    },
    'init-asset': {
        params: [
            string,
            string,
        ],
        result: AssetInfo | null,
    },
    'query-all-importer': {
        params: [],
        result: string[],
    },
    'query-all-asset-types': {
        params: [],
        result: string[],
    },
}
