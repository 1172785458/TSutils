
/** 图表配置数据 */
export type Point = {
    /** 比例值 */scale: number
    /** 外文本 */label: string
    /** 内文本 */text: string
}

/** 文本样式 */
type Style = {
    /** 字体 */font: string
    /** 颜色 */color: string
    /** 字号 */size: number
}

/** 绘制多边形图表 */
export default class PolygonView extends Laya.Sprite {

    /**
     * @author D-Team viva
     * @date   2018/08/30
     */

    /** 外文本 */
    private labelShow: boolean;
    private labelStyle: Style;
    private labelList: Laya.Label[];
    /** 内文本 */
    private textShow: boolean;
    private textStyle: Style;
    private textList: Laya.Label[];
    /** 圆心 */
    private circleDot: Laya.Point;
    /** 圆半径 */
    private circleRadius!: number;
    /** 圆旋转角度 */
    private circleRotation: number;
    /** 记录配置数据 */
    private drawData!: Point[];
    /** 绘制点集 */
    private shapePoints!: number[];
    private scalePoints!: number[];
    /** 绘制限制 */
    private shapeFillShow: boolean;
    private shapePointShow: boolean;
    private shapeMaskLineShow: boolean;
    private polygonLineShow: boolean;
    private fillLineShow: boolean;
    /** 绘制背景 */
    private circleQuality: number;
    private circleFillColor?: string;
    private circleLineColor?: string;
    private circleLineWidth?: number;
    /** 绘制配色 */
    private shapeFillColor: string;
    private shapeFillLineColor: string;
    private shapeFillLineWidth: number;
    private shapeMaskLineColor: string;
    private shapeMaskLineWidth: number;
    private polygonLineColor: string;
    private polygonLineWidth: number;
    /** 提示点样式 */
    private shapePointRadius: number;
    private shapePointColor: string;
    private shapePointXY?: number[];
    private scalePointXY?: number[];

    /** 绘制多边形图表
     * @param radius 图表半径
     * @param pnts   配置数据列表
     */
    constructor(radius: number, pnts?: Point[]) {
        super();

        this.mouseEnabled = false;
        this.mouseThrough = true;

        this.labelShow =
            this.textShow = true;

        this.labelStyle = { font: 'simhei', color: '#FFFFFF', size: 24 };
        this.textStyle = { ...this.labelStyle };

        this.labelList = [];
        this.textList = [];

        this.circleDot = new Laya.Point(0, 0);

        this.circleRotation = 0;

        this.shapeFillShow =
            this.polygonLineShow =
            this.shapePointShow =
            this.fillLineShow =
            this.shapeMaskLineShow = true;

        this.circleQuality = 360;
        this.circleFillColor = '#EEEEEE';
        this.circleLineColor = '#CCCCCC';
        this.circleLineWidth = 1;

        this.shapeFillColor = '#0099FF';
        this.shapeFillLineColor = '#0000FF';
        this.shapeFillLineWidth = 1;
        this.polygonLineColor = '#0000FF';
        this.polygonLineWidth = 1;
        this.shapeMaskLineColor = '#CCCCCC';
        this.shapeMaskLineWidth = 1;

        this.shapePointRadius = 4;
        this.shapePointColor = '#33CC33';

        pnts ? this.reset(pnts, this.radius) : (this.circleRadius = radius);
    }

    /** 销毁处理 */
    destroy(): void {
        if (this.destroyed) return;
        this.labelList.forEach(label => label.destroy());
        this.textList.forEach(label => label.destroy());
        this.labelList.length = 0;
        this.textList.length = 0;
        this.shapePoints.length = 0;
        if (this.shapePointXY) {
            this.shapePointXY.length = 0;
            delete this.shapePointXY;
        }
        if (this.scalePointXY) {
            this.scalePointXY.length = 0;
            delete this.scalePointXY;
        }
        delete this.labelStyle;
        delete this.labelList;
        delete this.textStyle;
        delete this.textList;
        delete this.circleDot;
        delete this.shapePoints;
        super.destroy();
    }

    /** 设置圆点位置 */
    setCircleDot(x: number, y?: number): PolygonView {
        let ox = x - this.circleDot.x;
        let oy = y === undefined ? 0 : y - this.circleDot.y;
        this.circleDot.x = x;
        if (y !== undefined) {
            this.circleDot.y = y;
        }
        this.labelList.forEach(label => {
            label.x += ox;
            label.y += oy;
        });
        this.textList.forEach(label => {
            label.x += ox;
            label.y += oy;
        });
        this.redraw();
        return this;
    }

    /** 设置圆旋转角度 */
    setRotation(rotation: number): PolygonView {
        this.circleRotation = rotation;
        this.reset(this.drawData);
        return this;
    }

    /** 设置图表半径 */
    get radius(): number { return this.circleRadius; }
    set radius(radius: number) { this.reset(this.drawData, radius); }

    /** 获取图表数据 */
    get data(): Point[] { return this.drawData; }
    set data(data: Point[]) { this.reset(data); }

    /** 获取提示点位置列表 */
    get labelPoint(): number[] {
        if (this.shapePointXY) return this.shapePointXY;
        let pnts: number[] = [];
        let lps = this.scalePoints;
        lps.forEach((_, i: number) => {
            if (i % 2 == 1) return;
            pnts.push(this.circleDot.x + lps[i], this.circleDot.y + lps[i + 1]);
        });
        this.shapePointXY = pnts;
        return pnts;
    }
    /** 外层文本字体 */
    get labelFont(): string { return this.labelStyle.font; }
    set labelFont(font: string) {
        this.labelStyle.font = font;
        this.setLabelStyle(this.labelStyle);
    }
    /** 外层文本颜色 */
    get labelColor(): string { return this.labelStyle.color; }
    set labelColor(color: string) {
        this.labelStyle.color = color;
        this.setLabelStyle(this.labelStyle);
    }
    /** 外层文本字号 */
    get labelSize(): number { return this.labelStyle.size; }
    set labelSize(size: number) {
        this.labelStyle.size = size;
        this.setLabelStyle(this.labelStyle);
    }
    /** 设置外层文本样式 */
    setLabelStyle(style: Style): PolygonView {
        this.labelStyle = style;
        this.labelList.forEach(label => {
            label.font = style.font;
            label.color = style.color;
            label.fontSize = style.size;
        });
        return this;
    }
    /** 显示隐藏外层文本 */
    showLabel(show: boolean): PolygonView {
        this.labelList.forEach(label => label.visible = show);
        this.labelShow = show;
        return this;
    }

    /** 内层文本字体 */
    get textFont(): string { return this.textStyle.font; }
    set textFont(font: string) {
        this.textStyle.font = font;
        this.setTextStyle(this.textStyle);
    }
    /** 内层文本颜色 */
    get textColor(): string { return this.textStyle.color; }
    set textColor(color: string) {
        this.textStyle.color = color;
        this.setTextStyle(this.textStyle);
    }
    /** 内层文本字号 */
    get textSize(): number { return this.textStyle.size; }
    set textSize(size: number) {
        this.textStyle.size = size;
        this.setTextStyle(this.textStyle);
    }
    /** 设置内层文本样式 */
    setTextStyle(style: Style): PolygonView {
        this.textStyle = style;
        this.textList.forEach(label => {
            label.font = style.font;
            label.color = style.color;
            label.fontSize = style.size;
        });
        return this;
    }
    /** 显示隐藏内层文本 */
    showText(show: boolean): PolygonView {
        this.textList.forEach(label => label.visible = show);
        this.textShow = show;
        return this;
    }

    /** 获取提示点位置列表 */
    get textPoint(): number[] {
        if (this.scalePointXY) return this.scalePointXY;
        let pnts: number[] = [];
        let lps = this.scalePoints;
        lps.forEach((_, i: number) => {
            if (i % 2 == 1) return;
            pnts.push(this.circleDot.x + lps[i], this.circleDot.y + lps[i + 1]);
        });
        this.scalePointXY = pnts;
        return pnts;
    }
    /** 显示数据点 */
    showTextPoint(show: boolean): PolygonView {
        this.shapePointShow = show;
        this.redraw();
        return this;
    }
    /** 设置提示点半径 */
    setTextPointRadius(radius: number): PolygonView {
        this.shapePointRadius = radius;
        this.redraw();
        return this;
    }
    /** 设置提示点颜色 */
    setTextPointColor(color: string): PolygonView {
        this.shapePointColor = color;
        this.redraw();
        return this;
    }
    /** 设置提示点大小&颜色 */
    setTextPoint(color: string, radius?: number, show?: boolean): PolygonView {
        this.shapePointColor = color;
        if (radius !== undefined) {
            this.shapePointRadius = radius;
        }
        if (show !== undefined) {
            this.shapePointShow = show;
        }
        this.redraw();
        return this;
    }

    /** 显示隐藏图表背景填充&线条 */
    showCircle(show: boolean): PolygonView {
        this.shapeFillShow = show;
        this.redraw();
        return this;
    }
    /** 设置绘制背景颜色 */
    setCircleColor(fillColor?: string): PolygonView {
        this.circleFillColor = fillColor;
        this.redraw();
        return this;
    }
    /** 设置绘制背景线条粗细 */
    setCircleLineWidth(lineWidth: number): PolygonView {
        this.circleLineWidth = lineWidth;
        this.redraw();
        return this;
    }
    /** 设置绘制背景线条 */
    setCircleLine(lineColor?: string, lineWidth?: number): PolygonView {
        this.circleLineColor = lineColor;
        if (lineWidth !== undefined) {
            this.circleLineWidth = lineWidth;
        }
        this.redraw();
        return this;
    }
    /** 设置绘制圆线框品质[ 36 - 180 ] */
    setCircleQuality(quality: number): PolygonView {
        this.circleQuality = quality;
        this.redraw();
        return this;
    }
    /** 设置绘制背景配置色 */
    setCircle(fillColor?: string, lineColor?: string, lineWidth?: number, quality: number = 36): PolygonView {
        if (fillColor !== undefined) {
            this.circleFillColor = fillColor;
        }
        if (lineColor !== undefined) {
            this.circleLineColor = lineColor;
        }
        if (lineWidth !== undefined) {
            this.circleLineWidth = lineWidth;
        }
        this.circleQuality = quality;
        this.redraw();
        return this;
    }

    /** 显示隐藏图表线框 */
    showPolygonLine(show: boolean): PolygonView {
        this.polygonLineShow = show;
        this.redraw();
        return this;
    }
    /** 设置图表线框粗细 */
    setPolygonLineWidth(lineWidth: number): PolygonView {
        this.polygonLineWidth = lineWidth;
        this.redraw();
        return this;
    }
    /** 设置图表线框颜色 */
    setPolygonLine(lineColor: string, lineWidth?: number, show?: boolean): PolygonView {
        this.polygonLineColor = lineColor;
        if (lineWidth !== undefined) {
            this.polygonLineWidth = lineWidth;
        }
        if (show !== undefined) {
            this.polygonLineShow = show;
        }
        this.redraw();
        return this;
    }

    /** 显示隐藏图表线框 */
    showFillLine(show: boolean): PolygonView {
        this.fillLineShow = show;
        this.redraw();
        return this;
    }
    /** 设置图表填充颜色 */
    setFillColor(color: string): PolygonView {
        this.shapeFillColor = color;
        this.redraw();
        return this;
    }
    /** 设置图表线框粗细 */
    setFillLineWidth(lineWidth: number): PolygonView {
        this.shapeFillLineWidth = lineWidth;
        this.redraw();
        return this;
    }
    /** 设置图表线框颜色 */
    setFillLine(lineColor: string, lineWidth?: number, show?: boolean): PolygonView {
        this.shapeFillLineColor = lineColor;
        if (lineWidth !== undefined) {
            this.shapeFillLineWidth = lineWidth;
        }
        if (show !== undefined) {
            this.fillLineShow = show;
        }
        this.redraw();
        return this;
    }

    /** 显示或隐藏分块线 */
    showMaskLine(show: boolean): PolygonView {
        this.shapeMaskLineShow = show;
        this.redraw();
        return this;
    }
    /** 设置分块线粗细 */
    setMaskLineWidth(lineWidth: number): PolygonView {
        this.shapeMaskLineWidth = lineWidth;
        this.redraw();
        return this;
    }
    /** 设置分块线颜色&粗细 */
    setMaskLine(lineColor: string, lineWidth?: number, show?: boolean): PolygonView {
        this.shapeMaskLineColor = lineColor;
        if (lineWidth !== undefined) {
            this.shapeMaskLineWidth = lineWidth;
        }
        if (show !== undefined) {
            this.shapeMaskLineShow = show;
        }
        this.redraw();
        return this;
    }

    /** 添加一个数据 */
    addPoint(pnt: Point, index?: number): PolygonView {
        if (index === undefined) {
            this.drawData.push(pnt);
        } else {
            this.drawData.splice(index, 0, pnt);
        }
        this.reset(this.drawData);
        return this;
    }
    /** 修改一个数据或数据的某个属性值 */
    setPoint(index: number, value: Point | any, ...props: string[]): PolygonView {
        if (props.length == 0) {
            this.drawData[index] = value;
        } else {
            let _data: any = this.drawData[index];
            let _prop = props.pop();
            props.forEach(p => _data = _data[p]);
            _data[_prop!] = value;
        }
        return this;
    }
    /** 删除一个数据 */
    deletePoint(index: number): PolygonView {
        this.drawData.splice(index, 1);
        this.reset(this.drawData);
        return this;
    }

    /** 刷新图表数据显示 */
    reset(pnts: Point[], radius?: number): void {
        if (radius !== undefined) this.circleRadius = radius;
        if (pnts === undefined) return;
        //创建文本对象
        this.drawData = pnts;
        let length = pnts.length;
        pnts.forEach((pnt: Point, idx: number) => {
            if (this.labelList[idx]) return;
            //内文本对象
            let lab = new Laya.Label();
            lab.font = this.labelStyle.font;
            lab.fontSize = this.labelStyle.size;
            lab.color = this.labelStyle.color;
            lab.changeText(pnt.label);
            lab.visible = this.labelShow;
            this.labelList.push(lab);
            //外文本对象
            lab = new Laya.Label();
            lab.font = this.textStyle.font;
            lab.fontSize = this.textStyle.size;
            lab.color = this.textStyle.color;
            lab.changeText(pnt.text);
            lab.visible = this.textShow;
            this.textList.push(lab);
        });
        //销毁多余文本对象
        let count = this.labelList.length - length;
        while (count > 0) {
            (<Laya.Label>this.labelList.pop()).destroy();
            (<Laya.Label>this.textList.pop()).destroy();
            count--;
        }
        //绘制图表
        let rotation = 360 / length;
        this.shapePoints = this.getDrawPoints(pnts, rotation, 'label', this.circleRadius);
        this.scalePoints = this.getDrawPoints(pnts, rotation, 'text');
        this.shapePointXY = undefined;
        this.scalePointXY = undefined;
        this.redraw();
    }

    /** 重新绘制图表 */
    private redraw(): void {
        Laya.timer.callLater(this, this.onRedraw);
    }
    private onRedraw(): void {
        this.graphics.clear();
        if (this.shapeFillShow) this.drawCircle(this.circleRadius, this.circleFillColor, this.circleLineColor, this.circleLineWidth);
        if (this.polygonLineShow) this.drawLine(this.shapePoints, this.polygonLineColor, this.polygonLineWidth);
        this.drawPoly(this.scalePoints, this.shapeFillColor, this.fillLineShow ? this.shapeFillLineColor : undefined, this.shapeFillLineWidth);
        if (this.shapeMaskLineShow) this.drawFillLine(this.scalePoints, this.shapeMaskLineColor, this.shapeMaskLineWidth);
        if (this.shapePointShow) this.drawPoint(this.scalePoints, this.shapePointColor);
    }

    /** 获取绘制图表XY点列表 */
    private getDrawPoints(pnts: Point[], rotation: number, label: 'label' | 'text', radius?: number): number[] {
        let lps: number[] = [];
        pnts.forEach((pnt: Point, idx: number) => {
            let rot = this.circleRotation + idx * rotation;
            let ofs = this.getOffset(rot);
            let r = radius || (this.circleRadius * pnt.scale);
            let x = ofs.x * r;
            let y = ofs.y * r;
            lps.push(x, y);
            //
            r += 10;
            let lab = label == 'label' ? this.labelList[idx] : this.textList[idx];
            lab.anchorX = rot > 315 || rot < 45 ? 0 : (rot > 135 && rot < 225 ? 1 : 0.5);
            lab.anchorY = rot > 315 || rot < 45 ? 0.5 : (rot > 135 && rot < 225 ? 0.5 : (rot < 180 ? 0 : 1));
            lab.pos(ofs.x * r, ofs.y * r);
            this.addChild(lab);
        });
        return lps;
    }
    /** 计算当前角度XY移动偏移量 */
    private getOffset(rot: number): Laya.Point {
        let _rot: number = rot * Math.PI / 180;
        let _spx: number = Math.cos(_rot);
        let _spy: number = Math.sin(_rot);
        return new Laya.Point(_spx, _spy);
    }

    /** 绘制圆 */
    private drawCircle(radius: number, fillColor?: string, lineColor?: string, lineWidth?: number, x?: number, y?: number): void {
        if (fillColor) {
            let cx = x === undefined ? this.circleDot.x : x;
            let cy = y === undefined ? this.circleDot.y : y;
            this.graphics.drawCircle(cx, cy, radius, fillColor, lineColor, lineWidth);
        } else {
            let lps: number[] = [];
            let a = radius / this.circleQuality;
            let i = 0;
            while (i < 360) {
                let ofs = this.getOffset(i);
                let x = ofs.x * radius;
                let y = ofs.y * radius;
                lps.push(x, y);
                i += a;
            }
            this.drawLine(lps, lineColor, lineWidth, x, y);
        }
    }
    /** 绘制线条 */
    private drawLine(lps: number[], lineColor: string = '#FFFFFF', lineWidth?: number, x?: number, y?: number): void {
        let pnts = [...lps, lps[0], lps[1], lps[2], lps[3]];
        let cx = x === undefined ? this.circleDot.x : x;
        let cy = y === undefined ? this.circleDot.y : y;
        this.graphics.drawLines(cx, cy, pnts, lineColor, lineWidth);
    }
    /** 绘制填充多边形 */
    private drawPoly(lps: number[], fillColor: string = '#FFFFFF', lineColor?: string, lineWidth?: number, x?: number, y?: number): void {
        let cx = x === undefined ? this.circleDot.x : x;
        let cy = y === undefined ? this.circleDot.y : y;
        this.graphics.drawPoly(cx, cy, lps, fillColor, lineColor, lineWidth);
    }
    /** 绘制提示点 */
    private drawPoint(lps: number[], fillColor?: string, lineColor?: string, lineWidth?: number): void {
        lps.forEach((_, i: number) => {
            if (i % 2 == 1) return;
            this.graphics.drawCircle(this.circleDot.x + lps[i], this.circleDot.y + lps[i + 1], Math.max(2, this.shapePointRadius), fillColor, lineColor, lineWidth);
        });
    }
    /** 绘制填充线条 */
    private drawFillLine(lps: number[], lineColor?: string, lineWidth?: number): void {
        let pnts: number[] = [0, 0];
        let max = lps.length;
        for (let i = 0; i < max; i += 2) {
            pnts.push(lps[i], lps[i + 1], 0, 0);
        }
        this.drawLine(pnts, lineColor, lineWidth);
    }

}