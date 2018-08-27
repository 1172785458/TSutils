
/**载入ttf字体
* @param fontName: string      注册字体名称
* @param url: string           ttf字体文件的路径
* @param deadText: string      如果是在browser下的WEBGL模式，这个字符将不能再用ttf字体打印显示出来，SO请设置一个生僻字吧！

* 注：调用前必须初始化LAYA, 在第一屏加载中对TTF字体进行缓存加载，第一屏加载完成后再进行此方法的调用，确保TTF字体已处理可使用状态。
*/

export default function LoadTTF(url: string, fontName: string = 'TTF', deadText: string = "氇") {
    //LayaNative
    if (window["conch"]) {
        let _ttf: ArrayBuffer = Laya.loader.getRes(url);
        window["conch"].setFontFaceFromBuffer(fontName, _ttf);
    }
    //standard H5
    else {
        let _css: string = `@font-face { font-family: ${fontName}; src: url(${url}) format('truetype'); }`;
        let _style: HTMLStyleElement = document.createElement('style');
        _style.type = 'text/css';
        _style.innerHTML = _css;
        document.head.appendChild(_style);
        //缓存激活TTF字体
        let _cache: Laya.Text = new Laya.Text();
        _cache.font = fontName;
        _cache.text = deadText;
        _cache.fontSize = 1;
        _cache.pos(-1, -1);
        Laya.stage.addChild(_cache);
    }
}