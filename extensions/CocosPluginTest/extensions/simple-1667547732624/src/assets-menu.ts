import { AssetInfo } from "../@types/packages/asset-db/@types/public";

export function onCreateMenu(assetInfo: AssetInfo) {
    return [
        {
            label: 'clickCreateMenuTest',
            click() {
                console.warn('create menu clicked');
            }
        },
    ];
};

export function onAssetMenu(assetInfo: AssetInfo) {
    if (!assetInfo) {
        console.warn('assetInfo is null');
    } else {
        console.warn('get assetInfo:');
        console.warn(assetInfo);
    }
};

export function onDBMenu(assetInfo: AssetInfo) {
    return [
        {
            label: 'clickDBMenuTest',
            click() {
                console.warn('db menu clicked');
            }
        },
    ];
};

export function onPanelMenu(assetInfo: AssetInfo) {
    return [
        {
            label: 'clickPanelMenuTest',
            click() {
                console.warn('panel menu clicked');
            }
        },
    ];
};
