"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configs = exports.unload = exports.load = void 0;
const load = function () {
    console.debug('custom-build-example load');
};
exports.load = load;
const unload = function () {
    console.debug('custom-build-example unload');
};
exports.unload = unload;
exports.configs = {
    'web-mobile': {
        options: {
            testInput: {
                label: 'testVar',
                description: 'this is a test input.',
                default: '',
                render: {
                    ui: 'ui-input',
                    attributes: {
                        placeholder: 'Enter numbers',
                    },
                },
                verifyRules: ['required', 'ruleTest']
            },
            testCheckbox: {
                label: 'testCheckbox',
                description: 'this is a test checkbox.',
                default: false,
                render: {
                    ui: 'ui-checkbox',
                },
            },
        },
        verifyRuleMap: {
            ruleTest: {
                message: 'length of content should be less than 6.',
                func(val, option) {
                    if (val.length < 6) {
                        return true;
                    }
                    return false;
                }
            }
        },
        hooks: "./hooks"
    },
};
