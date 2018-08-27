
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

/** 返回公式计算值 */
export function Expression(props: any, formula: string | number): number {
    if (typeof (formula) == 'number') return formula;
    if (Formula(formula)) {
        let value: any[] = [];
        let key: string[] = [];
        for (let prop in props) {
            key.push(prop);
            value.push(props[prop]);
        }
        let expression = new Function(...key, 'return ' + formula);
        return expression(...value);
    }
    return formula.indexOf('.') > 0 ? parseFloat(formula) : parseInt(formula);
}

/** 获取随机范围内的一个值 */
export function Random(min: number, max: number, int?: boolean): number {
    let value = max - min;
    let rand = Math.random() * value;
    value = min + (int ? Math.floor(rand) : rand);
    return value;
}

/** 复一个数据 */
export function Clone(data: any): any {
    let json = JSON.stringify(data);
    return JSON.parse(json);
}

/** 毫秒转时间字符串（HH:MM:SS） */
export function Clock(time: number, notHour: boolean = false, space: string = ':'): string {
    let s = Math.floor(time / 1000);
    let m = Math.floor(s / 60);
    let h = Math.floor(m / 60);
    let st = (s % 60).toString();
    let z = '0';
    if (st.length < 2) st = z + st;
    let _mt = (m % 60).toString();
    if (_mt.length < 2) _mt = z + _mt;
    let _ht = (h % 60).toString();
    if (_ht.length < 2) _ht = z + _ht;
    return notHour ? `${_mt}${space}${st}` : `${_ht}${space}${_mt}${space}${st}`;
}

/** 倒计时间字符串 */
export function Countdown(time: number, format: string = "D天H时M分S秒") {
    let s = Math.max(0, time / 1000);
    let d = Math.floor(s / 24 / 3600);
    let h = Math.floor(s / 3600 % 24);
    let m = Math.floor(s / 60 % 60);
    s = Math.floor(s % 60);
    let f = format.replace(/D/, d.toString());
    f = f.replace(/H/, h.toString());
    f = f.replace(/M/, m.toString());
    f = f.replace(/S/, s.toString());
    return f;
}

/** 求坐标点 a 指向坐标点 b 的移动偏移量 */
export function Mobility(ax: number, ay: number, bx: number, by: number): Laya.Point {
    let r = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
    return MobilityBy(r);
}

/** 求指定角度的移动偏移量 */
export function MobilityBy(rotation: number): Laya.Point {
    let r = rotation * Math.PI / 180;
    let x = Math.cos(r);
    let y = Math.sin(r);
    return new Laya.Point(x, y);
}

/** 求水平翻转情况下点 a 指向点 b 的旋转角度值 */
export function Rotation(ax: number, ay: number, bx: number, by: number, flip?: boolean): number {
    let f = flip ? -1 : 1;
    let r = Math.atan2(by - ay, bx - ax) * 180 / Math.PI;
    return (f == 1 ? r : -(180 % r)) * f;
}

/** 求水平翻转情况下对象 a 指向对象 b 的旋转角度值 */
export function RotationBy(a: XY, b: XY, flip?: boolean): number {
    return Rotation(a.x, a.y, b.x, b.y, flip);
}
export interface XY { x: number, y: number }

/**随机数种子
 * seed 的值不变得出的随机值也不变，所以值入指定的 seed 值就能得到指定的随机值了。
 */
export function RandomSeed(seed: number = 8, min?: number, max?: number): number {
    let m = max || 1;
    let n = min || 0;
    let s = (seed * 9301 + 49297) % 233280;
    var r = s / 233280;
    return n + r * (m - n);
}

/**判断指定点是否在指定矩形范围内 */
export function HitTest(x: number, y: number, rect: Laya.Rectangle): boolean {
    if (x < rect.x || y < rect.y) return false;
    let n = rect.x + rect.width;
    if (x > n) return false;
    n = rect.y + rect.height;
    if (y > n) return false;
    return true;
}

/**获取区间值中任意一个值 */
export function Range(data: string, space: string = '-', float?: boolean): number {
    let f = float ? parseFloat : parseInt;
    if (data.indexOf(space) > 0) {
        let a = data.split(space);
        return f(a[0]) + Math.floor(Math.random() * (f(a[1]) + 1 - f(a[0])));
    }
    return f(data);
}
