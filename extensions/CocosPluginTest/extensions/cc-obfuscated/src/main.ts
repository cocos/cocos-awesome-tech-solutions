import { IBuildTaskItemJSON, IBuildTaskOption } from '../@types';

const Fs = require('fs');
const JavascriptObfuscator = require('javascript-obfuscator');
const Ast_Codeing_Do = require('../lib/ast_codeing_do');

// 获取默认配置文件路径
let configFilePath = "", getRunTimeJson = "/extensions/cc-obfuscated/config/cc_obfuscated.json";
const prsPath = Editor.Project.path.replace(/\\/g, '/');
configFilePath = prsPath + getRunTimeJson;

/**
 * 混淆
 * @param {string} filePath 文件路径
 * @param {ObfuscatorOptions} options 混淆参数
 */
var obfuscate = function (filePath: string, options: any) {
  var startTime = new Date().getTime();

  const sourceCode = Fs.readFileSync(filePath, 'utf8');
  // javascript-obfuscator ./ --output ./：采用递归的方式混淆当前目录下的所有js文件（包括子文件），对原文件进行修改，不会生成新的js文件
  const obfuscationResult = JavascriptObfuscator.obfuscate(sourceCode, options);
  const obfuscatedCode = obfuscationResult.getObfuscatedCode();
  Fs.writeFileSync(filePath, obfuscatedCode);

  var EndTime = new Date().getTime();
  var usingTime = EndTime - startTime;
  usingTime = Number((usingTime / 1000).toFixed(2));
  console.log(`✅ 混淆完成, 已写入 .js 文件\n文件路径为 ${filePath} ,用时: ${usingTime}ms`);
};

/**
 * @en 
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
  open_ob_build(event, config) {
    configFilePath = prsPath + getRunTimeJson;
    if (Fs.existsSync(configFilePath)) {
      let setSourceCode = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
      setSourceCode.auto = true;
      Fs.writeFileSync(configFilePath, JSON.stringify(setSourceCode, null, 2));
      console.log(`😏 已开启构建后自动混淆代码 ${getPreset('auto')}`);
    } else {
      console.log(`🤨 默认混淆配置的 JSON 文件已丢失, 请检查文件是否在 ${configFilePath} 中`);
    };
  },

  close_ob_build(event) {
    configFilePath = prsPath + getRunTimeJson;
    if (Fs.existsSync(configFilePath)) {
      let setSourceCode = JSON.parse(Fs.readFileSync(configFilePath, 'utf8'));
      setSourceCode.auto = false;
      Fs.writeFileSync(configFilePath, JSON.stringify(setSourceCode, null, 2));
      console.log(`🤨 已关闭构建后自动混淆代码 ${getPreset('auto')}`);
    } else {
      console.log(`🤨 默认混淆配置的 JSON 文件已丢失, 请检查文件是否在 ${configFilePath} 中`);
    };
  },
};

/**
 * 读取预设参数
 * @param {string} type 预设名
 */
let presets = null;
var getPreset = function (type: string) {
  const presetFilePath = configFilePath;
  if (Fs.existsSync(presetFilePath)) {
    presets = JSON.parse(Fs.readFileSync(presetFilePath, 'utf8'));
    return presets[type];
  };
  return null;
};

/**
 * 读取混淆参数配置的 JSON 文件
 */
function getJsonConfig() {
  let configFilePath_0 = prsPath + getRunTimeJson;
  let getConfigObjVal = null;
  if (Fs.existsSync(configFilePath_0)) {
    getConfigObjVal = JSON.parse(Fs.readFileSync(configFilePath_0, 'utf8'));
  };

  if (!getConfigObjVal) return null;
  return getConfigObjVal;
};

async function builder_changed(options: IBuildTaskOption, params: IBuildTaskItemJSON) {
  if (!params.options) return;
  let isn_open_buildOb = true;

  let getCongif = null;
  // 构建时, 读取 JSON 的参数来进行混淆
  let buildStartGetObfusJson = await getJsonConfig();
  let buildStartGetH5_obs = buildStartGetObfusJson.defaultConfig;

  if (params.options.platform == 'web-mobile') {
    getCongif = buildStartGetH5_obs;
    // 如果已经开起自动混淆就执行!! web-mobile
    isn_open_buildOb = getPreset('auto');
  } else {
    // 其它类平台
    console.log("❗️ 目前仅支持加密 web-mobile 构建的 .js 代码，\n 暂不支持 [" + params.options.platform + "] 平台");
    return false;
  };

  console.log(" 😏 正在开始混淆 [" + params.options.platform + "] 里面的代码");

  // 根据是否分包来做处理
  let readMainJS_Path_main = "assets/main", readMainJS_Path_sub_0 = "assets/start-scene", readMainJS_Path_sub_1 = "subpackages/main";

  let getBuildPath = params.options.buildPath + "";
  let getWebMobilePath_main = prsPath + "/" + getBuildPath.replace('project://', '') + "/"
   + params.options.outputName + "/" + readMainJS_Path_main;
  let getWebMobilePath_subpackages_0 = prsPath + "/" + getBuildPath.replace('project://', '')
   + "/" + params.options.outputName + "/" + readMainJS_Path_sub_0;
  let getWebMobilePath_subpackages_1 = prsPath + "/" + getBuildPath.replace('project://', '')
   + "/" + params.options.outputName + "/" + readMainJS_Path_sub_1;
  let tmp_item = "", temp_array: any[] = [];

  if (params.state == "success" || params.progress == 1) {
    // 指定要读取的目录--start---
    if (Fs.existsSync(getWebMobilePath_subpackages_0) || Fs.existsSync(getWebMobilePath_subpackages_1)) {
      try {
        let sourceCode_dir_arr: string[] = [];
        if (Fs.existsSync(getWebMobilePath_subpackages_0)) {
          sourceCode_dir_arr = Fs.readdirSync(getWebMobilePath_subpackages_0, 'utf8');
          // 循环读取文件夹下的文件,分类,摘取需要的文件
          sourceCode_dir_arr.forEach((getItem: string) => {
            // 匹配主要代码js文件
            if (getItem.indexOf(".js") > -1) {
              if (getItem.match("index")) {
                tmp_item = getItem;
                // 确认路径可以正常读取到::
                if (Fs.existsSync(getWebMobilePath_subpackages_0 + "/" + tmp_item)) {
                  // 一般来说就只有一个 JS 文件,给这个数组赋值
                  temp_array.push(getWebMobilePath_subpackages_0 + "/" + tmp_item);
                };
              };
            };
          });
        } else if (Fs.existsSync(getWebMobilePath_subpackages_1)) {
          sourceCode_dir_arr = Fs.readdirSync(getWebMobilePath_subpackages_1, 'utf8');
          // 循环读取文件夹下的文件,分类,摘取需要的文件
          sourceCode_dir_arr.forEach((getItem: string) => {
            // 匹配主要代码js文件
            if (getItem.indexOf(".js") > -1) {
              if (getItem.match("game")) {
                tmp_item = getItem;
                // 确认路径可以正常读取到::
                if (Fs.existsSync(getWebMobilePath_subpackages_1 + "/" + tmp_item)) {
                  // 一般来说就只有一个 JS 文件,给这个数组赋值
                  temp_array.push(getWebMobilePath_subpackages_1 + "/" + tmp_item);
                };
              };
            };
          });
        };
      } catch (error) { console.error("❌ 构建结束 error=>", error); };
    } else {
      try {
        let sourceCode_dir_arr = Fs.readdirSync(getWebMobilePath_main, 'utf8');
        // 循环读取文件夹下的文件,分类,摘取需要的文件
        sourceCode_dir_arr.forEach((getItem: string) => {
          // 匹配主要代码js文件
          if (getItem.indexOf(".js") > -1) {
            if (getItem.match("index")) {
              tmp_item = getItem;
              // 确认路径可以正常读取到::
              if (Fs.existsSync(getWebMobilePath_main + "/" + tmp_item)) {
                // 一般来说就只有一个 JS 文件,给这个数组赋值
                temp_array.push(getWebMobilePath_main + "/" + tmp_item);
              };
            };
          };
        });
      } catch (error) { console.error("❌ 构建结束 error=>", error); };
    };
    //开始混淆
    if (isn_open_buildOb) {
        // 开始使用 AST + MD5 秘钥来混淆函数内容
        console.log("⭐ 正在开始混淆 [" + params.options.platform + "] 里面的代码");
        // 合并混淆
        Ast_Codeing_Do.ast_mix_jsMAIN(temp_array[0], isn_open_buildOb, params, obfuscate, 
          getWebMobilePath_subpackages_0, getWebMobilePath_subpackages_1, getWebMobilePath_main, 
          temp_array, tmp_item, getCongif);
    } else {
      console.log("🤨 混淆已关闭, 请在拓展菜单开启混淆");
    };
  }
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export function load() {
  Editor.Message.addBroadcastListener("builder:task-changed", builder_changed);
}

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export function unload() {
  Editor.Message.removeBroadcastListener("builder:task-changed", builder_changed);
}
