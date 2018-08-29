
/**冒泡提示动画列表 */
export class PopupList extends Laya.Sprite {

    /**
     * @author D-Team viva
     * @date   2018/08/29
     */

    /**显示列表 */
    private toList: Laya.Label[] = [];
    /**渐显结束点 */
    private toShow: number = -50;
    /**渐隐开始点 */
    private toHide: number = -100;
    /**渐隐结束点 */
    private toAlpha: number = -150;
    /**渐隐缩放动画 */
    private toScale: boolean = false;
    /**渐变速度值 */
    private toSpeed: number = 0.15;
    /**间隔距离 */
    private toInterval: number = 10;

    /**是否删除(如果被引用，可通过此值判断是否清除引用) */
    isRemove: boolean;

    /**添加冒泡显示文本框 */
    add(text: string, font?: string, size?: number, color?: string): PopupList {
        let _label: Laya.Label = new Laya.Label();
        _label.anchorX = _label.anchorY = 0.5;
        font && (_label.font = font);
        _label.fontSize = size || 24;
        _label.color = color || '#FFFF00';
        _label.text = text;
        _label.scale(0, 0);
        this.addChild(_label);
        this.toList.push(_label);
        return this;
    }

    /**刷新帧循环处理 */
    update(): void {
        if (this.isRemove) return;
        let _max: number = this.toList.length;
        if (_max == 0) return;
        let _i: number = _max - 1;
        while (_i >= 0) {
            let _label: Laya.Label = this.toList[_i];
            let _prev: Laya.Label = this.toList[_i + 1];
            if (_prev) {
                _label.y = Math.min(_label.y, _prev.y - _label.height / 2 - this.toInterval);
            }
            let _scale: number = _label.scaleX;
            if (_label.y > this.toShow) {
                if (_scale < 1) _scale += this.toSpeed;
                _label.y = this.toShow * _scale;
            } else if (_label.y > this.toHide) {
                _scale = 1;
                _label.y--;
            } else if (this.toScale) {
                if (_scale > 0) _scale -= this.toSpeed;
                _label.y = this.toHide + (this.toAlpha - this.toHide) * (1 - _scale);
            } else {
                _label.y--;
                _scale = 1 - Math.abs(_label.y - this.toHide) / Math.abs(this.toAlpha - this.toHide);
            }
            _label.alpha = _scale;
            if (this.toScale || !this.toScale && _label.y > this.toHide) {
                _label.scale(_scale, _scale);
            }
            _i--;
        }
        for (let _j in this.toList) {
            if (this.toList[_j].y <= this.toAlpha) {
                this.toList[_j].removeSelf().destroy();
                this.toList.splice(parseInt(_j), 1);
            }
        }
        _max = this.toList.length;
        if (_max == 0) {
            this.isRemove = true;
            this.removeSelf().destroy();
        }
    }

}