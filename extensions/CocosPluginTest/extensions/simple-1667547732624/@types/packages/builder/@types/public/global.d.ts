import { IBuild } from '.';

// 定义 builder 进程内的全局变量
declare global {
    // @ts-ignore
    const Build: IBuild;
}
