
/** 将文本切割为一维数组并替换表情符号为图片路径
 * @param text          文本内容
 * @param format        表情符格式 （默认 #*   *号为数值替换符）
 * @param emojiPath     表情包文件路径
 * @param emojiMax      表情包文件总数
 */
function toArray(text: string, format: string, emojiPath: string, emojiMax: number): string[] {
    // 解释出每个字和表情符号
    let a: string[] = [];
    let i = 0;
    let max = text.length;
    let fc = format.charAt(0);
    while (i < max) {
        let c = text.charAt(i);
        if (c === fc) {
            for (let j = emojiMax; j >= 0; j--) {
                let f = format.replace('*', `${j}`);
                let l = f.length;
                let s = text.substr(i, l);
                if (f === s) {
                    a.push(`${emojiPath}${j}.png`);
                    i += l - 1;
                    break;
                }
            }
        } else {
            a.push(c);
        }
        i++;
    }
    return a;
}

/** 创建位图字体富文本
 * @param font          位图字体文件名
 * @param text          文本内容
 * @param width         限制宽度（自动换行）
 * @param emojiPath     表情包文件路径
 * @param emojiMax      表情包文件总数
 * @param format        表情符格式 （默认 #*   *号为数值替换符）
 * @param leading       行距值 （默认 0）
 * 注：只支持位图字体&表情符号，不支持颜色，加粗，下划线，斜体之类的富文本格式。
 *    表情包图片只支持PNG格式的，图片文件名为从0开始的升序数值。
 */
export function bitmapFont(font: string, text: string, width: number, emojiPath: string = '', emojiMax: number = 0, format: string = '#*', leading: number = 0): Laya.Sprite {
    // 计算布局
    let ta: { x: number, y: number, t: Laya.Texture }[] = [];
    let bf = Laya.loader.getRes(`font/${font}.fnt`);
    let sp = new Laya.Sprite();
    let sx = 0;
    let ew = 0;
    let y = 0;
    let h = 0;
    let a = toArray(text, format, emojiPath, emojiMax);
    a.forEach(c => {
        let t = c.length > 1 ? Laya.loader.getRes(c) : bf.getCharTexture(c);
        if (!t) {
            console.log('unfind', c);
            t = bf.getCharTexture('?');
            if (!t) return;
        }
        let x = sx;
        sx += t.sourceWidth;
        if (sx > width) {
            for (let z in ta) {
                let o = ta[z];
                if (o.y === y) {
                    o.y += Math.floor((h - o.t.sourceHeight) / 2);
                }
            }
            x = 0;
            sx = t.sourceWidth;
            y += leading + (h || t.sourceHeight);
            h = t.sourceHeight;
        } else {
            h = Math.max(h, t.sourceHeight);
            ew = Math.max(ew, sx);
        }
        ta.push({ t, x, y });
    });
    // 绘制布局
    for (let z in ta) {
        let o = ta[z];
        if (o.y === y) {
            o.y += Math.floor((h - o.t.sourceHeight) / 2);
        }
        sp.graphics.drawTexture(o.t, o.x, o.y, o.t.sourceWidth, o.t.sourceHeight);
        delete ta[z];
    }
    sp.width = ew;
    sp.height = y + h;
    return sp;
}

/** 文本样式 */
interface Style {
    font?: string;
    size?: number;
    color?: string;
    bold?: boolean;
    underline?: boolean;
}

/** regexp 的定义为 序号区间 （如：0-3 头4个字，1-2 第2个和第3个字 ） */
export type RegExpStyle = { [regexp: string]: Style } | undefined;

function charLabel(style: RegExpStyle, char: string, index: number): Laya.Label {
    let t = new Laya.Label();
    t.font = 'SimHei';
    t.fontSize = 24;
    t.color = '#FFF';
    if (style) {
        for (let key in style) {
            let a = key.split('-').map(s => parseInt(s));
            if (a[0] <= index && index <= a[1]) {
                for (let z in style[key]) {
                    t[z] = style[key][z];
                }
            }
        }
    }
    t.size(0, 0);
    t.text = char;
    return t;
}

/** 创建文本层富文本
 * @param style         文本层样式表（ 如 style['1-3']={color:'#F00'}; 表现文本内容第2个到第4个字的颜色为红色 ）
 * @param text          文本内容
 * @param width         限制宽度（自动换行）
 * @param emojiPath     表情包文件路径
 * @param emojiMax      表情包文件总数
 * @param format        表情符格式 （默认 #*   *号为数值替换符）
 * @param leading       行距值 （默认 0）
 * 注：文本层样式表的使用中，同区间的字被多次定义会后者被复盖
 */
export function labelFont(style: RegExpStyle, text: string, width: number, emojiPath: string = '', emojiMax: number = 0, format: string = '#*', leading: number = 0): Laya.Sprite {
    // 计算布局
    let ta: { x: number, y: number, t: Laya.Texture | Laya.Label }[] = [];
    let sp = new Laya.Sprite();
    let sx = 0;
    let ew = 0;
    let y = 0;
    let h = 0;
    let a = toArray(text, format, emojiPath, emojiMax);
    a.forEach((c, i) => {
        let t: Laya.Texture | Laya.Label = c.length > 1 ? Laya.loader.getRes(c) : charLabel(style, c, i);
        if (!t) {
            console.log('unfind texture', c);
            t = charLabel(style, '?', i);
        }
        let tw = t instanceof Laya.Texture ? t.sourceWidth : t.width;
        let th = t instanceof Laya.Texture ? t.sourceHeight : t.height;
        let x = sx;
        sx += tw;
        if (sx > width) {
            for (let z in ta) {
                let o = ta[z];
                if (o.y === y) {
                    let hh = o.t instanceof Laya.Texture ? o.t.sourceHeight : o.t.height;
                    o.y += Math.floor((h - hh) / 2);
                }
            }
            x = 0;
            sx = tw;
            y += leading + (h || th);
            h = th;
        } else {
            h = Math.max(h, th);
            ew = Math.max(ew, sx);
        }
        ta.push({ t, x, y });
    });
    // 绘制布局
    for (let z in ta) {
        let o = ta[z];
        let t = o.t;
        if (o.y === y) {
            let hh = t instanceof Laya.Texture ? t.sourceHeight : t.height;
            o.y += Math.floor((h - hh) / 2);
        }
        if (t instanceof Laya.Texture) {
            let tw = t.sourceWidth;
            let th = t.sourceHeight;
            sp.graphics.drawTexture(t, o.x, o.y, tw, th);
        } else {
            t.pos(o.x, o.y);
            sp.addChild(t);
        }
        delete ta[z];
    }
    sp.width = ew;
    sp.height = y + h;
    sp.cacheAs = 'normal';
    return sp;
}