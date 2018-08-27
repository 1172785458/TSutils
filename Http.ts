/** 通信接口 */
export default class Http {

    /**创建请求 */
    private static httpRequest(url: string,
        data: any = null,
        method: "get" | "post" | "head" = 'post',
        responseType: "text" | "json" | "xml" | "arraybuffer" = 'text',
        headers?: string[]): Laya.HttpRequest {

        let _http: Laya.HttpRequest = new Laya.HttpRequest();
        _http.send(url, data, method, responseType, headers);
        return _http;
    }

    /**发送数据请求 */
    static HRSend(url: string,
        data: any = null,
        responseType: "text" | "json" | "xml" | "arraybuffer" = 'text',
        complete?: Function,
        error?: Function,
        headers?: string[]): Laya.HttpRequest {

        let _http: Laya.HttpRequest = this.httpRequest(url, data, 'post', responseType, headers);
        complete && _http.once(Laya.Event.COMPLETE, _http, complete, [_http]);
        error && _http.once(Laya.Event.ERROR, _http, error, [_http]);
        return _http;
    }

    /**接收数据请求 */
    static HRGet(url: string,
        responseType: "text" | "json" | "xml" | "arraybuffer" = 'text',
        complete?: Function,
        error?: Function): Laya.HttpRequest {

        let _http: Laya.HttpRequest = this.httpRequest(url, null, 'get', responseType);
        complete && _http.once(Laya.Event.COMPLETE, _http, complete, [_http]);
        error && _http.once(Laya.Event.ERROR, _http, error, [_http]);
        return _http;
    }

}