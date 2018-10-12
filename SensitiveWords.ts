/** Sensitive Words */
export default class SensitiveWords {

    /** 预加载屏蔽词库 */
    private static _words: string[];
    private static get words(): string[] {
        if (!this._words) {
            this._words = [];
            let _url = 'json/shieldingwords.json';
            Laya.loader.load(_url, Laya.Handler.create(this, () => {
                this._words = Laya.loader.getRes(_url).words.split(',');
            }), undefined, Laya.Loader.JSON);
        }
        return this._words;
    }

    /** 检测字符串里是否有敏感词汇 */
    static has(s: string): boolean {
        if (this.words.indexOf(s) >= 0) return true;
        return false;
    }

    /** 过滤屏蔽词 */
    static filter(text: string, replace: string = '*'): string {
        let len = text.length;
        let siz = 2;
        while (siz <= len) {
            let max = len - siz;
            for (let i = 0; i <= max; i++) {
                let chr = text.substr(i, siz);
                if (this.has(chr)) {
                    let rep = new Array(siz + 1).join(replace);
                    text = text.replace(chr, rep);
                }
            }
            siz++;
        }
        return text;
    }

    /** 判断字符串长度（全角2，半角1） */
    static maxChars(s: string, limit: number = 9): boolean {
        let len = 0;
        let max = s.length;
        for (let i = 0; i < max; i++) {
            if (s.charAt(i).match(/[^\x00-\xff]/ig)) {//全角
                len += 2; //如果是全角，占用两个字节
            } else {
                len += 1; //半角占用一个字节
            }
        }
        return len < limit;
    }

    /** 获得一个随机名字 */
    private static _full = ('赵钱孙李周吴郑王冯陈张孔曹葛奚薛雷褚卫蒋沈韩杨朱秦尤许何吕施严华金魏陶姜戚谢邹喻柏水窦章云苏潘范彭郎鲁昌马苗凤花方俞任袁柳酆鲍史唐费廉岑倪汤滕殷罗毕郝邬安常乐于时傅皮卞齐元卜顾孟平黄和穆萧尹欧阳贺韦康伍余慕容').split('');
    private static _name = ('子璇淼国栋夫瑞堂甜敏尚贤贺祥晨涛昊轩易益辰帆冉瑾春昆齐杨文东雄霖浩熙涵溶冰枫欣宜豪慧建政美淑杰源忠林榕润汝嘉新亦菲洁佳禹淳泽惠伟洋越丽翔华晶莹凌苒溪雨怡毅琪紫昕蕊萌明远茜璐运鑫君滢莎汕钰玉晓庆一鸣语添池雅晗清妍诗悦乐天赫玥傲若柔津咏兴').split('');
    static get randomName(): string {
        let i = Math.floor(Math.random() * this._full.length);
        let s = this._full[i];
        let max = 1 + (Math.floor(Math.random() * 99) % 3);
        while (max > 0) {
            i = Math.floor(Math.random() * this._name.length);
            s += this._name[i];
            max--;
        }
        return s;
    }

}