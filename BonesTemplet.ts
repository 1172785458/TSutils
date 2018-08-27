/** 创建骨骼动画模版管理类 */
export default class BonesTemplet {

    /** 骨骼模板表 */
    private templetDict: { [key: string]: Laya.Templet } = {};
    /** 骨骼模板加载成功状态记录 */
    private templetLoad: { [key: string]: boolean } = {};

    /** 加载骨骼动画模板  */
    constructor() { }

    /** 返回模板Key
     * @param skFile : string   骨骼动画模版文件路径
     */
    private key(skFile: string): string {
        return skFile.split('/').join('_').split('.').join('_');
    }

    /** 销毁类
     * @param skFile : string   骨骼动画模版文件路径
     */
    destroy(skFile?: string): void {
        if (skFile) {
            let _key: string = this.key(skFile);
            this.templetDict[_key].destroy();
            delete this.templetDict[_key];
            delete this.templetLoad[_key];
            return;
        }
        for (let _key in this.templetDict) {
            this.templetDict[_key].destroy();
            delete this.templetDict[_key];
            delete this.templetLoad[_key];
        }
        // this.templetDict = undefined;
        // this.templetLoad = undefined;
    }

    /** 获取骨骼动画模板对象 */
    templet(skFile: string): Laya.Templet {
        let _key: string = this.key(skFile);
        return this.templetDict[_key];
    }

    /** 使用骨骼动画模板对象创建一个新的骨骼动画显示对象
     * @param skFile : string   骨骼动画模版文件路径
     * @param aniMode : number  骨骼动画对象创建模式 （ 0-不可换皮； 1-可换皮; ）
     */
    skeleton(skFile: string, aniMode: number = 1): Laya.Skeleton | undefined {
        let _key: string = this.key(skFile);
        if (this.templetLoad[_key]) {
            return this.templetDict[_key].buildArmature(aniMode);
        }
        return undefined;
    }

    /** 加载骨骼动画模板
     * @param skFile : string   骨骼动画模版文件路径
     * @param complete : Function(templet : Laya.Templet):void  加载完成回调并返回骨骼动画模板对象
     * @param aniMode : number  骨骼动画对象创建模式 （ 0-不可换皮； 1-可换皮; ）
     * @param error : Function(skFile : string):void 加载失败回调并返回加载文件路径
     */
    loadAni(skFile: string, complete?: Function, _aniMode: number = 1, error?: Function): void {
        let _key: string = this.key(skFile);
        if (this.templetLoad[_key]) {
            complete && complete(this.templetDict[_key]);
            return;
        }
        //未加载模板重新加载
        let _templet: Laya.Templet;
        if (this.templetDict[_key]) {
            _templet = this.templetDict[_key];
        } else {
            _templet = new Laya.Templet();
        }
        _templet.on(Laya.Event.COMPLETE, this, () => {
            this.templetDict[_key] = _templet;
            this.templetLoad[_key] = true;
            _templet.offAll();
            complete && complete(_templet);
        });
        _templet.on(Laya.Event.ERROR, this, () => {
            this.templetLoad[_key] = false;
            error && error(skFile);
        });
        _templet.loadAni(skFile);
    }

}