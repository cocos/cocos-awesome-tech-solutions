// 消息定义
interface MessageInterface {
    params: any[],
    result: any;
}

// host
export interface HostInfo {
    host: string;
    ip: string;
    port: number;
}

// 消息定义
export interface main {
    scene: {
        [x: string]: MessageInterface;
        'query-port': {
            params: [],
            result: number,
        };
        'scan-lan': {
            params: [],
            result: HostInfo[],
        };
    }
}
