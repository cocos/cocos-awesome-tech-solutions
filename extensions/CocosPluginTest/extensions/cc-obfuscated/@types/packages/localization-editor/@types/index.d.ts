interface CCENodeEventMap {
    added (node: import('cc').Node): void
    change (node: import('cc').Node): void
    removed (node: import('cc').Node): void
}

interface CCEComponentEventMap {
    added (component: import('cc').Component): void,
    removed (component: import('cc').Component): void,
}

declare class CCENodeManager extends EventEmitter {
    on<T extends keyof CCENodeEventMap> (message: T, callback: CCENodeEventMap[T]): this;
    off<T extends keyof CCENodeEventMap> (message: T, callback: CCENodeEventMap[T]): this;
}
declare class CCEComponentManager extends EventEmitter {
    on<T extends keyof CCEComponentEventMap> (message: T, callback: CCEComponentEventMap[T]): this;
    off<T extends keyof CCEComponentEventMap> (message: T, callback: CCEComponentEventMap[T]): this;
}

type CCE = {
    Node: CCENodeManager,
    Component: CCEComponentManager,
    Prefab: {
        generatePrefabDataFromNode(nodeUUID: string| cc.Node): string | null
    }
};

declare const cce: CCE;
declare type UnPromise<T> = T extends Promise<infer R> ? R : T;
declare type UUID = string;
declare type Dump = { value: Record<string, { value: Dump | any, values?: any | Dump[], visible: boolean, readonly: boolean }> };
declare module 'cc/env' {
    export const EDITOR: boolean;
    export const BUILD: boolean;
}
declare const EditorExtends: any;
