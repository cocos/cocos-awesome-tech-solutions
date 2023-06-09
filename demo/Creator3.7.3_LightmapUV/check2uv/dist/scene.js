const { join } = require('path');
// 加载 ‘cc’ 需要设置搜索路径
module.paths.push(join(Editor.App.path, 'node_modules'));

// 模块加载的时候触发的函数
exports.load = async function() {
    let assets = await Editor.Message.request('asset-db', 'query-assets');
    for (let i = 0; i < assets.length; i++)
    {
        if (assets[i].importer === "fbx")
        {
            // console.log('fbx:', assets[i].name);

            let subAssets = assets[i].subAssets;
            for (let subAssetIndex in subAssets)
            {
                if (subAssets[subAssetIndex].type === "cc.Mesh")
                {
                    meshHas2UV(assets[i].url, subAssets[subAssetIndex]);
                }
            }
        }
    }
};

function meshHas2UV(fbxName, meshAsset)
{
    cc.assetManager.loadAny(meshAsset.uuid, (error, asset) => {
        let subMesh = asset.renderingSubMeshes[0];
        let result = has2UV(subMesh.attributes);
        if (result === false)
        {
            console.log(`缺少2uv: ${fbxName} -> ${meshAsset.name}`);
        }
    })
}

function has2UV(attrs) {
    for (let i = 0; i < attrs.length; ++i) {
        if (attrs[i].name === "a_texCoord1") return true;
    }
    return false;
}


// 模块卸载的时候触发的函数
exports.unload = function() {};

// 模块内定义的方法
exports.methods = {
    log() {
        const { director } = require('cc');
        director.getScene();
        return {};
    },
};