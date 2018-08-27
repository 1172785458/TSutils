export class PopupLabel extends Laya.Label {
    constructor(value?: string, font?: string) {
        super();
        this.anchorX = 0.5;
        this.anchorY = 0.5;
        if (value) this.setText(value, font);
    }

    setText(value: string, font?: string) {
        this.changeText(value);
        if (font)
            this.font = font;
        else {
            this.font = "TTF";
            this.fontSize = 30;
            this.color = '#FFFFFF';
            this.bold = true;
            this.stroke = 2;
            this.strokeColor = '#333333';
        }
    }

    show(x: number, y: number, scale: number = 1, ease: string = "ease1", easeScale: number = 1) {
        this.scale(scale, scale);
        this.alpha = 1;
        this.pos(x, y);
        this[ease](easeScale);
    }

    protected onRemove() {
        this.removeSelf();
    }
    /** 上飘渐现渐隐 */
    private ease1(easeScale) {
        this.alpha = 1;
        Laya.Tween.to(this, { alpha: 0 }, 500, Laya.Ease.sineIn, undefined, 500);
        Laya.Tween.to(this, { y: this.y - 80 * easeScale }, 1000, Laya.Ease.sineOut,
            Laya.Handler.create(this, this.onRemove));
    }
    /** 上飘渐现，上飘渐隐 */
    private ease2(easeScale) {
        this.alpha = 0;
        Laya.Tween.to(this, { alpha: 1 }, 300, Laya.Ease.sineOut);
        Laya.Tween.to(this, { alpha: 0 }, 500, Laya.Ease.sineIn, undefined, 1000);
        Laya.Tween.to(this, { y: this.y - 50 * easeScale }, 500, Laya.Ease.sineOut);
        Laya.Tween.to(this, { y: this.y - 100 * easeScale }, 500, Laya.Ease.sineIn,
            Laya.Handler.create(this, this.onRemove), 1000);
    }
    /** 放大左右抛物线 */
    private ease3(easeScale) {
        this.alpha = 1;
        this.scale(0, 0);
        Laya.Tween.to(this, { scaleX: easeScale, scaleY: easeScale }, 500, Laya.Ease.sineOut);
        Laya.Tween.to(this, { alpha: 0 }, 500, Laya.Ease.sineIn, undefined, 500);
        Laya.Tween.to(this, { x: this.x + (Math.random() > 0.5 ? 1 : -1) * 100 }, 1000, Laya.Ease.linearNone);
        Laya.Tween.to(this, { y: this.y - 80 * easeScale }, 500, Laya.Ease.sineOut)
        Laya.Tween.to(this, { y: this.y - 0 * easeScale }, 500, Laya.Ease.sineIn,
            Laya.Handler.create(this, this.onRemove), 500);
    }
    /** 上飘放大，上飘渐隐 */
    private ease4(easeScale) {
        this.scale(0, 0);
        Laya.Tween.to(this, { scaleX: easeScale, scaleY: easeScale }, 300, Laya.Ease.sineOut);
        Laya.Tween.to(this, { alpha: 0 }, 500, Laya.Ease.sineIn, undefined, 1000);
        Laya.Tween.to(this, { y: this.y - 50 * easeScale }, 300, Laya.Ease.sineOut);
        Laya.Tween.to(this, { y: this.y - 100 * easeScale }, 500, Laya.Ease.sineIn,
            Laya.Handler.create(this, this.onRemove), 1000);
    }
}