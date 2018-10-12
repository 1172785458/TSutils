
/**
 * @author D-Team viva
 * @date   2018/10/12
 */

/** 点 */
export type Point = { x: number, y: number }

/** 求两线段是否相交并求出交叉点位置
 * @param a 线段A第一个点
 * @param b 线段A第二个点
 * @param c 线段B第一个点
 * @param d 线段B第二个点
 * @return Point | false
 # 求线段ab和线段cd交点p #
    a    d
   A \  /
      \/p
      /\
   B /  \
    c    b
 */
export function CrossPoint(a: Point, b: Point, c: Point, d: Point): Point | false {
    // 三角形abc 面积的2倍
    let abc = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x);
    // 三角形abd 面积的2倍
    let abd = (a.x - d.x) * (b.y - d.y) - (a.y - d.y) * (b.x - d.x);

    // 面积符号相同则两点在线段同侧,不相交 (对点在线段上的情况,本例当作不相交处理);
    if ((abc * abd) >= 0) return false;

    // 三角形cda 面积的2倍
    let cda = (c.x - a.x) * (d.y - a.y) - (c.y - a.y) * (d.x - a.x);
    // 三角形cdb 面积的2倍
    // 注意: 这里有一个小优化.不需要再用公式计算面积,而是通过已知的三个面积加减得出.
    let cdb = cda + abc - abd;
    if ((cda * cdb) >= 0) return false;

    //计算交点坐标
    let t = cda / (abd - abc);
    let dx = t * (b.x - a.x);
    let dy = t * (b.y - a.y);
    return {
        x: a.x + dx,
        y: a.y + dy
    };
}

/** 连连看游戏的寻路算法并返回路径折点集
 * @param map 二维数组
 * @param a 点A位置
 * @param b 点B位置
 * @return Point[] | false
 # 求A点到B点的路径
    |－|－|－|－|－|－|－|
    |－|－|＃|口|口|Ａ|－|
    |－|％|＆|口|－|－|－|
    |－|－|－|口|％|－|－|
    |－|Ｂ|口|口|＃|＆|－|
    |－|－|－|－|－|－|－|
 */
export function LinkLine(map: number[][], a: Point, b: Point): Point[] | false {
    let av = map[a.x][a.y];
    let bv = map[b.x][b.y];
    map[a.x][a.y] = 0;
    map[b.x][b.y] = 0;
    //返回值
    let pt = [{ ...a }, { ...b }];
    //同行列
    if (a.x == b.x && LinkVertical(map, a.y, b.y, a.x)) return pt;
    if (a.y == b.y && LinkHorizontal(map, a.x, b.x, a.y)) return pt;
    //三点连
    if (LinkHorizontal(map, a.x, b.x, a.y) && LinkVertical(map, a.y, b.y, b.x)) {
        pt.splice(1, 0, { x: b.x, y: a.y });
        return pt;
    }
    if (LinkHorizontal(map, a.x, b.x, b.y) && LinkVertical(map, a.y, b.y, a.x)) {
        pt.splice(1, 0, { x: a.x, y: b.y });
        return pt;
    }
    //中四点
    let vn = a.x < b.x ? 1 : -1;
    let max = Math.abs(a.x - b.x);
    for (let i = 1; i < max; i++) {
        let x = a.x + vn * i;
        if (map[a.y][x] > 0) break;
        if (LinkVertical(map, a.y, b.y, x) && LinkHorizontal(map, b.x, x, b.y)) {
            pt.splice(1, 0, { x: x, y: a.y }, { x: x, y: b.y });
            return pt;
        }
    }
    vn = a.y < b.y ? 1 : -1;
    max = Math.abs(a.y - b.y);
    for (let i = 1; i < max; i++) {
        let y = a.y + vn * i;
        if (map[y][a.x] > 0) break;
        if (LinkHorizontal(map, a.x, b.x, y) && LinkVertical(map, b.y, y, b.x)) {
            pt.splice(1, 0, { x: a.x, y: y }, { x: b.x, y: y });
            return pt;
        }
    }
    //外四点
    vn = a.x < b.x ? 1 : -1;
    max = map[0].length;
    for (let i = 1; i < max; i++) {
        let x = a.x - vn * i;
        if (x < 0 || x >= max) break;
        else if (map[a.y][x] > 0) break;
        if (LinkVertical(map, a.y, b.y, x) && LinkHorizontal(map, b.x, x, b.y)) {
            pt.splice(1, 0, { x: x, y: a.y }, { x: x, y: b.y });
            return pt;
        }
    }
    for (let i = 1; i < max; i++) {
        let x = b.x + vn * i;
        if (x < 0 || x >= max) break;
        else if (map[b.y][x] > 0) break;
        if (LinkVertical(map, a.y, b.y, x) && LinkHorizontal(map, a.x, x, a.y)) {
            pt.splice(1, 0, { x: x, y: a.y }, { x: x, y: b.y });
            return pt;
        }
    }
    vn = a.y < b.y ? 1 : -1;
    max = map.length;
    for (let i = 1; i < max; i++) {
        let y = a.y - vn * i;
        if (y < 0 || y >= max) break;
        else if (map[y][a.x] > 0) break;
        if (LinkHorizontal(map, a.x, b.x, y) && LinkVertical(map, b.y, y, b.x)) {
            pt.splice(1, 0, { x: a.x, y: y }, { x: b.x, y: y });
            return pt;
        }
    }
    for (let i = 1; i < max; i++) {
        let y = b.y + vn * i;
        if (y < 0 || y >= max) break;
        else if (map[y][b.x] > 0) break;
        if (LinkHorizontal(map, a.x, b.x, y) && LinkVertical(map, a.y, y, a.x)) {
            pt.splice(1, 0, { x: a.x, y: y }, { x: b.x, y: y });
            return pt;
        }
    }
    //无效连
    map[a.x][a.y] = av;
    map[b.x][b.y] = bv;
    return false;
}
function LinkHorizontal(map: number[][], ax: number, bx: number, y: number): boolean {
    let n = ax < bx ? 1 : -1;
    let m = Math.abs(ax - bx);
    for (let i = 0; i <= m; i++) {
        let x = ax + n * i;
        if (map[y][x] > 0) return false;
    }
    return true;
}
function LinkVertical(map: number[][], ay: number, by: number, x: number): boolean {
    let n = ay < by ? 1 : -1;
    let m = Math.abs(ay - by);
    for (let i = 0; i <= m; i++) {
        let y = ay + n * i;
        if (map[y][x] > 0) return false;
    }
    return true;
}

/** 二维数组点路线转换为具体详细路线 */
export function Line2Point(ps: Point[]): Point[] {
    let pt: Point[] = [];
    let max = ps.length;
    for (let i = 1; i < max; i++) {
        let a = ps[i - 1];
        let b = ps[i];
        if (a.x == b.x) {
            let n = a.y < b.y ? 1 : -1;
            let m = Math.abs(a.y - b.y);
            for (let j = 0; j < m; j++) {
                let y = a.y + n * j;
                pt.push({ x: a.x, y: y });
            }
        } else {
            let n = a.x < b.x ? 1 : -1;
            let m = Math.abs(a.x - b.x);
            for (let j = 0; j < m; j++) {
                let x = a.x + n * j;
                pt.push({ x: x, y: a.y });
            }
        }
    }
    pt.push({ ...ps[max - 1] });
    return pt;
}
