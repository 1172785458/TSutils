import { saveAs } from "file-saver";
/** 本地文件保存
 * @param data      保存内容
 * @param filename  文件名
 * 注：使用 npm install file-saver 安装支持库才可使用
 */
export function SaveFile(data: any | string, filename: string): void {
    var f: File = new File([typeof (data) == 'string' ? data : JSON.stringify(data)], filename, { type: "text/plain;charset=utf-8" });
    saveAs(f);
}

/**
 * @author D-Team viva
 * @date   2018/10/12
 */

/**
* 本地临时数据存储，当浏览器关闭时自动清空。
*/
/**存储对象 */
let SessionStorage: any = Laya.Browser.window.sessionStorage;
/**存储数据KEY表 */
let SessionDictionary: { [key: string]: boolean } = {};
/**保存数据到存储对象 */
export function SetSession(key: string, data: any): void {
    SessionDictionary[key] = true;
    SessionStorage[key] = data;
}
/**从存储对象中获取数据 */
export function GetSession(key: string): any {
    return SessionStorage[key];
}
/**删除存储对象中指定KEY的数据，当 KEY 为 undefined 时清空所有存储数据 */
export function ClearSession(key?: string): void {
    if (key === undefined) {
        for (let _z in SessionDictionary) ClearSession(_z);
    } else {
        SessionStorage[key] = undefined;
        delete SessionStorage[key];
        delete SessionDictionary[key];
    }
}

/** 点 */
export type Point = { x: number, y: number }

/** 求两线段是否相交并求出交叉点位置
 * @param a 线段A第一个点
 * @param b 线段A第二个点
 * @param c 线段B第一个点
 * @param d 线段B第二个点
 * @return Point | false
 # 求线段ab和线段cd交点p #
    a    d
   A \  /
      \/p
      /\
   B /  \
    c    b
 */
export function CrossPoint(a: Point, b: Point, c: Point, d: Point): Point | false {
    // 三角形abc 面积的2倍
    let abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
    // 三角形abd 面积的2倍
    let abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);

    // 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,本例当作不相交处理);
    if ((abc * abd) >= 0) return false;

    // 三角形cda 面积的2倍
    let cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
    // 三角形cdb 面积的2倍
    // 注意: 这里有一个小优化.不需要再用公式计算面积,而是通过已知的三个面积加减得出.
    let cdb = cda + abc - abd;
    if ((cda * cdb) >= 0) return false;

    //计算交点坐标
    let t = cda / (abd - abc);
    let dx = t * (b.x - a.x);
    let dy = t * (b.y - a.y);
    return {
        x: a.x + dx,
        y: a.y + dy
    };
}

/** 连连看游戏的寻路算法并返回路径折点集
 * @param map 二维数组
 * @param a 点A位置
 * @param b 点B位置
 * @return Point[] | false
 # 求A点到B点的路径
    |－|－|－|－|－|－|－|
    |－|－|＃|口|口|Ａ|－|
    |－|％|＆|口|－|－|－|
    |－|－|－|口|％|－|－|
    |－|Ｂ|口|口|＃|＆|－|
    |－|－|－|－|－|－|－|
 */
export function LinkLine(map: number[][], a: Point, b: Point): Point[] | false {
    let av = map[a.x][a.y];
    let bv = map[b.x][b.y];
    map[a.x][a.y] = 0;
    map[b.x][b.y] = 0;
    //返回值
    let pt = [{ ...a }, { ...b }];
    //同行列
    if (a.x == b.x && LinkVertical(map, a.y, b.y, a.x)) return pt;
    if (a.y == b.y && LinkHorizontal(map, a.x, b.x, a.y)) return pt;
    //三点连
    if (LinkHorizontal(map, a.x, b.x, a.y) && LinkVertical(map, a.y, b.y, b.x)) {
        pt.splice(1, 0, { x: b.x, y: a.y });
        return pt;
    }
    if (LinkHorizontal(map, a.x, b.x, b.y) && LinkVertical(map, a.y, b.y, a.x)) {
        pt.splice(1, 0, { x: a.x, y: b.y });
        return pt;
    }
    //中四点
    let vn = a.x < b.x ? 1 : -1;
    let max = Math.abs(a.x - b.x);
    for (let i = 1; i < max; i++) {
        let x = a.x + vn * i;
        if (map[a.y][x] > 0) break;
        if (LinkVertical(map, a.y, b.y, x) && LinkHorizontal(map, b.x, x, b.y)) {
            pt.splice(1, 0, { x: x, y: a.y }, { x: x, y: b.y });
            return pt;
        }
    }
    vn = a.y < b.y ? 1 : -1;
    max = Math.abs(a.y - b.y);
    for (let i = 1; i < max; i++) {
        let y = a.y + vn * i;
        if (map[y][a.x] > 0) break;
        if (LinkHorizontal(map, a.x, b.x, y) && LinkVertical(map, b.y, y, b.x)) {
            pt.splice(1, 0, { x: a.x, y: y }, { x: b.x, y: y });
            return pt;
        }
    }
    //外四点
    vn = a.x < b.x ? 1 : -1;
    max = map[0].length;
    for (let i = 1; i < max; i++) {
        let x = a.x - vn * i;
        if (x < 0 || x >= max) break;
        else if (map[a.y][x] > 0) break;
        if (LinkVertical(map, a.y, b.y, x) && LinkHorizontal(map, b.x, x, b.y)) {
            pt.splice(1, 0, { x: x, y: a.y }, { x: x, y: b.y });
            return pt;
        }
    }
    for (let i = 1; i < max; i++) {
        let x = b.x + vn * i;
        if (x < 0 || x >= max) break;
        else if (map[b.y][x] > 0) break;
        if (LinkVertical(map, a.y, b.y, x) && LinkHorizontal(map, a.x, x, a.y)) {
            pt.splice(1, 0, { x: x, y: a.y }, { x: x, y: b.y });
            return pt;
        }
    }
    vn = a.y < b.y ? 1 : -1;
    max = map.length;
    for (let i = 1; i < max; i++) {
        let y = a.y - vn * i;
        if (y < 0 || y >= max) break;
        else if (map[y][a.x] > 0) break;
        if (LinkHorizontal(map, a.x, b.x, y) && LinkVertical(map, b.y, y, b.x)) {
            pt.splice(1, 0, { x: a.x, y: y }, { x: b.x, y: y });
            return pt;
        }
    }
    for (let i = 1; i < max; i++) {
        let y = b.y + vn * i;
        if (y < 0 || y >= max) break;
        else if (map[y][b.x] > 0) break;
        if (LinkHorizontal(map, a.x, b.x, y) && LinkVertical(map, a.y, y, a.x)) {
            pt.splice(1, 0, { x: a.x, y: y }, { x: b.x, y: y });
            return pt;
        }
    }
    //无效连
    map[a.x][a.y] = av;
    map[b.x][b.y] = bv;
    return false;
}
function LinkHorizontal(map: number[][], ax: number, bx: number, y: number): boolean {
    let n = ax < bx ? 1 : -1;
    let m = Math.abs(ax - bx);
    for (let i = 0; i <= m; i++) {
        let x = ax + n * i;
        if (map[y][x] > 0) return false;
    }
    return true;
}
function LinkVertical(map: number[][], ay: number, by: number, x: number): boolean {
    let n = ay < by ? 1 : -1;
    let m = Math.abs(ay - by);
    for (let i = 0; i <= m; i++) {
        let y = ay + n * i;
        if (map[y][x] > 0) return false;
    }
    return true;
}

/** 二维数组点路线转换为具体详细路线 */
export function Line2Point(ps: Point[]): Point[] {
    let pt: Point[] = [];
    let max = ps.length;
    for (let i = 1; i < max; i++) {
        let a = ps[i - 1];
        let b = ps[i];
        if (a.x == b.x) {
            let n = a.y < b.y ? 1 : -1;
            let m = Math.abs(a.y - b.y);
            for (let j = 0; j < m; j++) {
                let y = a.y + n * j;
                pt.push({ x: a.x, y: y });
            }
        } else {
            let n = a.x < b.x ? 1 : -1;
            let m = Math.abs(a.x - b.x);
            for (let j = 0; j < m; j++) {
                let x = a.x + n * j;
                pt.push({ x: x, y: a.y });
            }
        }
    }
    pt.push({ ...ps[max - 1] });
    return pt;
}

/** 转换以‘,’逗号隔开的字符串(只支持一维数据，不支持Object或数组) */
export function S2A<T>(s: string): T[] {
    if (s.length == 0) return [];
    let c = ',';
    let a = s.indexOf(c) >= 0 ? s.split(c) : [s];
    let d: any[] = [];
    a.forEach(t => {
        if (t == 'true' || t == 'false') {
            d.push(t);
            return;
        }
        let n = parseInt(t);
        if (isNaN(n)) {
            c = t.charAt(0);
            if (c == '"' || c == "'") {
                d.push(t);
            } else {
                d.push(`"${t}"`);
            }
        } else {
            d.push(t.indexOf('.') > 0 ? parseFloat(t) : parseInt(t));
        }
    });
    return JSON.parse(`[${d.toString()}]`);
}

/** 排序数据(默认：由小到大)
 * @param mode  排序方式 （a: 升序 | d: 降序 | r: 随机）
 * @param prop  排序依据属性名
 */
export function Sort(mode: SortMode = SortEnum.A, prop?: string | number) {
    return function (a: any, b: any): number {
        if (mode == SortEnum.D) {
            if (prop == undefined) return b - a;
            return b[prop] - a[prop];
        } else if (mode == SortEnum.R) {
            return Math.floor(Math.random() * 3) - 1;
        }
        if (prop == undefined) return a - b;
        return a[prop] - b[prop];
    }
}
export type SortMode = 'a' | 'd' | 'r';
export enum SortEnum { A = 'a', D = 'd', R = 'r' }

/** 判断是否公式 */
export function Formula(data: string | number): boolean {
    if (typeof data === 'number') return false;
    return (/[\+\*\-\^]+/).test(data);
}

/** 返回公式计算值
 * @param props   公式属性值配置
 * @param formula 算术公式或纯数值
 */
export function Expression(props: { [key: string]: any }, formula: string | number): number {
    if (typeof (formula) == 'number') {
        return formula;
    }
    if (Formula(formula)) {
        let v: any[] = [];
        let a: string[] = [];
        for (let prop in props) {
            a.push(prop);
            v.push(props[prop]);
        }
        let expression = new Function(...a, 'return ' + formula);
        return expression(...v);
    }
    return formula.indexOf('.') > 0 ? parseFloat(formula) : parseInt(formula);
}

/** 类似c#中的 console.write  用法是
 * Replace("name:{0}  age:{1}","小李",14)
 * 得到的结果是
 * "name:小李  age:14"
*/
export function Replace(data: string, ...params: any[]) {
    params.forEach((value, key) => {
        data = data.replace(`{${key}}`, value);
    });
    return data;
}

/** 获取随机范围内的一个值 */
export function Random(min: number, max: number, toMath: Function = Math.round): number {
    let n = max - min;
    let r = Math.random() * n;
    n = min + toMath(r);
    return n;
}

/** 复一个数据 */
export function Clone<T>(data: T): T {
    let d = JSON.stringify(data);
    return JSON.parse(d);
}

/** 返回浏览器类型 */
export function Browser(): BrowerType {
    let ua = navigator.userAgent.toLocaleLowerCase();
    let io = ua.indexOf;
    let bt: BrowerType = null;
    if (io("msie") >= 0 || io("trident") >= 0) bt = "ie"; // browserVersion = ua.match(/msie ([\d.]+)/) >=0 ? ua.match(/msie ([\d.]+)/)[1] : ua.match(/rv:([\d.]+)/)[1];
    else if (io("firefox") >= 0) bt = "firefox";
    else if (io("ubrowser") >= 0) bt = "uc";
    else if (io("opera") >= 0) bt = "opera";
    else if (io("bidubrowser") >= 0) bt = "baidu";
    else if (io("metasr") >= 0) bt = "sogo";
    else if (io("tencenttraveler") >= 0 || io("qqbrowse") >= 0) bt = "qq";
    else if (io("maxthon") >= 0) bt = "maxthon";
    else if (io("chrome") >= 0) bt = Brower360("type", "application/vnd.chromium.remoting-viewer") ? '360' : "chrome";
    else if (io("safari") >= 0) bt = "safari";
    return bt;
}
function Brower360(option: any, value: any): boolean {
    let mt = navigator.mimeTypes;
    for (let p in mt) { if (mt[p][option] == value) return true; }
    return false;
}
type BrowerType = null | "ie" | "firefox" | "uc" | "360" | "baidu" | "chrome" | "safari" | "qq" | "baidu" | "sogo" | "opera" | "maxthon";

/** 限制输入文本框数值位数（包括小数点后的位置）
 * @param text : string     数值字符串
 * @param max : number      最大值
 * @param decimal : boolean  带小数
 */
export function NumberInputReturn(text: string, max: number, decimal?: boolean): string {
    let l = text.length;
    if (l == 0) return text;
    let i = l - 1;
    if (decimal && text.charAt(i) == '.') return text;
    let n = decimal ? parseFloat(text) : parseInt(text);
    if (n > max) n = decimal ? (max + n % 1) : max;
    return n.toString();
}

/** 载入ttf字体
 * @param fontName 注册字体名称
 * @param url ttf字体文件的路径
 * @param deadText 如果是在browser下的WEBGL模式，这个字符将不能再用ttf字体打印显示出来，SO请设置一个生僻字吧！
 * 注：调用前必须初始化LAYA, 在第一屏加载中对TTF字体进行缓存加载，第一屏加载完成后再进行此方法的调用，确保TTF字体已处理可使用状态。
 */
export function LoadTTF(url: string, fontName: string = 'TTF', deadText: string = "氇"): void {
    //LayaNative
    if (window["conch"]) {
        let ttf: ArrayBuffer = Laya.loader.getRes(url);
        window["conch"].setFontFaceFromBuffer(fontName, ttf);
    }
    //standard H5
    else {
        let c = `@font-face { font-family: ${fontName}; src: url(${url}) format('truetype'); }`;
        let s = document.createElement('style');
        s.type = 'text/css';
        s.innerHTML = c;
        document.head.appendChild(s);
        //缓存激活TTF字体
        let t = new Laya.Text();
        t.font = fontName;
        t.text = deadText;
        t.fontSize = 1;
        t.pos(-1, -1);
        Laya.stage.addChild(t);
    }
}

/** 格式化时间字符串
 * @param value     时间字符串/时间戳
 * @param format    字符串格式（字母表意：Y 年 M 月 D 日 h 时 m 分 s 秒）
                             （例1：Y/M/D h:m:s 输出 2018/9/14 9:25:5）
                             （例2：Y/MM/DD hh:mm:ss 输出 2018/09/14 09:25:05）
 */
export function FormatTime(value: string | number, format: string = 'MM-DD hh:mm'): string {
    let n: number;
    if (typeof (value) == 'string') {
        n = parseInt(value);
        if (isNaN(n)) n = new Date(value).getTime();
    } else n = value;
    let d = new Date(n);
    let t = format.replace('Y', d.getFullYear().toString());
    t = ReplaceTime(/MM/, t, 'M', d.getMonth());
    t = ReplaceTime(/DD/, t, 'D', d.getDate());
    t = ReplaceTime(/hh/, t, 'h', d.getHours());
    t = ReplaceTime(/mm/, t, 'm', d.getMinutes());
    t = ReplaceTime(/ss/, t, 's', d.getSeconds());
    return t;
}
function ReplaceTime(reg: RegExp, str: string, rep: string, val: number): string {
    if (reg.test(str)) return str.replace(reg, val < 10 ? `0${val}` : val.toString());
    return str.replace(rep, val.toString());
}

/** 倒计时格式化时间戳
 * @param value     时间戳
 * @param format    字符串格式（字母表意：D 天 h 时 m 分 s 秒）
                             （例1：D天h时m分s秒 输出 4天9时25分5秒）
                             （例2：D天hh时mm分ss秒 输出 4天09时25分05秒）
 */
export function RemainTime(value: number, format: string = 'hh:mm:ss'): string {
    let s = Math.floor(value / 1000);
    let m = Math.floor(s / 60);
    let h = Math.floor(m / 60);
    let d = Math.floor(h / 24);
    s = s % 60;
    m = m % 60;
    h = h % 24;
    let t = format.replace('D', d.toString());
    t = ReplaceTime(/hh/, t, 'h', h);
    t = ReplaceTime(/mm/, t, 'm', m);
    t = ReplaceTime(/ss/, t, 's', s);
    return t;
}

/**随机数种子
 * seed 的值不变得出的随机值也不变，所以值入指定的 seed 值就能得到指定的随机值了。
 */
export function RandomSeed(seed: number = 8, min?: number, max?: number): number {
    let m = max || 1;
    let n = min || 0;
    let s = (seed * 9301 + 49297) % 233280;
    let r = s / 233280;
    return n + r * (m - n);
}

/** 求坐标点 a 指向坐标点 b 的移动偏移量 */
export function Offset(ax: number, ay: number, bx: number, by: number): Point {
    let r = Math.atan2(by - ay, bx - ax);
    let x = Math.cos(r);
    let y = Math.sin(r);
    return { x: x, y: y };
}
export function OffsetBy(a: Point, b: Point): Point {
    return Offset(a.x, a.y, b.x, b.y);
}

/** 求水平翻转情况下点 a 指向点 b 的旋转角度值 */
export function Rotation(ax: number, ay: number, bx: number, by: number, flip?: boolean): number {
    let f = flip ? -1 : 1;
    let r = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
    return (f == 1 ? r : -(180 % r)) * f;
}
export function RotationBy(a: Point, b: Point, flip?: boolean): number {
    return Rotation(a.x, a.y, b.x, b.y, flip);
}