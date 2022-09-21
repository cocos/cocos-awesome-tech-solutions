'use strict';

import fs from 'fs'
import path from 'path';
import { isMultipleInvalid, setHidden, updatePropByDump } from './utils/prop';

module.exports = Editor.Panel.define({
    $: {
        componentContainer: '.component-container',
    },
    template: `
<div class="component-container">
</div>
    `,
    update(dump: any) {
        // 注入枚举值
        if (dump.value.type.enumList.length < 5) {
            dump.value.type.enumList.push({ name: 'POLYGON', value: 4 });
        }

        // 注入 POLYGON
        if (dump.value.polygon == null) {
            dump.value.polygon = {
                name: "polygon",
                value: [],
                type: "cc.Vec2",
                readonly: false,
                visible: true,
                displayOrder: 13,
                isArray: true,
                elementTypeData: {
                    value: {
                        x: 0,
                        y: 0
                    },
                    default: null,
                    type: "cc.Vec2",
                    readonly: false,
                    visible: true,
                    extends: [
                        "cc.ValueType"
                    ]
                },
                extends: [
                    "cc.ValueType"
                ],
                path: "__comps__.1.polygon",
                groups: {}
            };
        } else {
            dump.value.polygon.displayOrder = 9;
        }

        updatePropByDump(this, dump);
    },
    ready() {
        // @ts-ignore
        this.elements = <any>{
            type: {
                update(element: any, dump: any) {
                    // @ts-ignore
                    this.elements.polygon.update.call(this, null, dump);
                }
            },
            polygon: {
                update(element: any, dump: any) {
                    setHidden(dump._type.value != 4, element);
                }
            }
        }
    },
    close() {
    },
});
