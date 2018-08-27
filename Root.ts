/**
 * 此文件为主层级类
 * 实现了暂停功能，抖动屏幕功能，子循环管理功能
 *
 * 注：只使用静态方法
 */

/** 循环类接口 */
export interface UpdateChild {
    update(): void;
}

/** 抖屏模式 [ all 左->右上->下->左上->右->左下->上->右下；updown 上->下；leftright 左->右；] */
type RockMode = 'all' | 'updown' | 'leftright';
enum Rock {
    ALL = 'all',
    UD = 'updown',
    LR = 'leftright'
}

/**主层级（根层） */
export default class Root {

    private static _intance: RootDisplay;
    /** 主层级（根层）显示层指针 */
    static get content(): RootDisplay {
        if (!this._intance) {
            this._intance = new RootDisplay();
        }
        return this._intance;
    }

    /** 是否暂停了所有子层循环 */
    static get isPaused(): boolean {
        return this.content.paused;
    }

    /** 暂停所有子层循环 */
    static paused(): Root {
        this.content.paused = true;
        return this;
    }

    /** 继续所有子层循环 */
    static resume(): Root {
        this.content.paused = false;
        return this;
    }

    /** 抖动主层级（根层） */
    static rocking(range: number = 8, mode: RockMode = Rock.ALL): Root {
        this.content.rocking(mode, range);
        return this;
    }

    /** 清空所有子层 */
    static clear(): Root {
        this.content.clear();
        return this;
    }

    /** 添加带循环的子层 */
    static add(child: UpdateChild): Root {
        this.content.add(child);
        return this;
    }

    /** 删除带循环的子层 */
    static cut(child: UpdateChild): Root {
        this.content.cut(child);
        return this;
    }

    /** 添加显示对象层 */
    static addChild(child: any): Root {
        this.content.create(child);
        return this;
    }

    /** 删除显示对象层 */
    static removeChild(child: any): Root {
        this.content.remove(child);
        return this;
    }

    /** 锁定本类不可外部实例化 */
    private constructor() { }

}

/** 主层级（根层）显示层 */
class RootDisplay extends Laya.Sprite {

    /** 有循环的子层寄存器 */
    private child_list: UpdateChild[] = [];

    /** 显示对象层寄存器 */
    private show_list: any[] = [];

    /** 是否执行清空处理 */
    private clear_run: boolean = false;

    /** 抖动模式 */
    private rocking_mode: RockMode = Rock.ALL;
    private rocking_range: number = 0;
    private rocking_count: number = 0;

    /** 暂停主层级（根层）所有子层循环 */
    paused: boolean = false;

    /** 清空操作执行处理 */
    private get clearDone(): boolean {
        if (!this.clear_run) return false;
        this.clear_run = false;

        this.child_list.length = 0;

        let _max: number = this.show_list.length;
        while (_max > 0) {
            this.show_list.pop().destroy();
            _max--;
        }

        return true;
    }

    /** 清空所有子层 */
    clear(): void {
        this.clear_run = true;
    }

    /** 添加有循环的子层到寄存器 */
    add(child: UpdateChild): void {
        let _index: number = this.child_list.indexOf(child);
        if (_index < 0) this.child_list.push(child);
    }

    /** 从寄存器中删除有循环的子层 */
    cut(child: UpdateChild): void {
        let _index: number = this.child_list.indexOf(child);
        if (_index >= 0) this.child_list.splice(_index, 1);
    }

    /** 添加显示对象到寄存器并显示到ROOT层 */
    create(child: any): void {
        let _index: number = this.show_list.indexOf(child);
        if (_index < 0) this.show_list.push(child);
        this.addChild(child);
    }

    /**  从寄存器和ROOT层中删除显示对象 */
    remove(child: any): void {
        let _index: number = this.show_list.indexOf(child);
        if (_index >= 0) {
            this.show_list.splice(_index, 1);
            child.destroy();
        }
    }

    /** 抖动整个屏幕 */
    rocking(mode: RockMode = Rock.ALL, range: number = 8): void {
        this.rocking_mode = mode;
        this.rocking_range = range;
        this.rocking_count = 0;
    }

    /** 刷新所有子层循环 */
    update(): void {
        if (this.clearDone || this.paused) return;

        this.updateRocking(Laya.stage);

        this.child_list.forEach((child: UpdateChild, idx: number) => {
            if (child) {
                child.update && child.update();
            } else {
                this.child_list.splice(idx, 1);
            }
        });
    }

    /** 抖动处理 */
    private updateRocking(rockingTarget?: any): void {
        if (!this.rocking_mode) return;
        let _target: any = rockingTarget || this;
        if (this.rocking_mode == Rock.UD) {
            _target.y = this.rocking_count % 2 == 0 ? -this.rocking_range : this.rocking_range;
        } else if (this.rocking_mode == Rock.LR) {
            _target.x = this.rocking_count % 2 == 0 ? -this.rocking_range : this.rocking_range;
        } else {
            let _case: number = this.rocking_count % 8;
            switch (_case) {
                case 0:
                    _target.x = -this.rocking_range;
                    _target.y = 0;
                    break;
                case 1:
                    _target.x = this.rocking_range;
                    _target.y = -this.rocking_range;
                    break;
                case 2:
                    _target.x = 0;
                    _target.y = this.rocking_range;
                    break;
                case 3:
                    _target.x = -this.rocking_range;
                    _target.y = -this.rocking_range;
                    break;
                case 4:
                    _target.x = this.rocking_range;
                    _target.y = 0;
                    break;
                case 5:
                    _target.x = -this.rocking_range;
                    _target.y = this.rocking_range;
                    break;
                case 6:
                    _target.x = 0;
                    _target.y = -this.rocking_range;
                    break;
                case 7:
                    _target.x = this.rocking_range;
                    _target.y = this.rocking_range;
                    break;
            }
        }
        this.rocking_count++;
        this.rocking_range--;
        if (this.rocking_range < 1) {
            _target.x = 0;
            _target.y = 0;
            delete this.rocking_mode;
        }
    }

}