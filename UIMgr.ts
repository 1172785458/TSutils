import * as GUI from "../gui";
import * as GUIV2 from "../guiv2";

type UI = any | Laya.View | Laya.Sprite | Laya.Box | Laya.Dialog | Laya.Panel;
/** UI寄存器 */
let dialogs: { [key: string]: UI } = {};

/** 销毁无用对象池UI */
export function destroy(key: string) {
    let ui = dialogs[key];
    if (ui) {
        if (ui.popup) {
            ui.close();
            ui.onClosed = () => {
                dialogs[key].destroy();
                delete dialogs[key];
            };
        } else {
            dialogs[key].destroy();
            delete dialogs[key];
        }
    }
}

/** 获取对象池缓存UI
 * @param key 索引
 * @param args 实例化参数
 */
export function getUI(key: string, ...args: any[]): UI {
    if (!dialogs[key]) {
        if (GUI[key]) dialogs[key] = new GUI[key](...args);
        else if (GUIV2[key]) dialogs[key] = new GUIV2[key](...args);
        else console.log('没有找到相就的UI', key, args);
    }
    return dialogs[key];
}

/** 显示指定UI
 * @param key 索引
 * @param args 调用“reset”函数的参数
 * 注：如果弹窗对象存在 reset 函数时将自动处理函数
 */
export function showUI(key: string, ...args: any[]): UI {
    let ui = getUI(key);
    if (ui) {
        if (ui.popup) ui.popup();
        else Laya.stage.addChild(ui);
        let key = 'reset';
        ui[key] && ui[key](...args);
    }
    return ui;
}

/** 弹窗提示 */
export function showMsg(text: string, options?: {
    title?: string,//窗口标题
    enterCall?: Function,//确定按钮回调函数
    cancleCall?: Function,//取消按钮回调函数
    enterText?: string,//确定按钮文本
    cancleText?: string//取消按钮文本
}): Laya.Dialog {
    return showUI('MessageUI', text, options);
}