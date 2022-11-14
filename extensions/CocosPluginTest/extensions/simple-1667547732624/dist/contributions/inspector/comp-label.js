'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.ready = exports.update = exports.$ = exports.template = void 0;
exports.template = `
<ui-label value="这是我的自定义文本组件: CustomLabel"></ui-label>
<ui-prop type="dump" class="test"></ui-prop>
`;
exports.$ = {
    test: '.test',
};
function update(dump) {
    // 使用 ui-porp 自动渲染，设置 prop 的 type 为 dump
    // render 传入一个 dump 数据，能够自动渲染出对应的界面
    // 自动渲染的界面修改后，能够自动提交数据
    this.$.test.render(dump.value.label);
}
exports.update = update;
function ready() { }
exports.ready = ready;
