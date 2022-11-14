/*
 * @FilePath: zh.js
 * @Author: koroFileHeader xx
 * @Date: 2022-10-06 17:16:42
 * @LastEditors: fileheader
 * @LastEditTime: 2022-10-22 18:11:59
 * @Copyright: [版权] 2022  Creator CO.LTD. All Rights Reserved.
 * @Descripttion: 
 */
module.exports = {
    'name': 'cc-obfuscated 混淆',
    'description': "代码混淆工具, 支持项目构建后自动混淆代码",
    'menu': {
        name: "代码混淆·✍",
        argu_set: "混淆参数·设置面板",
        argu_des: "选择 JS ·指定混淆·面板",
        open: "✔ 开启混淆",
        close: "✘ 关闭混淆",
        open_setting_panel: "打开自定义混淆数据的->设置面板",
        open_settings_detail_panel: "手动选择需要混淆的 JS 文件, 选择类型, 手动混淆",
    },
    'proj_des': {
        obfu_label_0: {
            des: "调整小游戏的混淆参数-> 微信 + 抖音",
            lab: "混淆参数·小游戏·调整"
        },
        obfu_label_1: {
            des: "调整一般的混淆参数-> mobile + desktop",
            lab: "混淆参数·H5·调整"
        },
        bind_defaultJson: {
            lab: "保存混淆参数的 JSON 文件"
        },
        uiprogress_start: {
            lab: "调整参数-当前进度-开始"
        },
        uiprogress_end: {
            lab: "调整参数-当前进度-结束"
        },
        is_auto_obfusJS: {
            des: "默认开启混淆功能, 开启后, 会在构建完成后自动混淆 JS 代码",
            lab: "构建后自动混淆"
        },
        is_AST_obfus: {
            des: "默认开启 AST (抽象语法树) 来混淆 JS 文件的功能, 开启后, <br>会在之前的混淆完成后再对 Js 文件执行第二次混淆,<br>本次混淆将会采用内置的长随机数和秘钥来对函数进行不可逆 MD5 混淆!",
            lab: "AST 混淆 Js "
        },
        is_json_obfus: {
            des: "(试验功能, 请根据实际需求决定是否开启), <br> Cocos 3.5.0 以上版本混淆 JSON 后报错 WebGL: INVALID_OPERATION, WebGL: too many errors .<br>默认关闭构建后自动混淆 [构建目录下所有的 JSON 文件] 的功能, <br>开启后, <br>会在构建完成后自动混淆构建目录下的 JSON 文件(其实意义不大)",
            lab: "混淆 JSON 文件"
        },
        jsObfus_qrCodes: {
            des: "查看关于混淆参数的更多具体的内容",
            lab: "更多·参数解释"
        },
        comp_seelook_set: {
            lab: "小游戏参数",
            cont: {
                obfu_label_0: {
                    tip: "调整小游戏的混淆参数",
                    val: "调整小游戏的混淆参数-> 微信 + 抖音"
                },
                bind_defaultJson: {
                    des: "默认绑定用来保存混淆参数的 JSON 文件, 仅用于定位查看 JSON 文件 !",
                    tip: "默认绑定用来保存混淆参数的 JSON 文件, 仅用于定位查看 JSON 文件 !",
                },
                uiprogress_start: {
                    tip: "调整当前的混淆参数-当前进度-开始",
                },
                uiprogress_end: {
                    tip: "调整当前的混淆参数-当前进度-结束",
                },
                is_auto_obfusJS: {
                    des: "默认开启混淆功能, 开启后, 会在构建完成后自动混淆 JS 代码",
                },
                jsObfus_qrCodes: {
                    tip: "查看关于混淆参数的更多具体的内容"
                }
            }
        },
        comp_obfuscated_setting: {
            lab: "混淆·一般参数",
            cont: {
                obfu_label_1: {
                    tip: "调整 mobile 和 desktop 的 H5 的混淆参数",
                    val: "调整 mobile 和 desktop 的 H5 的混淆参数-> 手机端 + 桌面端 web"
                },
                bind_defaultJson: {
                    des: "默认绑定用来保存混淆参数的 JSON 文件, 仅用于定位查看 JSON 文件 !",
                    tip: "默认绑定用来保存混淆参数的 JSON 文件, 仅用于定位查看 JSON 文件 !",
                },
                uiprogress_start: {
                    tip: "调整当前的混淆参数-当前进度-开始",
                },
                uiprogress_end: {
                    tip: "调整当前的混淆参数-当前进度-结束",
                },
                is_auto_obfusJS: {
                    des: "默认开启混淆功能, 开启后, 会在构建完成后自动混淆 JS 代码",
                },
                jsObfus_qrCodes: {
                    tip: "查看关于混淆参数的更多具体的内容"
                }
            }
        },
    },
    'build_des': {
        jsObfus_des_main: {
            lab: "混淆[限制]",
            des: "目前仅支持对以下这四个平台构建的代码进行混淆",
            def: "目前仅支持对以下这四个平台构建的代码进行混淆",
        },
        jsObfus_des_child: {
            lab: "支持的平台",
            des: "目前仅支持对这四个平台构建的代码进行混淆\nweb-mobile || web-desktop || wechatgame || bytedance-mini-game \n 手机端 web || 桌面端 web || 微信小游戏 || 抖音小游戏",
            def: "web-mobile <br>web-desktop  <br>wechatgame <br>bytedance-mini-game <br>手机端 web || 桌面端 web || 微信小游戏 || 抖音小游戏",
            tip: "目前仅支持对这四个平台构建的代码进行混淆\nweb-mobile || web-desktop || wechatgame || bytedance-mini-game \n 手机端 web || 桌面端 web || 微信小游戏 || 抖音小游戏",
        },
        bind_defaultJson: {
            lab: "保存混淆参数的 JSON 文件",
            des: "保存混淆参数的 JSON 文件",
            tip: "绑定的是用来->保存混淆参数的 JSON 文件",
        },
        is_auto_obfusJS: {
            lab: "构建后自动混淆",
            des: "默认开启混淆功能, 开启后, 会在构建完成后自动混淆 JS 代码",
            tip: "默认开启混淆功能, 开启后, 会在构建完成后自动混淆 JS 代码",
        },


        jsObfus_qrCodes: {
            des: "查看关于混淆参数的更多具体的内容",
            tip: "查看关于混淆参数的更多具体的内容",
            lab: "更多·参数解释"
        },
        verifyRuleMap: {
            jsObfus_Rule: {
                msg: "请注意, 该字符串只允许输入数字和字母, 且总长度不能超过 32 位 !"
            },
            ruleTest: {
                msg: "请注意, 该字符串只允许输入数字和字母, 且总长度不能超过 32 位 !"
            },
        }
    },

    'obfus_option': {
        'obfus_option_config': {
            "first_set_wx": "wxDefaultConfig",

            "compact": {
                "def": true,
                "des": `紧凑的代码输出在一行上, 就是压缩代码,<br> 类型： boolean   默认值： true<br>`,
                "lab": "compact"
            },

            "controlFlowFlattening": {
                "def": false,
                "des": `启用代码控制流扁平化。控制流扁平化是一种阻碍程序理解的源代码结构转换<br> 此选项极大地影响性能，运行时速度降低 1.5 倍。<br> 用于 controlFlowFlatteningThreshold 设置受控制流扁平化影响的节点百分比<br> 类型： boolean   默认值： false<br>`,
                "lab": "controlFlowFlattening"
            },

            "controlFlowFlatteningThreshold": {
                "def": 0.75,
                "des": `此设置对于较大的代码量特别有用，因为大量的控制流转换会减慢您的代码并增加代码量<br> 类型：number   默认值： 0.75 最小值： 0 最大值： 1<br>`,
                "lab": "controlFlowFlatteningThreshold"
            },

            "deadCodeInjection": {
                "def": false,
                "des": `显着增加混淆代码的大小（高达 200%），仅在混淆代码的大小无关紧要时使用<br> 用于 deadCodeInjectionThreshold 设置受死代码注入影响的节点百分比<br> 此选项强制启用 stringArray 选项。使用此选项，死代码的随机块将被添加到混淆代码中<br> 类型： boolean  默认值： false<br>`,
                "lab": "deadCodeInjection"
            },

            "deadCodeInjectionThreshold": {
                "def": 0.4,
                "des": `允许设置受 deadCodeInjection<br> 类型： number  默认值： 0.4 最小值： 0 最大值： 1<br>`,
                "lab": "deadCodeInjectionThreshold"
            },

            "debugProtection": {
                "def": false,
                "des": `禁止使用浏览器的 debugger 开发工具的功能(反调试)<br> 类型： boolean   默认值： false<br>`,
                "lab": "debugProtection"
            },

            "debugProtectionInterval": {
                "def": false,
                "des": `此项会在进入开发者模式时卡住浏览器， 请谨慎使用<br> 如果设置，则以毫秒为单位的间隔用于强制控制台选项卡上的调试模式，<br> 从而更难使用开发人员工具的其他功能。如果 debugProtection 启用则工作。<br> 推荐值介于 2000 和 4000 毫秒之间<br> 类型： number|boolean   默认值： 0 || false<br>`,
                "lab": "debugProtectionInterval"
            },

            "disableConsoleOutput": {
                "def": false,
                "des": `禁用 console.log , console.info , console.error , console.warn , <br> console.debug , console.exception 和 console.trace 用空函数替换它们。<br> 这使得浏览器的调试器使用更加困难<br> 此选项 console 全局禁用所有脚本的调用<br> 类型： boolean   默认值： false<br>`,
                "lab": "disableConsoleOutput"
            },

            "domainLock": {
                "def": [],
                "des": `允许仅在特定域和/或子域上运行经过混淆的源代码。<br> 这使得人们很难复制和粘贴您的源代码并在其他地方运行它。<br> 如果源代码未在此选项指定的域上运行，<br> 浏览器将被重定向到传递给 domainLockRedirectUrl 选项的 URL。<br> 类型： string[]   默认值： []<br>`,
                "lab": "domainLock"
            },

            "identifierNamesGenerator": {
                "def": "hexadecimal",
                "des": `设置标识符名称生成器。<br> 可用值：<br> dictionary : identifiersDictionary 列表中的标识符名称<br> hexadecimal : 标识符名称如 _0xabc123<br> mangled : 短标识符名称，如 a , b , c<br> mangled-shuffled : 相同， mangled 但使用混洗字母<br> 类型： string   默认值： hexadecimal<br>`,
                "lab": "identifierNamesGenerator"
            },

            "identifiersDictionary": {
                "def": [],
                "des": `identifierNamesGenerator 为: dictionary 选项设置标识符字典。<br> 字典中的每个标识符都将用于几个变体，每个字符的大小写不同。<br> 因此，字典中标识符的数量应该取决于原始源代码中的标识符数量。<br> 类型： string[]   默认值： []<br>`,
                "lab": "identifiersDictionary"
            },

            "identifiersPrefix": {
                "def": "",
                "des": `当您想要混淆多个文件时使用此选项。<br> 此选项有助于避免这些文件的全局标识符之间的冲突。每个文件的前缀应该不同。<br> 为所有全局标识符设置前缀<br> 类型： string   默认值： ''<br>`,
                "lab": "identifiersPrefix"
            },

            "inputFileName": {
                "def": "",
                "des": `允许使用源代码设置输入文件的名称。此名称将在内部用于源映射生成。<br> 使用 NodeJS API 并且 sourceMapSourcesMode 选项具有值时需要 sources<br> 类型： string   默认值： ''<br>`,
                "lab": "inputFileName"
            },

            "log": {
                "def": false,
                "des": `允许将信息记录到控制台<br> 类型： boolean   默认值： false<br>`,
                "lab": "log"
            },

            "renameGlobals": {
                "def": false,
                "des": `此选项可能会破坏您的代码。仅当您知道它的作用时才启用它<br> 使用声明： 启用对全局变量和函数名称的混淆。<br> 类型： boolean   默认值： false<br>`,
                "lab": "renameGlobals"
            },

            "reservedNames": {
                "def": [],
                "des": `禁用与传递的 RegExp 模式匹配的标识符的混淆和生成<br> 类型： string[]   默认值： []<br>`,
                "lab": "reservedNames"
            },

            "reservedStrings": {
                "def": [],
                "des": `禁用与传递的 RegExp 模式匹配的字符串文字的转换<br> 类型： string[]   默认值： []<br>`,
                "lab": "reservedStrings"
            },

            "rotateStringArray": {
                "def": true,
                "des": `注意：要开启 stringArray 才有用<br> 根据一个固定和随机（混淆时生成）的位置变换stringArray。<br> 这会让人难以匹配字符串到他们原来的位置<br> 随机变换字符串列表中元素的位置<br> 类型：boolean   默认值：true<br>`,
                "lab": "rotateStringArray"
            },

            "seed": {
                "def": 0,
                "des": `此选项为随机生成器设置种子。这对于创建可重复的结果很有用。<br> 如果种子是 0 - 随机生成器将在没有种子的情况下工作<br> 类型： string|number   默认值： 0<br>`,
                "lab": "seed"
            },

            "selfDefending": {
                "def": false,
                "des": `此选项强制将 compact 值设置为 true<br> 此选项使输出代码对格式化和变量重命名具有弹性。<br> 如果有人试图在混淆后的代码上使用 JavaScript 美化器，代码将不再工作，<br> 从而使其更难理解和修改<br> 使用此选项进行混淆后，请勿以任何方式更改混淆代码，<br> 因为任何像丑化代码这样的更改都会触发自我防御，代码将不再起作用！<br> 类型： boolean   默认值： false<br>`,
                "lab": "selfDefending"
            },

            "shuffleStringArray": {
                "def": true,
                "des": `要开启 stringArray 才有用<br> 对 stringArray 的内容随机洗牌，对字符串列表进行随机洗牌打乱<br> 类型：boolean  默认值：true<br>`,
                "lab": "shuffleStringArray"
            },

            "sourceMap": {
                "def": false,
                "des": `为混淆代码启用源映射生成。<br> 源映射可以帮助您调试混淆的 JavaScript 源代码。<br> 如果您想要或需要在生产中进行调试，您可以将单独的源映射文件上传到一个秘密位置，<br> 然后将您的浏览器指向那里<br> 生成混淆后的代码的 source map<br> 类型：boolean  默认值：false<br>`,
                "lab": "sourceMap"
            },

            "sourceMapBaseUrl": {
                "def": "",
                "des": `设置当sourceMapMode: 'separate'时的 source map 导入 url 的 BaseUrl<br> 类型：string  默认值：''<br>`,
                "lab": "sourceMapBaseUrl"
            },

            "sourceMapFileName": {
                "def": "",
                "des": `设置当sourceMapMode: 'separate'时的 source map 输出名称。<br> 类型：string  默认值：''<br>`,
                "lab": "sourceMapFileName"
            },

            "sourceMapMode": {
                "def": "separate",
                "des": `设定 source map 的生成模式。<br> 设置输出源映射的文件名 sourceMapMode: 'separate' 。<br> inline - 发送包含 source map 的单个文件而不是生成单独的文件。<br> separate - 生成与 source map 对应的 '.map' 文件。<br> 类型：string  默认值：'separate'<br>`,
                "lab": "sourceMapMode"
            },

            "splitStrings": {
                "def": false,
                "des": `根据 splitStringsChunkLength 将字符串分成指定长度的块。<br> 将文字字符串拆分为具有 splitStringsChunkLength 选项值长度的块。<br> 类型： boolean 默认值： false<br>`,
                "lab": "splitStrings"
            },

            "splitStringsChunkLength": {
                "def": 10,
                "des": `设置 splitStrings 的块长度。<br> 类型：number  默认值：10<br>`,
                "lab": "splitStringsChunkLength"
            },

            "stringArray": {
                "def": true,
                "des": `删除字符串文字并将它们放在一个特殊的数组中。<br> 例如，字符串 "Hello World" in var m = "Hello World";<br> 将被替换为类似 var m = _0x12c456[0x1];<br> 类型： boolean 默认值： true<br>`,
                "lab": "stringArray"
            },

            "stringArrayEncoding": {
                "def": false,
                "des": `要开启 stringArray 才有用, 此选项会减慢您的脚本速度。<br> 用base64或者rc4来加密stringArray中的字符串，<br> 并且插入特定的代码用来运行时解密。<br> 可用值：<br> true（boolean）：用base64加密stringArray字符串<br> false（boolean）：不加密stringArray字符串<br> base64（string）：用base64加密stringArray字符串<br> rc4（string）：用rc4加密stringArray字符串, 比base64慢大概 30 - 50% ，但是让人更难获取初始值。<br> 类型：boolean|string 默认值：false<br>`,
                "lab": "stringArrayEncoding"
            },

            "stringArrayThreshold": {
                "def": 0.8,
                "des": `要开启 stringArray 才有用<br> 可以设置这个来调整字符串插入stringArray的概率。<br> 您可以使用此设置来调整将字符串文字插入到 stringArray <br> 此设置对于大代码量特别有用，<br> 因为它反复调用 string array 并且会减慢您的代码。<br> stringArrayThreshold: 0 等于 stringArray: false 。<br> 类型：number   默认值：0.75 | 最小值：0 | 最大值：1<br>`,
                "lab": "stringArrayThreshold"
            },

            "target": {
                "def": "browser",
                "des": `允许为混淆代码设置目标环境。<br> 可用值：<br> browser<br> browser-no-eval<br> node<br> browser 当前和目标的输出代码 node 是相同的，<br> 但是某些特定于浏览器的选项不允许与 node 目标一起使用。<br> 目标的输出代码 browser-no-eval 未使用 eval<br> 类型： string 默认值： browser<br>`,
                "lab": "target"
            },


            "transformObjectKeys": {
                "def": false,
                "des": `启用对象键的转换<br> 将对象转换成多个复杂变量的组合（就是让代码变得难看）<br> 类型： boolean   默认值： false<br>`,
                "lab": "transformObjectKeys"
            },

            "unicodeEscapeSequence": {
                "def": false,
                "des": `允许启用/禁用字符串转换为 unicode 转义序列。<br> Unicode 转义序列大大增加了代码大小，<br> 开启该选项会大大增加代码的体积，同时字符串也不难被恢复<br> 并且可以轻松地将字符串恢复为其原始视图。建议仅对小型源代码启用此选项。<br> 将字符转为 Unicode 格式，就是看起来更加复杂了，<br> 但是 Unicode 格式实际上很容易恢复。<br> 类型： boolean   默认值： false<br>`,
                "lab": "unicodeEscapeSequence"
            },

        }
    }
};
