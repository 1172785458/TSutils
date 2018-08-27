/** 解释数据类型 */
export type SocketMessage = {
    action: string,
    args: any
}

/** 创建Socket链接 */
export default class Socket {

    /** 开启调试模式 */
    static readonly _debug: boolean = false;
    /** Socket实例对象 */
    private static _socket: SOCKET;

    /** 接收信息回调 */
    static onMessage: Map<string, any> = new Map();
    /** 重试链接失败回调 */
    static onDisconnect: Map<string, any> = new Map();
    /** 链接成功回调 */
    static onConnect: Map<string, any> = new Map();
    /** 断开链接回调 */
    static onClose: Map<string, any> = new Map();
    /** 链接失败回调 */
    static onError: Map<string, any> = new Map();

    /** 实例对象 */
    static get socket(): SOCKET {
        if (!this._socket) this._socket = new SOCKET();
        return this._socket;
    }

    /** 链接Socket
     * @param host          IP地址
     * @param port          端口
     */
    static connect(host: string, port: number, skip: boolean = false): void {
        if (skip && this.socket.connected) {
            return;
        }
        this.close();
        this.socket.connect(host, port);
    }
    static connectByUrl(url: string): void {
        if (this.socket.connected) {
            return;
        }
        this.close();
        this.socket.connectByUrl(url);
    }

    /** 二进制顺序 */
    static set endian(big: boolean) {
        this.socket.endian = big ? Laya.Socket.BIG_ENDIAN : Laya.Socket.LITTLE_ENDIAN;
    }

    /** 子协议名称字符串或由多个子协议名称字符串构成的数组 */
    static set protocols(protocols: string | string[]) {
        this.socket.protocols = protocols;
    }

    /** 不再缓存服务端发来的数据 */
    static set disableInput(bool: boolean) {
        this.socket.disableInput = bool;
    }

    /** 获取缓存的服务端发来的数据 */
    static get input(): any {
        return this.socket.input;
    }

    /** 获取发送至服务端的缓冲区中的数据 */
    static get output(): any {
        return this.socket.output;
    }

    /** 获取Socket链接情况 */
    static get connected(): boolean {
        return this._socket && this._socket.connected;
    }

    /** 发送数据(JSON) */
    static send(action: string, args: any): void {
        if (this.connected) {
            this.socket.log('Socket Send ::', action, args);
            let _data: string = action + ':' + JSON.stringify(args);
            this._socket.send(_data);
        }
    }
    /** 解释数据 */
    static decodeSocketMessage(data: string): SocketMessage {
        let _i: number = data.indexOf(':');
        let _act: string = data.substr(0, _i);
        let _args: any = JSON.parse(data.substr(_i + 1));
        return { action: _act, args: _args };
    }

    /** 发送数据(二进制) */
    static sendBuffer(data: ArrayBuffer): void {
        if (this.connected) {
            this._socket.send(data);
        }
    }

    /** 发送缓冲区中的数据到服务器 */
    static flush(): void {
        if (this.connected) {
            this._socket.flush();
        }
    }

    /** 断开Socket */
    static close(): void {
        if (this.connected) {
            this.socket.log('Socket Close!');
            this._socket.cleanSocket();
            this._socket.close();
        }
    }

    private constructor() { }

}

class SOCKET extends Laya.Socket {

    /** IP地址 */
    private host!: string;
    /** 端口 */
    private port!: number;
    /** 断开后重试次数 */
    private retry: number = 0;
    private readonly retryMax: number = 10;

    /** 创建Socket链接
    * @param host          IP地址
    * @param port          端口
    * @param byteClass     字节模式
    */
    constructor(host?: string, port?: number, byteClass?: any) {
        super(undefined, undefined, byteClass);
        host && this.connect(host, port as number);
        this.on(Laya.Event.OPEN, this, this.onOpen);
        this.on(Laya.Event.CLOSE, this, this.onClose);
        this.on(Laya.Event.ERROR, this, this.onError);
        this.on(Laya.Event.MESSAGE, this, this.onMessage);
    }

    /** 打印信息 */
    log(...args: any[]): void {
        Socket._debug && console.log(...args);
    }

    /** 链接Socket
    * @param host          IP地址
    * @param port          端口
    */
    connect(host: string, port: number, retry: boolean = false): Socket {
        this.log('Socket ' + (retry ? 'Retry' : '') + ' Connect ::', 'ws://' + host + ':' + port + (retry ? (' -> ' + (this.retryMax - this.retry)) : ''));
        this.host = host;
        this.port = port;
        super.connect(this.host, this.port);
        return this;
    }

    /** 回调处理 */
    private toCallBack(map: Map<string, any>, fn: string, args: any[]): void {
        map.forEach((t: any, k: string) => {
            if (t.destroyed || !t[fn]) {
                map.delete(k);
                return;
            }
            t[fn](...args);
        });
    }

    /** 事件侦听 */
    private onOpen(...args: any[]): void {
        this.log('Socket Open ::', args);
        this.toCallBack(Socket.onConnect, 'onSConnect', args);
    }
    private onClose(...args: any[]): void {
        this.log('Socket Close ::', args);
        this.toCallBack(Socket.onClose, 'onSClose', args);
        if (this.retry > 0) {
            this.retry--;
            this.connect(this.host, this.port, true);
            return;
        }
        this.log('Socket Disconnect ::', args);
        this.toCallBack(Socket.onDisconnect, 'onSDisconnect', args);
    }
    private onError(...args: any[]): void {
        this.log('Socket Error ::', args);
        this.toCallBack(Socket.onError, 'onSError', args);
    }
    private onMessage(...args: any[]): void {
        this.log('Socket Message ::', args);
        this.toCallBack(Socket.onMessage, 'onSMessage', args);
    }

}