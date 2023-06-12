export interface IMessageItem {
    rows: number;
    translateY: number;
    show: boolean;
    title: string;
    content: string[];
    count: number;
    fold: boolean;
    type: string;
    message: any;
    texture: string;
    date?: number;
    time?: number;
    process?: string;
    stack: string[];
}
