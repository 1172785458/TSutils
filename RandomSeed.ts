
/**随机数种子
 * seed 的值不变得出的随机值也不变，所以值入指定的 seed 值就能得到指定的随机值了。
 */
export default function RandomSeed(seed: number = 8, min?: number, max?: number): number {
    let _max: number = max || 1;
    let _min: number = min || 0;
    let _seed: number = (seed * 9301 + 49297) % 233280;
    let _rnd: number = _seed / 233280;
    return _min + _rnd * (_max - _min);
}