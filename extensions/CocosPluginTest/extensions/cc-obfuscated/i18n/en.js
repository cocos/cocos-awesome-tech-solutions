/*
 * @FilePath: en.js
 * @Author: koroFileHeader xx
 * @Date: 2022-10-06 17:16:42
 * @LastEditors: fileheader
 * @LastEditTime: 2022-10-20 13:35:09
 * @Copyright: [版权] 2022  Creator CO.LTD. All Rights Reserved.
 * @Descripttion: 
 */
module.exports = {
    'name': 'cc-obfuscated obfuscated',
    'description': "The code obfuscation tool supports automatic code obfuscation after project construction",
    'menu': {
        name: "Code Obfuscated ·✍",
        argu_set: "parameter · set",
        argu_des: "parameter · select",
        open: "✔ Open Obfuscated",
        close: "✘ Close Obfuscated",
        open_setting_panel: "Open the ->Settings panel for custom obfuscation data",
        open_settings_detail_panel: "Select Js -> Chose a Js files, start Ast or JS-OB obfuscated",
    },
    'proj_des': {
        obfu_label_0: {
            des: "Adjust the confusing parameters of the small game ->WeChat+Treble",
            lab: "Confusing parameters · Games · Adjustment"
        },
        obfu_label_1: {
            des: "Adjust general confusion parameters ->mobile+desktop",
            lab: "Confusion parameter · H5 · adjustment"
        },
        bind_defaultJson: {
            lab: "JSON file for saving obfuscated parameters"
        },
        uiprogress_start: {
            lab: "Adjust Parameters - Current Progress - Start"
        },
        uiprogress_end: {
            lab: "Adjust parameters - current progress - end"
        },
        is_auto_obfusJS: {
            des: "The obfuscation function is enabled by default. After it is enabled, the JS code will be automatically obfuscated after the construction is completed",
            lab: "Automatic obfuscation after construction"
        },
        is_AST_obfus: {
            des: "The AST (Abstract Syntax Tree) is enabled by default to confuse the functions of JS files.<br> After the AST (Abstract Syntax Tree) is enabled,  <br> the Js file will be confused for the second time after the previous confusion is completed.  <br> This confusion will use the built-in long random number and secret key to confuse the functions irreversibly!",
            lab: "AST Obfus Js"
        },
        is_json_obfus: {
            des: "Cocos 3.5.0+ Will Error Tips -> WebGL: INVALID_OPERATION, WebGL: too many errors .<br> By default, the function of automatically obfuscating JSON files is enabled. When enabled,  <br> JSON files in the build directory will be automatically obfuscated after the build is completed",
            lab: "Obfus JSON"
        },
        jsObfus_qrCodes: {
            des: "See more details about confusing parameters",
            lab: "More · Parameter explanation"
        },
        comp_seelook_set: {
            lab: "Mini game parameters",
            cont: {
                obfu_label_0: {
                    tip: "Adjust the confusion parameters of the small game",
                    val: "Adjust the confusing parameters of the small game ->WeChat+Treble"
                },
                bind_defaultJson: {
                    des: "The default binding is used to save the JSON file for confusing parameters, which is only used to locate and view the JSON file! ",
                    tip: "The default binding is used to save the JSON file for confusing parameters, which is only used to locate and view the JSON file! ",
                },
                uiprogress_start: {
                    tip: "Adjust current confusion parameters - current progress - start",
                },
                uiprogress_end: {
                    tip: "Adjust current confusion parameters - current progress - end",
                },
                is_auto_obfusJS: {
                    des: "The obfuscation function is enabled by default. After it is enabled, the JS code will be automatically obfuscated after the construction is completed",
                },
                jsObfus_qrCodes: {
                    tip: "See more details about confusing parameters"
                }
            }
        },
        comp_obfuscated_setting: {
            lab: "Confusion · General parameters",
            cont: {
                obfu_label_1: {
                    tip: "Adjust the confusion parameters of mobile and desktop H5",
                    val: "Adjust the confusion parameters of mobile and desktop H5 ->mobile+desktop web"
                },
                bind_defaultJson: {
                    des: "The default binding is used to save the JSON file for confusing parameters, which is only used to locate and view the JSON file! ",
                    tip: "The default binding is used to save the JSON file for confusing parameters, which is only used to locate and view the JSON file! ",
                },
                uiprogress_start: {
                    tip: "Adjust current confusion parameters - current progress - start",
                },
                uiprogress_end: {
                    tip: "Adjust current confusion parameters - current progress - end",
                },
                is_auto_obfusJS: {
                    des: "The obfuscation function is enabled by default. After it is enabled, the JS code will be automatically obfuscated after the construction is completed",
                },
                jsObfus_qrCodes: {
                    tip: "See more details about confusing parameters"
                }
            }
        },
    },
    'build_des': {
        jsObfus_des_main: {
            lab: "Confusion",
            des: "Currently, only the code built on the following four platforms can be confused",
            def: "Currently, only the code built on the following four platforms can be confused",
        },
        jsObfus_des_child: {
            lab: "Supported platforms",
            des: "At present, only the code built on these four platforms can be confused.  \nWeb-mobile || web-desktop || wechatname || bytedance-mini-game  \nMobile-web || Desktop-web || WeChat-mini-game || bytedance-mini-game",
            def: "Web mobile<br>web desktop<br>wechatname<br>bytedance-mini-game<br>mobile web || desktop web || WeChat games || bytedance-mini-game",
            tip: "At present, only the code built on these four platforms can be confused.  \nWeb-mobile || web-desktop || wechatname || bytedance-mini-game  \nMobile-web || Desktop-web || WeChat-mini-game || bytedance-mini-game",
        },
        bind_defaultJson: {
            lab: "JSON file for saving obfuscated parameters",
            des: "JSON file for saving obfuscated parameters",
            tip: "The bound JSON file is used to ->save obfuscated parameters",
        },
        is_auto_obfusJS: {
            lab: "Automatic obfuscation after construction",
            des: "The obfuscation function is enabled by default. After it is enabled, the JS code will be automatically obfuscated after the construction is completed",
            tip: "The obfuscation function is enabled by default. After it is enabled, the JS code will be automatically obfuscated after the construction is completed",
        },


        jsObfus_qrCodes: {
            des: "See more details about confusing parameters",
            tip: "See more details about confusing parameters",
            lab: "More · Parameter explanation"
        },
        verifyRuleMap: {
            jsObfus_Rule: {
                msg: "Please note that only numbers and letters can be entered in this string, and the total length cannot exceed 32 bits!"
            },
            ruleTest: {
                msg: "Please note that only numbers and letters can be entered in this string, and the total length cannot exceed 32 bits!"
            },
        }
    },

    'obfus_option': {
        'obfus_option_config': {
            "first_set_wx": "wxDefaultConfig",

            "compact": {
                "def": true,
                "des": `The compact code output on one line is the compressed code.<br>Type: boolean Default: true<br>`,
                "lab": "compact"
            },

            "controlFlowFlattening": {
                "def": false,
                "des": `Enables code control flow flattening. Control flow flattening is a source code structure transformation that hinders program understanding<br>This option greatly affects performance and reduces runtime speed by 1.5 times< Br>Used to controlFlowFlatteningThreshold to set the percentage of nodes affected by control flow flattening<br>Type: boolean Default value: false<br>`,
                "lab": "controlFlowFlattening"
            },

            "controlFlowFlatteningThreshold": {
                "def": 0.75,
                "des": `This setting is especially useful for large code volumes, because a large number of control flow conversions will slow down your code and increase the code volume<br>Type: number Default value: 0.75 Minimum value: 0 Maximum value: 1<br>`,
                "lab": "controlFlowFlatteningThreshold"
            },

            "deadCodeInjection": {
                "def": false,
                "des": `Significantly increase the size of obfuscation code (up to 200%). Use<br>for deadCodeInjectionThreshold to set the percentage of nodes affected by dead code injection only when the size of obfuscation code is insignificant.<br>This option forces the stringArray option to be enabled. With this option, random blocks of dead code will be added to the obfuscation code<br>Type: boolean Default: false<br>`,
                "lab": "deadCodeInjection"
            },

            "deadCodeInjectionThreshold": {
                "def": 0.4,
                "des": `Allowed to be set by deadCodeInjection<br>Type: number Default value: 0.4 Minimum value: 0 Maximum value: 1<br>`,
                "lab": "deadCodeInjectionThreshold"
            },

            "debugProtection": {
                "def": false,
                "des": `Disable the use of the browser's debugger development tool (anti debugging)<br>Type: boolean Default: false<br>`,
                "lab": "debugProtection"
            },

            "debugProtectionInterval": {
                "def": false,
                "des": `This item will block the browser when entering the developer mode. Please use caution<br>If it is set, the interval in milliseconds is used to force the debug mode on the console tab.<br>It is more difficult to use other functions of the developer tool. Works if debugProtection is enabled< Br>The recommended value is between 2000 and 4000 milliseconds<br>Type: number | boolean Default value: 0 || false<br>`,
                "lab": "debugProtectionInterval"
            },

            "disableConsoleOutput": {
                "def": false,
                "des": `Disable console log , console. info , console. error , console. warn , <br> console. debug , console. Exception and console Trace replaces them with empty functions< Br>This makes it more difficult to use the debugger of the browser<br>This option enables the console to disable all script calls globally<br>Type: boolean Default: false<br>`,
                "lab": "disableConsoleOutput"
            },

            "domainLock": {
                "def": [],
                "des": `Allowing obfuscated source code to run only on specific domains and/or subdomains< Br>This makes it difficult for people to copy and paste your source code and run it elsewhere< Br>If the source code is not run on the domain specified by this option,<br>the browser will be redirected to the URL passed to the domainLockRedirectUrl option< Br>Type: string [] Default value: []<br>`,
                "lab": "domainLock"
            },

            "identifierNamesGenerator": {
                "def": "hexadecimal",
                "des": `Sets the identifier name generator< Br>Available values:<br>dictionary: identifier name in the identifier dictionary list<br>hexadecimal: identifier name, such as_ 0xabc123<br>mangled: short identifier name, such as a, b, c<br>mangled shuffled: the same, mangled, but using mixed letters<br>Type: string Default: hexadecimal<br>`,
                "lab": "identifierNamesGenerator"
            },

            "identifiersDictionary": {
                "def": [],
                "des": `The identifier NamesGenerator sets the identifier dictionary for the: dictionary option< Br>Each identifier in the dictionary will be used for several variants, and the case of each character is different< Br>Therefore, the number of identifiers in the dictionary should depend on the number of identifiers in the original source code< Br>Type: string [] Default value: []<br>`,
                "lab": "identifiersDictionary"
            },

            "identifiersPrefix": {
                "def": "",
                "des": `Use this option when you want to confuse multiple files< Br>This option helps to avoid conflicts between the global identifiers of these files. Each file should have a different prefix< Br>Set prefix for all global identifiers<br>Type: string Default value: ''<br>`,
                "lab": "identifiersPrefix"
            },

            "inputFileName": {
                "def": "",
                "des": `Allows the name of the input file to be set using source code. This name will be used internally for source mapping generation< Br>When using the NodeJS API and the sourceMapSourcesMode option has a value, you need sources<br>Type: string Default value: ''<br>`,
                "lab": "inputFileName"
            },

            "log": {
                "def": false,
                "des": `Allows you to log information to the console<br>Type: boolean Default: false<br>`,
                "lab": "log"
            },

            "renameGlobals": {
                "def": false,
                "des": `This option may corrupt your code. Enable it only if you know what it does<br>Use declarations: Enable confusion between global variables and function names< Br>Type: boolean Default: false<br>`,
                "lab": "renameGlobals"
            },

            "reservedNames": {
                "def": [],
                "des": `Disable confusion and generation of identifiers matching the passed RegExp pattern<br>Type: string [] Default: []<br>`,
                "lab": "reservedNames"
            },

            "reservedStrings": {
                "def": [],
                "des": `Disable the conversion of string literals matching the passed RegExp pattern<br>Type: string [] Default: []<br>`,
                "lab": "reservedStrings"
            },

            "rotateStringArray": {
                "def": true,
                "des": `Note: Only when stringArray is enabled can<br>transform the stringArray according to a fixed and random (generated in case of confusion) position< Br>This makes it difficult for people to match strings to their original positions<br>Randomly transform the positions of elements in the string list<br>Type: boolean Default value: true<br>`,
                "lab": "rotateStringArray"
            },

            "seed": {
                "def": 0,
                "des": `This option sets the seed for the random generator. This is useful for creating repeatable results< Br>If the seed is 0 - the random generator will work without seed<br>Type: string | number Default: 0<br>`,
                "lab": "seed"
            },

            "selfDefending": {
                "def": false,
                "des": `This option forces the compact value to be set to true<br>This option makes the output code flexible for formatting and variable renaming< Br>If someone tries to use the JavaScript beautifier on the confused code, the code will no longer work.<br>This makes it more difficult to understand and modify the code.<br>After using this option for confusion, do not change the confused code in any way.<br>Because any change like the ugly code will trigger self defense, and the code will no longer work< Br>Type: boolean Default: false<br>`,
                "lab": "selfDefending"
            },

            "shuffleStringArray": {
                "def": true,
                "des": `Only when stringArray is enabled can you<br>shuffle the contents of stringArray randomly and shuffle the string list randomly<br>Type: boolean Default: true<br>`,
                "lab": "shuffleStringArray"
            },

            "sourceMap": {
                "def": false,
                "des": `Enable source map generation for obfuscation code< Br>Source mapping can help you debug confusing JavaScript source code< Br>If you want or need to debug in production, you can upload a separate source map file to a secret location,<br>then point your browser there<br>to generate the source map of the confused code<br>Type: boolean Default: false<br>`,
                "lab": "sourceMap"
            },

            "sourceMapBaseUrl": {
                "def": "",
                "des": `Set the BaseUrl of the source map import url when sourceMapMode: 'separate' Type: string Default: ''<br>`,
                "lab": "sourceMapBaseUrl"
            },

            "sourceMapFileName": {
                "def": "",
                "des": `Set the source map output name when sourceMapMode: 'separate'< Br>Type: string Default value: ''<br>`,
                "lab": "sourceMapFileName"
            },

            "sourceMapMode": {
                "def": "separate",
                "des": `Set the source map generation mode< Br>Set the file name of the output source map sourceMapMode: 'separate'< Br>inline - Send a single file containing the source map instead of generating a separate file< Br>separate - generate the ' Map 'file< Br>Type: string Default value: 'separate'<br>`,
                "lab": "sourceMapMode"
            },

            "splitStrings": {
                "def": false,
                "des": `Divide the string into blocks of specified length according to splitStringsChunkLength< Br>Split the text string into blocks with the value length of the splitStringsChunkLength option< Br>Type: boolean Default: false<br>`,
                "lab": "splitStrings"
            },

            "splitStringsChunkLength": {
                "def": 10,
                "des": `Set the block length of splitStrings< Br>Type: number Default value: 10<br>`,
                "lab": "splitStringsChunkLength"
            },

            "stringArray": {
                "def": true,
                "des": `Delete string literals and place them in a special array< Br>For example, the string "Hello World" in var m="Hello World"< Br>will be replaced with something like var m=_ 0x12c456[0x1];< Br>Type: boolean Default value: true<br>`,
                "lab": "stringArray"
            },

            "stringArrayEncoding": {
                "def": false,
                "des": `It is only useful if stringArray is enabled. This option will slow down your script< Br>Use base64 or rc4 to encrypt strings in the stringArray,<br>and insert specific code to decrypt at runtime< Br>Available values:<br>true (boolean): Use base64 to encrypt stringArray strings<br>false (boolean): Do not encrypt stringArray strings<br>base64 (string): Use base64 to encrypt stringArray strings<br>rc4 (string): Use rc4 to encrypt stringArray strings, which is about 30 - 50% slower than base64, but it is more difficult for people to obtain initial values< Br>Type: boolean | string Default value: false<br>`,
                "lab": "stringArrayEncoding"
            },

            "stringArrayThreshold": {
                "def": 0.8,
                "des": `To enable stringArray,<br>you can set this to adjust the probability of string insertion into stringArray< Br>You can use this setting to adjust the insertion of string text into the stringArray<br>This setting is especially useful for large code volumes,<br>because it calls the string array repeatedly and will slow down your code< Br>stringArrayThreshold: 0 equals stringArray: false< Br>Type: number Default value: 0.75 | Minimum value: 0 | Maximum value: 1<br>`,
                "lab": "stringArrayThreshold"
            },

            "target": {
                "def": "browser",
                "des": `Allows you to set the target environment for obfuscation code< Br>Available values:<br>browser<br>browser no eval<br>node<br>The output code node of browser and target is the same,<br>but some browser specific options are not allowed to be used with node target< Br>The output code of the target browser no eval does not use eval<br>Type: string Default: browser<br>`,
                "lab": "target"
            },


            "transformObjectKeys": {
                "def": false,
                "des": `Enable the conversion of object keys<br>To convert an object into a combination of multiple complex variables (that is, to make the code ugly)<br>Type: boolean Default value: false<br>`,
                "lab": "transformObjectKeys"
            },

            "unicodeEscapeSequence": {
                "def": false,
                "des": `Enables/disables string conversion to unicode escape sequences< Br>The escape sequence of Unicode greatly increases the code size.<br>Enabling this option will greatly increase the code volume. At the same time, strings can be easily restored to their original view. It is recommended that you enable this option only for small source code< Br>It seems more complicated to convert characters into Unicode format.<br>However, the Unicode format is easy to recover< Br>Type: boolean Default: false<br>`,
                "lab": "unicodeEscapeSequence"
            },

        }
    }
};
