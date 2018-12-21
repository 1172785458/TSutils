
/**
 * LayaNative 不支持 document 系统将尝试使用反射机制调用 Android API实现功能
 *
 * 在 index.html 的 <body> 节点里添加引用
	<script src="clipboard.js"></script>
 */

/** 将 stage 全局坐标转换为屏幕坐标 */
function local2global(stageX: number, stageY: number): { x: number, y: number, rotate: boolean } {
    let W = window.innerWidth;
    let H = window.innerHeight;
    let P = new Laya.Point(stageX, stageY);
    let R = W < H; // 旋转了
    if (R) {
        let ws = H / Laya.stage.designWidth;
        let hs = W / Laya.stage.designHeight;
        let s = Math.min(ws, hs); // 最小缩放比例
        //
        let w = s * Laya.stage.designWidth;
        let h = s * Laya.stage.designHeight;
        let x = Math.round((W - h) / 2 + (h - (P.y * s)));
        let y = Math.round((H - w) / 2 + P.x * s);
        P.setTo(x, y);
    } else {
        let ws = W / Laya.stage.designWidth;
        let hs = H / Laya.stage.designHeight;
        let s = Math.min(ws, hs); // 最小缩放比例
        //
        let w = s * Laya.stage.designWidth;
        let h = s * Laya.stage.designHeight;
        let x = Math.round((W - w) / 2 + P.x * s);
        let y = Math.round((H - h) / 2 + P.y * s);
        P.setTo(x, y);
    }
    return { x: P.x, y: P.y, rotate: R };
}

/** 锁定div层在对象位置之上点击后隐藏 1 秒 */
export function lock(target: Laya.Sprite) {
    try {
        let p = target.localToGlobal(new Laya.Point(target.width / 2, target.height / 2));
        //
        let div: any = document.getElementById('clipboard');
        //定位
        let l2g = local2global(p.x, p.y);
        l2g.x -= target.width / 2;
        l2g.y -= target.height / 2;
        let w = l2g.rotate ? target.height : target.width;
        let h = l2g.rotate ? target.width : target.height;
        div.style = `position:absolute;left:${l2g.x}px;top:${l2g.y}px;width:${w}px;height:${h}px;`;
    } catch (e) {
        console.log(e);
    }
}

let clipboard: any;
let isLocked = false;
/** 初始化剪贴板创建div层 */
export function init(text: string, target: Laya.Sprite, callback: Function): void {
    try {
        let div: any = document.getElementById('clipboard');
        if (div) return;
        //
        div = document.createElement('div');
        div.zIndex = 888;
        div.innerHTML = ' ';
        div.setAttribute('id', 'clipboard');
        document.body.appendChild(div);
        //锁定对象位置
        lock(target);
        //设置复制文本
        div.setAttribute('data-clipboard-text', text);
        // @ts-ignore
        clipboard = new ClipboardJS(div);
        clipboard.on('success', (e: any) => {
            if (isLocked) return;
            isLocked = true;
            Laya.timer.once(1000, null, () => isLocked = false);
            console.log('clipboard success ' + e);
            callback();
        });
        clipboard.on('error', function (e: any) {
            console.log('clipboard error ' + e);
        });
    } catch (e) {
        console.log(e);
    }
}

/** 删除div层 */
export function destroy() {
    try {
        let div: any = document.getElementById('clipboard');
        if (div) {
            clipboard.destroy();
            document.body.removeChild(div);
        };
    } catch (e) {
        console.log(e);
    }
}

/************************************************************************************************** */
/** 反射LayaNative接口

targetsdkversion>=17时，需要加上@javascriptinterface，否则报错uncaught typeerror: object [object object] ...。该标记为4.2之后引入，所以target=android-17或更高以便引入高版本android.jar
1、如果仅target低于17则出现矛盾：目标版本需要引入javascriptinterface注解  然而低版本android.jar中又没有该类！js 无法运行 仍然报错uncaught typeerror: object [object object] has no method...
2、反之，如果仅targetsdkversion低于17，那么目标版本不用加@javascriptinterface，当然加上也行，因为当target>=17时的android.jar中有这个类
3、如果均低于17，不用加！当然了，没有这个类，想加也加不了

所以：targetsdkversion<>17是决定因素
targetsdkversion<17时不用加。此时如果target>=17,android.jar包中有这个类，随便加不加。如果target<17,加不了也不用加。
targetsdkversion>=17时必须加。此时如果target>=17,android.jar包中有这个类，可以加上。如果target<17,加不了，js 无法运行。
 */


/** 判断是手机端还是电脑端 */
function isIOS() {
    let conch: string = '';
    try {
        conch = Laya.Browser.window.conch.config.getOS();
    } catch (e) { }
    return conch.toLowerCase() === 'conch-ios';
}

function ClipBoard() {
    if (!clipBoard) {
        clipBoard = Laya.PlatformClass.createClass(isIOS() ? 'ClipBoard' : 'demo.ClipBoard');
    }
    return clipBoard;
}
let clipBoard: any;

export function set(text: string) {
    try {
        ClipBoard().callWithBack((b: boolean) => b, 'setText', text);
    } catch (e) {
        console.log(e);
    }
}

export function get(callback: (text: string) => void) {
    try {
        ClipBoard().callWithBack(callback, 'getText');
    } catch (e) {
        console.log(e);
    }
}
