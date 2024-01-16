export function onCreateMenu() {
    return [
        {
            label: 'customCreateMenu',
            click() {
                console.warn(`customCreateMenu clicked`);
            },
        },
    ];
};

export function onRootMenu() {
    return [
        {
            label: 'customRootMenu',
            click() {
                let uuids = Editor.Selection.getSelected('node');
                console.warn(`customRootMenu clicked`);
            },
        },
    ];
};

export function onNodeMenu() {
    return [
        {
            label: 'customNodeMenu',
            click() {
                let uuids = Editor.Selection.getSelected('node');
                console.warn(`customNodeMenu clicked`);
            },
        },
    ];
};

export function onPanelMenu() {
    return [
        {
            label: 'customPanelMenu',
            click() {
                let uuids = Editor.Selection.getSelected('node');
                console.warn(`customPanelMenu clicked`);
            },
        },
    ];
};