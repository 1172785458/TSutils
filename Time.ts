/** 格式化时间字符串
 * @param value     时间字符串/时间戳
 * @param format    字符串格式（字母表意：Y 年 M 月 D 日 h 时 m 分 s 秒）
                             （例1：Y/M/D h:m:s 输出 2018/9/14 9:25:5）
                             （例2：Y/MM/DD hh:mm:ss 输出 2018/09/14 09:25:05）
 */
export function formatTime(value: string | number, format: string = 'MM-DD hh:mm'): string {
    let n: number;
    if (typeof (value) == 'string') {
        n = parseInt(value);
        if (isNaN(n)) {
            n = new Date(value).getTime();
        }
    } else {
        n = value;
    }
    let d = new Date(n);
    let f = format.replace('Y', d.getFullYear().toString());
    if ((/MM/).test(f)) {
        let mm = d.getMonth();
        f = f.replace('MM', mm < 10 ? `0${mm}` : mm.toString());
    } else {
        f = f.replace('M', d.getMonth().toString());
    }
    if ((/DD/).test(f)) {
        let dd = d.getDate();
        f = f.replace('DD', dd < 10 ? `0${dd}` : dd.toString());
    } else {
        f = f.replace('D', d.getDate().toString());
    }
    if ((/hh/).test(f)) {
        let hh = d.getHours();
        f = f.replace('hh', hh < 10 ? `0${hh}` : hh.toString());
    } else {
        f = f.replace('h', d.getHours().toString());
    }
    if ((/mm/).test(f)) {
        let mm = d.getMinutes();
        f = f.replace('mm', mm < 10 ? `0${mm}` : mm.toString());
    } else {
        f = f.replace('m', d.getMinutes().toString());
    }
    if ((/ss/).test(f)) {
        let ss = d.getSeconds();
        f = f.replace('ss', ss < 10 ? `0${ss}` : ss.toString());
    } else {
        f = f.replace('s', d.getSeconds().toString());
    }
    return f;
}

/** 倒计时格式化时间戳
 * @param value     时间戳
 * @param format    字符串格式（字母表意：D 天 h 时 m 分 s 秒）
                             （例1：D天h时m分s秒 输出 4天9时25分5秒）
                             （例2：D天hh时mm分ss秒 输出 4天09时25分05秒）
 */
export function remainTime(value: number, format: string = 'hh:mm:ss'): string {
    let s = value / 1000;
    let m = Math.floor(s / 60);
    let h = Math.floor(m / 60);
    let d = Math.floor(h / 24);
    s = s % 60;
    m = m % 60;
    h = h % 24;
    let f = format.replace('D', d.toString());
    if ((/hh/).test(f)) {
        let hh = h;
        f = f.replace('hh', hh < 10 ? `0${hh}` : hh.toString());
    } else {
        f = f.replace('h', h.toString());
    }
    if ((/mm/).test(f)) {
        let mm = m;
        f = f.replace('mm', mm < 10 ? `0${mm}` : mm.toString());
    } else {
        f = f.replace('m', m.toString());
    }
    if ((/ss/).test(f)) {
        let ss = s;
        f = f.replace('ss', ss < 10 ? `0${ss}` : ss.toString());
    } else {
        f = f.replace('s', s.toString());
    }
    return f;
}