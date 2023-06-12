import { IBuildPanel, IInternalBuild } from ".";

// 定义 builder 进程内的全局变量
declare global {
    // 构建进程可用
    // @ts-ignore
    const Build: IInternalBuild;

    const __manager: {
        taskManager: any;
        currentCompileTask: any;
        currentBuildTask: any;
        __taskId: string;
    };

    // 渲染进程可用
    const BuildPanel: IBuildPanel;
}
