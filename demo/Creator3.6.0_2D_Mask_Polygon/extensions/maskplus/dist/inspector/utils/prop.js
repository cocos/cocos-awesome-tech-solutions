"use strict";
/* eslint-disable @typescript-eslint/no-unsafe-return */
/*
 * Returns the ordered PropMap
 * @param {*} value of dump
 * @returns {key:string dump:object}[]
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.setLabel = exports.setTooltip = exports.getName = exports.isMultipleInvalid = exports.updatePropByDump = exports.setHidden = exports.setReadonly = exports.setDisabled = exports.loopSetAssetDumpDataReadonly = exports.updateCustomPropElements = exports.sortProp = void 0;
function sortProp(propMap) {
    const orderList = [];
    const normalList = [];
    Object.keys(propMap).forEach((key) => {
        const item = propMap[key];
        if (item != null) {
            if ('displayOrder' in item) {
                orderList.push({
                    key,
                    dump: item,
                });
            }
            else {
                normalList.push({
                    key,
                    dump: item,
                });
            }
        }
    });
    orderList.sort((a, b) => a.dump.displayOrder - b.dump.displayOrder);
    return orderList.concat(normalList);
}
exports.sortProp = sortProp;
;
/**
 *
* This method is used to update the custom node
 * @param {HTMLElement} container
 * @param {string[]} excludeList
 * @param {object} dump
 * @param {(element,prop)=>void} update
 */
function updateCustomPropElements(container, excludeList, dump, update) {
    const sortedProp = exports.sortProp(dump.value);
    container.$ = container.$ || {};
    /**
     * @type {Array<HTMLElement>}
     */
    const children = [];
    sortedProp.forEach((prop) => {
        if (!excludeList.includes(prop.key)) {
            if (!prop.dump.visible) {
                return;
            }
            let node = container.$[prop.key];
            if (!node) {
                node = document.createElement('ui-prop');
                node.setAttribute('type', 'dump');
                node.dump = prop.dump;
                node.key = prop.key;
                container.$[prop.key] = node;
            }
            if (typeof update === 'function') {
                update(node, prop);
            }
            children.push(node);
        }
    });
    const currentChildren = Array.from(container.children);
    children.forEach((child, i) => {
        if (child === currentChildren[i]) {
            return;
        }
        container.appendChild(child);
    });
    // delete extra children
    currentChildren.forEach(($child) => {
        if (!children.includes($child)) {
            $child.remove();
        }
    });
}
exports.updateCustomPropElements = updateCustomPropElements;
;
/**
 * Tool function: recursively set readonly in resource data
 */
function loopSetAssetDumpDataReadonly(dump) {
    if (typeof dump !== 'object') {
        return;
    }
    if (dump.readonly === undefined) {
        return;
    }
    dump.readonly = true;
    if (dump.isArray) {
        for (let i = 0; i < dump.value.length; i++) {
            exports.loopSetAssetDumpDataReadonly(dump.value[i]);
        }
        return;
    }
    for (const key in dump.value) {
        exports.loopSetAssetDumpDataReadonly(dump.value[key]);
    }
}
exports.loopSetAssetDumpDataReadonly = loopSetAssetDumpDataReadonly;
;
/**
 * Tool functions: set to unavailable
 * @param {object} data  dump | function
 * @param element
 */
function setDisabled(data, element) {
    if (!element) {
        return;
    }
    let disabled = data;
    if (typeof data === 'function') {
        disabled = data();
    }
    if (disabled === true) {
        element.setAttribute('disabled', 'true');
    }
    else {
        element.removeAttribute('disabled');
    }
}
exports.setDisabled = setDisabled;
;
/**
 * Tool function: Set read-only status
 * @param {object} data  dump | function
 * @param element
 */
function setReadonly(data, element) {
    if (!element) {
        return;
    }
    let readonly = data;
    if (typeof data === 'function') {
        readonly = data();
    }
    if (readonly === true) {
        element.setAttribute('readonly', 'true');
    }
    else {
        element.removeAttribute('readonly');
    }
    if (element.render && element.dump) {
        element.dump.readonly = readonly;
        element.render();
    }
}
exports.setReadonly = setReadonly;
;
/**
 * Tool function: Set the display status
 * @param {Function | boolean} data  dump | function
 * @param {HTMLElement} element
 */
function setHidden(data, element) {
    if (!element) {
        return;
    }
    let hidden = data;
    if (typeof data === 'function') {
        hidden = data();
    }
    if (hidden === true) {
        element.setAttribute('hidden', '');
    }
    else {
        element.removeAttribute('hidden');
    }
}
exports.setHidden = setHidden;
;
function updatePropByDump(panel, dump) {
    panel.dump = dump;
    if (!panel.elements) {
        panel.elements = {};
    }
    const children = [];
    Object.keys(dump.value).forEach((key) => {
        const dumpdata = dump.value[key];
        const element = panel.elements[key];
        if (!panel.$[key]) {
            // element does not exist and the data tells that it does not need to be displayed, terminate rendering
            if (!dumpdata.visible) {
                return;
            }
            if (element && element.create) {
                // when it need to go custom initialize
                panel.$[key] = element.create.call(panel, dumpdata);
            }
            else {
                panel.$[key] = document.createElement('ui-prop');
                panel.$[key].setAttribute('type', 'dump');
                panel.$[key].render(dumpdata);
            }
            /**
             * Defined in the ascending engine, while the custom order ranges from 0 - 100;
             * If displayOrder is defined in the engine as a negative number, less than -100, it will take precedence over the custom ordering
             */
            panel.$[key].displayOrder = dumpdata.displayOrder === undefined ? 0 : Number(dumpdata.displayOrder);
            panel.$[key].displayOrder += 100;
            if (element && element.displayOrder !== undefined) {
                panel.$[key].displayOrder = element.displayOrder;
            }
        }
        else {
            // The element exists, but at this point the data informs that it does not need to be displayed and terminates
            if (!dumpdata.visible) {
                return;
            }
            if (panel.$[key].tagName === 'UI-PROP' && panel.$[key].getAttribute('type') === 'dump') {
                panel.$[key].render(dumpdata);
            }
        }
        if (panel.$[key]) {
            if (!element || !element.isAppendToParent || element.isAppendToParent.call(panel)) {
                children.push(panel.$[key]);
            }
        }
    });
    // Reorder
    children.sort((a, b) => a.displayOrder - b.displayOrder);
    let $children = Array.from(panel.$.componentContainer.children);
    children.forEach((child, i) => {
        if (child === $children[i]) {
            return;
        }
        panel.$.componentContainer.appendChild(child);
    });
    // delete extra children
    $children.forEach(($child) => {
        if (!children.includes($child)) {
            $child.remove();
        }
    });
    for (const key in panel.elements) {
        const element = panel.elements[key];
        if (element && element.ready) {
            element.ready.call(panel, panel.$[key], dump.value);
            element.ready = undefined; // ready needs to be executed only once
        }
    }
    for (const key in panel.elements) {
        const element = panel.elements[key];
        if (element && element.update) {
            element.update.call(panel, panel.$[key], dump.value);
        }
    }
}
exports.updatePropByDump = updatePropByDump;
;
/**
 * Tool function: check whether the value of the attribute is consistent after multi-selection
 */
function isMultipleInvalid(dump) {
    let invalid = false;
    if (dump.values && dump.values.some((ds) => ds !== dump.value)) {
        invalid = true;
    }
    return invalid;
}
exports.isMultipleInvalid = isMultipleInvalid;
;
/**
 * Get the name based on the dump data
 */
/**
 *
 * @param {string} dump
 * @returns
 */
function getName(dump) {
    if (!dump) {
        return '';
    }
    if (dump.displayName) {
        return dump.displayName;
    }
    let name = dump.name || '';
    name = name.replace(/^\S/, (str) => str.toUpperCase());
    name = name.replace(/_/g, (str) => ' ');
    name = name.replace(/ \S/g, (str) => ` ${str.toUpperCase()}`);
    return name.trim();
}
exports.getName = getName;
;
function setTooltip(element, dump) {
    if (dump.tooltip) {
        let tooltip = dump.tooltip;
        if (tooltip.startsWith('i18n:')) {
            tooltip = Editor.I18n.t('ENGINE.' + tooltip.substr(5));
            // If ENGINE doesn't translate, use extension's translation data and try to translate directly  
            if (!tooltip || tooltip === dump.tooltip) {
                tooltip = Editor.I18n.t(dump.tooltip.substr(5)) || dump.tooltip;
            }
        }
        element.setAttribute('tooltip', tooltip);
    }
    else {
        element.removeAttribute('tooltip');
    }
}
exports.setTooltip = setTooltip;
;
/**
* Sets the generic property Label in prop
* name and tooltip
*/
function setLabel($label, dump) {
    if (!dump) {
        // @ts-ignore
        dump = this.dump;
    }
    if (!$label || !dump) {
        return;
    }
    $label.innerHTML = exports.getName(dump);
    exports.setTooltip($label, dump);
}
exports.setLabel = setLabel;
;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvcC5qcyIsInNvdXJjZVJvb3QiOiJtYXNrcGx1czovLy8iLCJzb3VyY2VzIjpbImluc3BlY3Rvci91dGlscy9wcm9wLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx3REFBd0Q7QUFDeEQ7Ozs7R0FJRzs7O0FBRUgsU0FBZ0IsUUFBUSxDQUFDLE9BQVk7SUFDakMsTUFBTSxTQUFTLEdBQVUsRUFBRSxDQUFDO0lBQzVCLE1BQU0sVUFBVSxHQUFVLEVBQUUsQ0FBQztJQUU3QixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFO1FBQ2pDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUMxQixJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7WUFDZCxJQUFJLGNBQWMsSUFBSSxJQUFJLEVBQUU7Z0JBQ3hCLFNBQVMsQ0FBQyxJQUFJLENBQUM7b0JBQ1gsR0FBRztvQkFDSCxJQUFJLEVBQUUsSUFBSTtpQkFDYixDQUFDLENBQUM7YUFDTjtpQkFBTTtnQkFDSCxVQUFVLENBQUMsSUFBSSxDQUFDO29CQUNaLEdBQUc7b0JBQ0gsSUFBSSxFQUFFLElBQUk7aUJBQ2IsQ0FBQyxDQUFDO2FBQ047U0FDSjtJQUNMLENBQUMsQ0FBQyxDQUFDO0lBRUgsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUM7SUFFcEUsT0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3hDLENBQUM7QUF4QkQsNEJBd0JDO0FBQUEsQ0FBQztBQUVGOzs7Ozs7O0dBT0c7QUFDSCxTQUFnQix3QkFBd0IsQ0FBQyxTQUFjLEVBQUUsV0FBZ0IsRUFBRSxJQUFTLEVBQUUsTUFBVztJQUM3RixNQUFNLFVBQVUs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