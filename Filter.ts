
/**
 * 此文件为滤镜预设静态方法类
 *
 * @author D-Team viva
 * @date   2018/08/29
 */

export default class Filter {

    /**原色滤镜 */
    private static NormalColorFilter: number[] = [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
    ];

    /**变暗滤镜 */
    private static DarkColorFilter: number[] = [
        0.33, 0, 0, 0, 0,
        0, 0.33, 0, 0, 0,
        0, 0, 0.33, 0, 0,
        0, 0, 0, 1, 0
    ];

    /**变亮滤镜 */
    private static LightColorFilter: number[] = [
        1, 0.33, 0.33, 0, 0,
        0.33, 1, 0.33, 0, 0,
        0.33, 0.33, 1, 0, 0,
        0, 0, 0, 1, 0
    ];

    /**纯黑滤镜 */
    private static BlackColorFilter: number[] = [
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, 0, 0, 0, 0,
        0, 0, 0, 1, 0
    ];

    /**纯白滤镜 */
    private static WhiteColorFilter: number[] = [
        16, 16, 16, 0, 0,
        16, 16, 16, 0, 0,
        16, 16, 16, 0, 0,
        0, 0, 0, 1, 0
    ];

    /**红色滤镜 */
    private static RedColorFilter: number[] = [
        1, 0, 0, 0, 0,
        0, 0.33, 0, 0, 0,
        0, 0, 0.33, 0, 0,
        0, 0, 0, 1, 0
    ];

    /**绿色滤镜 */
    private static GreenColorFilter: number[] = [
        0.33, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 0.33, 0, 0,
        0, 0, 0, 1, 0
    ];

    /**蓝色滤镜 */
    private static BlueColorFilter: number[] = [
        0.33, 0, 0, 0, 0,
        0, 0.33, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
    ];

    /**黄色滤镜 */
    private static YellowColorFilter: number[] = [
        1, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 0.33, 0, 0,
        0, 0, 0, 1, 0
    ];

    /**青色滤镜 */
    private static YoungColorFilter: number[] = [
        0.33, 0, 0, 0, 0,
        0, 1, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
    ];

    /**紫色滤镜 */
    private static PurpleColorFilter: number[] = [
        1, 0, 0, 0, 0,
        0, 0.33, 0, 0, 0,
        0, 0, 1, 0, 0,
        0, 0, 0, 1, 0
    ];

    /**去色滤镜 */
    private static GrayColorFilter: number[] = [
        0.3086, 0.6094, 0.0820, 0, 0,
        0.3086, 0.6094, 0.0820, 0, 0,
        0.3086, 0.6094, 0.0820, 0, 0,
        0, 0, 0, 1, 0
    ];

    /**滤镜寄存器 */
    private static _filters: { [key: string]: any } = {};

    /**转换滤镜配置为唯一标签 */
    private static key(mat: number[]): string {
        let _key: string = mat.join('');
        if (_key.indexOf('.') > 0) {
            _key = _key.split('.').join('');
        }
        return _key;
    }

    /**模糊滤镜 */
    static blur(strength: number = 5): Laya.BlurFilter {
        var _blurFilter: Laya.BlurFilter = new Laya.BlurFilter();
        _blurFilter.strength = strength;
        return _blurFilter;
    }

    /** 按颜色创建滤镜
     * @param color 颜色值 #RRGGBB / #AARRGGBB
     */
    static color(color: string, added: number = 0): Laya.ColorFilter {
        let _len: number = color.length;
        let _val: number = parseInt(color.substr(1), 16);
        let _r: number, _g: number, _b: number, _a: number;
        if (_len > 7) {
            _a = _val >> 24 & 0xFF
            _r = _val >> 16 & 0xFF;
            _g = _val >> 8 & 0xFF;
            _b = _val & 0xFF;
        } else {
            _a = 0xFF;
            _r = _val >> 16 & 0xFF;
            _g = _val >> 8 & 0xFF;
            _b = _val & 0xFF;
        }
        _a /= 0xFF;
        _r /= 0xFF;
        _g /= 0xFF;
        _b /= 0xFF;

        let _mat: number[] = [
            _r + added, 0, 0, 0, 0,
            0, _g + added, 0, 0, 0,
            0, 0, _b + added, 0, 0,
            0, 0, 0, _a, 0
        ];
        return this.create(_mat);
    }

    /**创建滤镜 */
    static create(mat: number[]): Laya.ColorFilter {
        let _key: string = this.key(mat);
        if (this._filters[_key] === undefined) {
            this._filters[_key] = new Laya.ColorFilter(mat);
        }
        return this._filters[_key];
    }

    /**色相 */
    static hue(hue: number): Laya.ColorFilter {
        let _val: number = Math.min(180, Math.max(-180, hue)) / 180 * Math.PI;
        let _cos: number = Math.cos(_val);
        let _sin: number = Math.sin(_val);
        let _r: number = 0.213;
        let _g: number = 0.715;
        let _b: number = 0.072;
        let _hue: number[] = [
            _r + _cos * (1 - _r) + _sin * (-_r), _g + _cos * (-_g) + _sin * (-_g), _b + _cos * (-_b) + _sin * (1 - _b), 0, 0,
            _r + _cos * (-_r) + _sin * (0.143), _g + _cos * (1 - _g) + _sin * (0.140), _b + _cos * (-_b) + _sin * (-0.283), 0, 0,
            _r + _cos * (-_r) + _sin * (-(1 - _r)), _g + _cos * (-_g) + _sin * (_g), _b + _cos * (1 - _b) + _sin * (_b), 0, 0,
            0, 0, 0, 1, 0,
            0, 0, 0, 0, 1
        ];
        return this.create(_hue);
    }

    /**原色 */
    static get normal(): Laya.ColorFilter {
        return this.create(this.NormalColorFilter);
    }

    /**变暗 */
    static get dark(): Laya.ColorFilter {
        return this.create(this.DarkColorFilter);
    }

    /**变亮 */
    static get light(): Laya.ColorFilter {
        return this.create(this.LightColorFilter);
    }

    /**纯黑 */
    static black(alpha: number = 1): Laya.ColorFilter {
        let _black: number[] = [...this.BlackColorFilter];
        _black[18] = alpha;
        return this.create(_black);
    }

    /**纯白 */
    static white(alpha: number = 1): Laya.ColorFilter {
        let _white: number[] = [...this.WhiteColorFilter];
        _white[18] = alpha;
        return this.create(_white);
    }

    /**偏红 */
    static get red(): Laya.ColorFilter {
        return this.create(this.RedColorFilter);
    }

    /**偏绿 */
    static get green(): Laya.ColorFilter {
        return this.create(this.GreenColorFilter);
    }

    /**偏蓝 */
    static get blue(): Laya.ColorFilter {
        return this.create(this.BlueColorFilter);
    }

    /**偏黄 */
    static get yellow(): Laya.ColorFilter {
        return this.create(this.YellowColorFilter);
    }

    /**偏青 */
    static get young(): Laya.ColorFilter {
        return this.create(this.YoungColorFilter);
    }

    /**偏紫 */
    static get purple(): Laya.ColorFilter {
        return this.create(this.PurpleColorFilter);
    }

    /**去色 */
    static get gray(): Laya.ColorFilter {
        return this.create(this.GrayColorFilter);
    }

    /**边缘发光 */
    static glow(color: string = "#000000", blur: number = 3, x: number = 0, y: number = 0): Laya.GlowFilter {
        let _key: string = 'glow_' + color + blur + x + y;
        if (this._filters[_key]) return this._filters[_key];
        let _glow: Laya.GlowFilter = new Laya.GlowFilter(color, blur, x, y);
        this._filters[_key] = _glow;
        return _glow;
    }

    /**锁定本类不可外部实例化 */
    private constructor() { }

}