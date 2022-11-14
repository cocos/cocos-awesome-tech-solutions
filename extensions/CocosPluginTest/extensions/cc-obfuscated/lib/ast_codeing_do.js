const md5 = require('md5');
var Fs = require('fs');
var parse = require('esprima').parse;
var toString = require('escodegen').generate;
var confusion = require('confusion');
var JsConfuser = require("js-confuser");

/**
 * AST 抽象语法树结构, 一小部分
 */
const Ast_Codeing_Do = {
    ast_md5_val: null,
    /**
     * 随机乱序排序算法, 可以传数组或者字符串
     */
    ast_shuffleCardArr(arr) {
        var getPostArr = arr;
        var getLen = getPostArr.length;
        if (typeof arr == 'object') {
            getPostArr = arr;
            getLen = getPostArr.length;
            for (var astInd = 0; astInd < getLen - 1; astInd++) {
                var index = parseInt(Math.random() * (getLen - astInd));
                var temp = getPostArr[index];
                getPostArr[index] = getPostArr[getLen - astInd - 1];
                getPostArr[getLen - astInd - 1] = temp;
            };
            return getPostArr;
        } else {
            getPostArr = arr.split("");
            getLen = getPostArr.length;
            for (var astInd = 0; astInd < getLen - 1; astInd++) {
                var index = parseInt(Math.random() * (getLen - astInd));
                var temp = getPostArr[index];
                getPostArr[index] = getPostArr[getLen - astInd - 1];
                getPostArr[getLen - astInd - 1] = temp;
            };
            return getPostArr.join("");
        };
    },

    /**
     * AST 获取混沌名称 [MAIN-2] 1.1
     * @postVal 加密的值
     * @getLength 要获取的长度值
     */
    ast_md5_func(postVal, getLength) {
        var encodeKey = postVal || "CocosCreator" + "_AST_抽象语法树_";
        var zhexue_num = new Date().getTime() + Math.random() * 142857 + 1024 + Math.random() * 129600 + 540 * 2;
        var getThis = this;
        // 乱序
        var mixSortOrderStr = getThis.ast_shuffleCardArr(encodeKey + "" + zhexue_num);
        this.ast_md5_val = this.ast_getMd5_length(md5(mixSortOrderStr), 12);
        this.ast_md5_val = this.createVariableName(getThis.ast_md5_val) || this.ast_getMd5_length(md5(mixSortOrderStr), 8);

        return this.ast_md5_val;
    },

    /**
     * AST 混淆算法 [MAIN-1] 1.0
    */
    // ast_mix_jsMAIN(SourceCodePath) {
        ast_mix_jsMAIN(SourceCodePath, isn_open_buildOb, params, obfuscate, getWebMobilePath_subpackages_0, getWebMobilePath_subpackages_1, getWebMobilePath_main, temp_array, tmp_item, getCongif) {
            var postSourceCodeStr = Fs.readFileSync(SourceCodePath, 'utf8');
            var getThis = this;
            if (!postSourceCodeStr || postSourceCodeStr.length === 0) {
                console.log("AST 抽象语法树 - JS 文件读取失败");
                return false;
            };
            var sourceCode = postSourceCodeStr || `
            function fibonacci(num){   
              function abc(){};
                var a = 0, b = 1, c = num;
                while (num-- > 1) {
                function abc(){};
                    c = a + b;
                    a = b;
                    b = c;
                }
                return c;
            }
            
            for ( var i = 1; i <= 25; i++ ) {
              function abc(){};
            console.log(i, fibonacci(i))
            }`;
            var startTime = new Date().getTime();
            var js_ast = parse(sourceCode);
            var obfuscated = confusion.transformAst(js_ast, (variableNames) => {
                return getThis.ast_md5_func("Cocos抽象语法树加密ast_md5_func", 8);
            });
            var confusEndString = toString(obfuscated);
            // 此项混淆容易卡住游戏逻辑, 注意谨慎使用
            // 必须先用 AST 混淆,然后用其它逻辑 否则逻辑落差会很大
            let debugMiniGameBool = !false;
    
            if (!debugMiniGameBool) {
                let getHunXiaoFile_0 = "index" || "game.js";
                let getHunXiaoFile_1 = SourceCodePath.split(getHunXiaoFile_0)[1];
                var EndTime = new Date().getTime();
                var usingTime = EndTime - startTime;
                usingTime = (usingTime / 1000).toFixed(2);
                console.log("👍 AST 抽象语法树混淆完成, 已写入 " + getHunXiaoFile_0 + getHunXiaoFile_1 + " 文件\n AST 混淆的 JS 文件路径为 => \n" + SourceCodePath);
                if (Fs.existsSync(SourceCodePath)) {
                    Fs.writeFileSync(SourceCodePath, confusEndString, 'utf8');
                };
            } else if (debugMiniGameBool) {
                var counter = 0;
                var jsConfusString = postSourceCodeStr || `
            function fibonacci(num){   
              var a = 0, b = 1, c = num;
              while (num-- > 1) {
                c = a + b;
                a = b;
                b = c;
              }
              return c;
            }
            
            for ( var i = 1; i <= 25; i++ ) {
              console.log(i, fibonacci(i))
            }
            `;
                JsConfuser.obfuscate(confusEndString, {
                    target: "node",
                    // preset: "low",
                    // stringEncoding: false, // <- Normally enabled
                    renameVariables: true,
                    identifierGenerator: function () {
                        return "_" + (counter++) + "C" + Math.random().toString(36).substring(7);
                    },
                }).then(obfuscated => {
                    let getHunXiaoFile_0 = "index" || "game.js";
                    let getHunXiaoFile_1 = SourceCodePath.split(getHunXiaoFile_0)[1];
                    var EndTime = new Date().getTime();
                    var usingTime = EndTime - startTime;
                    usingTime = (usingTime / 1000).toFixed(2);
                    console.log("👍 AST 抽象语法树混淆完成, 已写入 " + getHunXiaoFile_0 + getHunXiaoFile_1 + " 文件\n AST 混淆的 JS 文件路径为 => \n" + SourceCodePath);
                    if (Fs.existsSync(SourceCodePath)) {
                        Fs.writeFileSync(SourceCodePath, obfuscated, 'utf8');
                        if (isn_open_buildOb) {
                            setTimeout(() => {
                                // AST 后使用 JS-OB 混淆
                                getThis.js_obAfterFunc(isn_open_buildOb, params, obfuscate, getWebMobilePath_subpackages_0, getWebMobilePath_subpackages_1, getWebMobilePath_main, temp_array, tmp_item, getCongif);
                            }, Number(usingTime) + 0.3);
                        };
                    };
                });
            };
    
            return true;

        },
    
        /**
         * JS-OB 混淆算法 [MAIN-2] 2.0
        */
        js_obAfterFunc(isn_open_buildOb, params, obfuscate, getWebMobilePath_subpackages_0, getWebMobilePath_subpackages_1, getWebMobilePath_main, temp_array, tmp_item, getCongif) {
            var startTime = new Date().getTime();
            if (isn_open_buildOb) {
                console.log("⭐ JS-OB 正在开始混淆 [" + params.options.platform + "] 里面的代码");
                // JavaScript-obfuscate 混淆
                if (Fs.existsSync(getWebMobilePath_subpackages_0) || Fs.existsSync(getWebMobilePath_subpackages_1)) {
                    try {
                        let sourceCode_dir_arr = "";
                        let getHunXiaoFile_0 = "index" || "game.js";
                        let getHunXiaoFile_1 = ".js";
                        if (Fs.existsSync(getWebMobilePath_subpackages_0)) {
    
                            if (temp_array.length > 0) {
                                // 此处读取数组的第一个文件
                                let sourceCode_0 = Fs.readFileSync(temp_array[0], 'utf8');
                                // 执行混淆=>已设置固定参数=>defaultConfig #TODO => #自定义配置
                                obfuscate(temp_array[0], getCongif);
    
                                getHunXiaoFile_0 = "index";
                                getHunXiaoFile_1 = temp_array[0].split(getHunXiaoFile_0)[1];
                                var EndTime = new Date().getTime();
                                var usingTime = EndTime - startTime;
                                usingTime = (usingTime / 1000).toFixed(2);
                                console.log("👍 JS-OB 混淆完成, 已写入 " + getHunXiaoFile_0 + getHunXiaoFile_1 + " 文件\n文件路径为=>" + temp_array[0]);
                            };
                        } else if (Fs.existsSync(getWebMobilePath_subpackages_1)) {
                            console.log("👇 正在处理分包 [" + readMainJS_Path_sub_1 + "] 里面的代码");
    
                            if (temp_array.length > 0) {
                                // 此处读取数组的第一个文件
                                let sourceCode_0 = Fs.readFileSync(temp_array[0], 'utf8');
                                // 执行混淆=>已设置固定参数=>defaultConfig #TODO => #自定义配置
                                obfuscate(temp_array[0], getCongif);
    
                                getHunXiaoFile_0 = "game.";
                                getHunXiaoFile_1 = temp_array[0].split(getHunXiaoFile_0)[1];
                                var EndTime = new Date().getTime();
                                var usingTime = EndTime - startTime;
                                usingTime = (usingTime / 1000).toFixed(2);
                                console.log("👍 JS-OB 混淆完成, 已写入 " + getHunXiaoFile_0 + getHunXiaoFile_1 + " 文件\n文件路径为=>" + temp_array[0]);
                            };
                        };
    
                    } catch (error) { console.error("🌟 构建结束 error=>", error); };
                } else {
                    try {
                        let sourceCode_dir_arr = Fs.readdirSync(getWebMobilePath_main, 'utf8');
                        // 循环读取文件夹下的文件,分类,摘取需要的文件
                        sourceCode_dir_arr.forEach((getItem) => {
                            // 空格啥的删除一波??还是不删了,要读文件,此处注释::
                            // getItem = getItem.replace(/\s/g, "");
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
    
                        if (temp_array.length > 0) {
                            // 此处读取数组的第一个文件
                            let sourceCode_0 = Fs.readFileSync(temp_array[0], 'utf8');

                            obfuscate(temp_array[0], getCongif);

                            let getHunXiaoFile_0 = "index" || "game.js";
                            let getHunXiaoFile_1 = temp_array[0].split(getHunXiaoFile_0)[1];
                            var EndTime = new Date().getTime();
                            var usingTime = EndTime - startTime;
                            usingTime = (usingTime / 1000).toFixed(2);
                            console.log("👍 JS-OB 混淆完成, 已写入 " + getHunXiaoFile_0 + getHunXiaoFile_1 + " 文件\n文件路径为=>" + temp_array[0]);
                        };
                    } catch (error) { console.error("🌟 构建结束 error=>", error); };
                };
            };
        },
    /**
     * 获取 md5 的 32 位值里面的指定位数, 每次获取的都是再次乱序的 md5 的值, 保证不唯一
     */
    ast_getMd5_length(md5_32_val, getLength) {
        if (getLength < md5_32_val.length) {
            return md5_32_val.slice(0, getLength);
        } else {
            return md5_32_val;
        };
    },

    /**
     * 创作一个随机名称, 这个仅供参考
     * @param {*} variableNames 
     * @returns 随机名称
     */
    createVariableName(variableNames) {
        var name = '_cc' || '_x';
        do {
            name += (Math.random() * 0xffff) | 0;
        } while (variableNames.indexOf(name) !== -1);
        return name;
    },
};
module.exports = Ast_Codeing_Do;