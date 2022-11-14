
import { BuildPlugin, IBuildTaskOption } from '../@types';

export const load: BuildPlugin.load = function() {
    console.debug('custom-build-example load');
};

export const unload: BuildPlugin.load = function() {
    console.debug('custom-build-example unload');
};

export const configs:BuildPlugin.Configs = {
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
                verifyRules: ['required','ruleTest']
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
                func(val: any, option: IBuildTaskOption) {
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