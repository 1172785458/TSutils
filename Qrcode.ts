/**
 * 在html <body>中引用
	<script src="qrcode.js"></script>
 */

/** 获取二维码绘制数据 */
// @ts-ignore
QRCode.prototype.getData = function () {
    var d: number[][] = [];
    this._oQRCode.modules.forEach((a: boolean[]) => {
        d.push(a.map(b => b ? 1 : 0));
    });
    return d;
}

/** 生成二维码并显示在对象里 */
export function create(box: Laya.Sprite, url: string, size: number) {
    let div: Laya.HTMLElement = Laya.Browser.document.createElement("div");
    // @ts-ignore
    let qrcode = new QRCode(div, { width: size, height: size });
    qrcode.makeCode(url);
    let d: number[][] = qrcode.getData();
    let v: number = size / d.length;
    box.graphics.clear();
    d.forEach((a, i) => {
        a.forEach((n, j) => {
            box.graphics.drawRect(j * v, i * v, v, v, ['#FFF', '#000'][n]);
        });
    });
}