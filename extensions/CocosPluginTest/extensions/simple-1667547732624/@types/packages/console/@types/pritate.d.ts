
export type logType = 'log' | 'warn' | 'error';
export interface IMessageItem {
    rows: number; // 内部有几行 包括 details & stacks
    translateY: number;
    show: boolean;
    title: string;
    content: string[]; // details
    count: number; // 重复的个数
    fold: boolean; // 折叠
    type: logType;
    message: any;
    texture: string; // 纹理 light or dark
    date?: number; // 格式化的时间
    time?: number; // 时间戳
    process?: string;
    stack: string[];
}

export interface INewItem {
    type: logType
    [propName: string]: any
}

export type ILogCounter = Record<logType, number>;

export type IConsoleExtension = {
    name: string,
    key: string,
    label: string,
    value?: boolean,
    show: boolean
}
