import { EVENT_NOTICE_NOTIFY } from '../guiv2/MainUI';
import { RPC } from "rpc";

/** UI功能定义类型 */
type NotifyConfig = {
    closed?: boolean// 关闭接收通知功能
    active?: boolean// 处于活动状态时才接收通知
    masker?: boolean//* 将隐藏深度(zOder)小于自己的UI
}

/** 对每个UI的功能进行配置 */
const Status: { [uiname: string]: NotifyConfig } = {
    MainUI: { masker: true, active: true },
    MatchUI: { masker: true },
    MarketUI: { masker: true },
    MyhorseUI: { masker: true },
    ChatUI: { masker: true },
    ExchangeUI: { masker: true },
}

/************************************************************************************************** */
/** 服务端向客户端发送消息处理 */

type NotifyCache = { [className: string]: any[] };
/** 服务端数据处理类 */
export class UINotify {

    /** 缓存服务器通知 */
    private static cache: NotifyCache = {};

    /** 根据类名处理缓存服务器通知 */
    static run(className: string) {
        console.log('run ::', className);
        if (this.cache[className] === undefined) return; // 没有缓存通知
        else if (this.cache[className].length == 0) return;
        if (!notify(className)) return; // 通过配置接收通知？
        switch (className) {// 根据侦听UI名称进行处理通知
            case 'MainUI': // 主城UI
                Laya.stage.event(EVENT_NOTICE_NOTIFY, this.cache[className][0]);
                this.cache[className].shift();
                break;
        }
    }

    /********************************************************************************************** */
    /** 定义服务器端通知消息的接口与处理 */

    @RPC.systemNotice()
    /** 系统公告处理 */
    static systemNotice(message: string) {
        let className = "MainUI";// 侦听UI
        this.cache[className] = this.cache[className] || []; // 缓存通知
        this.cache[className].push(message);
        Laya.timer.callLater(this, this.run, [className]);
    }

}

/************************************************************************************************** */
/** 根据UI功能配置中(masker)的属性值智能管理UI的显示或隐藏 */

type UI = any | Laya.View | Laya.Sprite | Laya.Box | Laya.Dialog | Laya.Panel;
/** 显示UI记录列表 */
let uiList: UI[] = [];

/** 获取实例类名 */
export function getClassName(t: UI): string {
    let code = t.constructor.toString();
    let index = code.indexOf(')') - 10;
    return code.substr(9, index);
}

/** 判断显示UI记录列表中是否存在指定UI并且是否接收通知 */
function notify(className: string): boolean {
    if (Status[className] === undefined) return true;
    let can = true;
    let max = uiList.length - 1;
    uiList.every((ui, i) => {
        let name = getClassName(ui);
        if (className == name) {
            let cfg = Status[name];
            if (cfg.closed) can = false;
            else if (cfg.active && i < max) can = false;
            return false;
        }
        return true;
    });
    return can;
}

/** 隐藏深度(zOder)小于对象的其它UI */
function hideUI(idx: number): boolean {
    let dialog = uiList[idx];
    dialog.visible = true;
    let name = getClassName(dialog);
    if (Status[name] === undefined) return false;
    let ismasker = Status[name].masker;
    if (ismasker)
        while ((idx--) > 0) uiList[idx].visible = false;
    else ismasker = false;
    return ismasker;
}
/** 显示下一层UI */
function showUI() {
    uiList.forEach((ui, i) => {
        if (ui.destroyed) uiList.splice(i, 1);
    });
    let i = uiList.length;
    while ((i--) > 0) {
        if (hideUI(i)) break;
    }
}

/** Dialog类型的UI会智能管理
 * 其它非Dialog类型的UI需手动进行添加和移动处理
 */

/** 添加到显示列表 */
export function add(ui: UI) {
    uiList.push(ui); console.log('UINotify.ts :: add => uiList =', uiList);
    if (ui.popup) {
        ui.onOpened = () => {
            UINotify.run(getClassName(ui));
            delete ui.onOpened;
        }
    } else Laya.timer.callLater(UINotify, UINotify.run, [getClassName(ui)]);
    showUI();
}
/** 从显示列表移除 */
export function pop() {
    let pop = uiList.pop(); console.log('UINotify.ts :: pop => uiList =', uiList);
    if (uiList.length > 0) {
        let ui = uiList[uiList.length - 1];
        if (pop.popup) {
            pop.onClosed = () => {
                UINotify.run(getClassName(ui));
                delete pop.onClosed;
            }
        } else UINotify.run(getClassName(ui));
    }
    showUI();
}

/** 侦听打开UI和关闭UI
 * 需对源码进行额外修改
 * 文件：laya.ui.js
 * 类名：var DialogManager
 * 方法：__proto._closeOnSide
 * 代码：this.clickTime = this.clickTime || 1;
        if ((Date.now() - this.clickTime) < 500) return;
        this.clickTime = Date.now();
        // 注：代码加在方法原代码之前  效果：防止快速点击时可能发生的事件流延迟的处理错误问题
 * 方法：__proto.open
 * 事件：event("open",dialog); 添加事件参数 dialog
 */
export function init() {
    console.log('UINotify.ts :: init => void');
    Laya.Dialog.manager.on(Laya.Event.OPEN, Laya.stage, add);
    Laya.Dialog.manager.on(Laya.Event.CLOSE, Laya.stage, pop);
}