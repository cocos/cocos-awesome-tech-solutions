'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const prop_1 = require("./utils/prop");
module.exports = Editor.Panel.define({
    $: {
        componentContainer: '.component-container',
    },
    template: `
<div class="component-container">
</div>
    `,
    update(dump) {
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
        }
        else {
            dump.value.polygon.displayOrder = 9;
        }
        (0, prop_1.updatePropByDump)(this, dump);
    },
    ready() {
        // @ts-ignore
        this.elements = {
            type: {
                update(element, dump) {
                    // @ts-ignore
                    this.elements.polygon.update.call(this, null, dump);
                }
            },
            polygon: {
                update(element, dump) {
                    (0, prop_1.setHidden)(dump._type.value != 4, element);
                }
            }
        };
    },
    close() {
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2MtbWFzay5qcyIsInNvdXJjZVJvb3QiOiJtYXNrcGx1czovLy8iLCJzb3VyY2VzIjpbImluc3BlY3Rvci9jYy1tYXNrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQzs7QUFJYix1Q0FBOEU7QUFFOUUsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQztJQUNqQyxDQUFDLEVBQUU7UUFDQyxrQkFBa0IsRUFBRSxzQkFBc0I7S0FDN0M7SUFDRCxRQUFRLEVBQUU7OztLQUdUO0lBQ0QsTUFBTSxDQUFDLElBQVM7UUFDWixRQUFRO1FBQ1IsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNyQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNoRTtRQUVELGFBQWE7UUFDYixJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLElBQUksRUFBRTtZQUM1QixJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRztnQkFDakIsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsS0FBSyxFQUFFLEVBQUU7Z0JBQ1QsSUFBSSxFQUFFLFNBQVM7Z0JBQ2YsUUFBUSxFQUFFLEtBQUs7Z0JBQ2YsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsWUFBWSxFQUFFLEVBQUU7Z0JBQ2hCLE9BQU8sRUFBRSxJQUFJO2dCQUNiLGVBQWUsRUFBRTtvQkFDYixLQUFLLEVBQUU7d0JBQ0gsQ0FBQyxFQUFFLENBQUM7d0JBQ0osQ0FBQyxFQUFFLENBQUM7cUJBQ1A7b0JBQ0QsT0FBTyxFQUFFLElBQUk7b0JBQ2IsSUFBSSxFQUFFLFNBQVM7b0JBQ2YsUUFBUSxFQUFFLEtBQUs7b0JBQ2YsT0FBTyxFQUFFLElBQUk7b0JBQ2IsT0FBTyxFQUFFO3dCQUNMLGNBQWM7cUJBQ2pCO2lCQUNKO2dCQUNELE9BQU8sRUFBRTtvQkFDTCxjQUFjO2lCQUNqQjtnQkFDRCxJQUFJLEVBQUUscUJBQXFCO2dCQUMzQixNQUFNLEVBQUUsRUFBRTthQUNiLENBQUM7U0FDTDthQUFNO1lBQ0gsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQztTQUN2QztRQUVELElBQUEsdUJBQWdCLEVBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pDLENBQUM7SUFDRCxLQUFLO1FBQ0QsYUFBYTtRQUNiLElBQUksQ0FBQyxRQUFRLEdBQVE7WUFDakIsSUFBSSxFQUFFO2dCQUNGLE1BQU0sQ0FBQyxPQUFZLEVBQUUsSUFBUztvQkFDMUIsYUFBYTtvQkFDYixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ3hELENBQUM7YUFDSjtZQUNELE9BQU8sRUFBRTtnQkFDTCxNQUFNLENBQUMsT0FBWSxFQUFFLElBQVM7b0JBQzFCLElBQUEsZ0JBQVMsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssSUFBSSxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7Z0JBQzlDLENBQUM7YUFDSjtTQUNKLENBQUE7SUFDTCxDQUFDO0lBQ0QsS0FBSztJQUNMLENBQUM7Q0FDSixDQUFDLENBQUMifQ==