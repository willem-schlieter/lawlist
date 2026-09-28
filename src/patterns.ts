/**
 * This file contains code for rendering the style patterns set by the user in the settings tab
 * into enumerators for list items, and to create @counter-style CSS rules from patterns.
 *
 * To add another numbering system, modify `createCounterStyleRule` (Read Mode) and `renderPattern` (Edit Mode)!
 * 新增支持中文数字编码修改 by Captain Nemo.
*/

/**
 * Return a "@counter-style" rule body (`{ … }`) for the given pattern.
 */
export function createCounterStyleRule(pattern: string): string {
    let numberchar = (pattern.match(/(a{1,2}|A{1,2}|i|I|①|1)/) || "")[0];
    if (numberchar) {
        let [prefix, suffix] = pattern.split(RegExp(`${numberchar}(.*)`));
        let rule = `{ system: extends decimal; prefix: "${prefix}"; suffix: "${suffix}"; }`
        switch (numberchar) {
            case "①": rule = `{ system: fixed; prefix: "${prefix}"; suffix: "${suffix}"; symbols: "①" "②" "③" "④" "⑤" "⑥" "⑦" "⑧" "⑨" "⑩" "⑪" "⑫" "⑬" "⑭" "⑮" "⑯" "⑰" "⑱" "⑲" "⑳" "㉑" "㉒" "㉓" "㉔" "㉕" "㉖" "㉗" "㉘" "㉙" "㉚" "㉛" "㉜" "㉝" "㉞" "㉟" "㊱" "㊲" "㊳" "㊴" "㊵" "㊶" "㊷" "㊸" "㊹" "㊺" "㊻" "㊼" "㊽" "㊾" "㊿"; }`; break;
            case "I": rule = `{ system: extends upper-roman; prefix: "${prefix}"; suffix: "${suffix}"; }`; break;
            case "i": rule = `{ system: extends lower-roman; prefix: "${prefix}"; suffix: "${suffix}"; }`; break;
            case "A": rule = `{ system: extends upper-alpha; prefix: "${prefix}"; suffix: "${suffix}"; }`; break;
            case "a": rule = `{ system: extends lower-alpha; prefix: "${prefix}"; suffix: "${suffix}"; }`; break;
            case "AA": rule = `{ system: alphabetic; prefix: "${prefix}"; suffix: "${suffix}"; symbols: "AA" "BB" "CC" "DD" "EE" "FF" "GG" "HH" "II" "JJ" "KK" "LL" "MM" "NN" "OO" "PP" "QQ" "RR" "SS" "TT" "UU" "VV" "WW" "XX" "YY" "ZZ"; }`; break;
            case "aa": rule = `{ system: alphabetic; prefix: "${prefix}"; suffix: "${suffix}"; symbols: "aa" "bb" "cc" "dd" "ee" "ff" "gg" "hh" "ii" "jj" "kk" "ll" "mm" "nn" "oo" "pp" "qq" "rr" "ss" "tt" "uu" "vv" "ww" "xx" "yy" "zz"; }`;
        }
        return rule;
    } else return `{ system: cyclic; symbols: "${pattern}"; suffix: ""; }`;
}

/**
 * Convert a given number into an alphabetic counter such as `A, B … Z, AA, AB … AZ, BA, BB …`.
 */
function alphanum (num: number): string {
    if (num < 1) return "";
    return alphanum(Math.floor((num - 1) / 26)) + String.fromCharCode((num - 1) % 26 + 65);
}

const romanLookup = [
    ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
    ['C', 100],  ['XC', 90],  ['L', 50],   ['XL', 40],
    ['X', 10],   ['IX', 9],   ['V', 5],   ['IV', 4],
    ['I', 1]
];

/**
 * Convert a given number into a roman number.
 */
function romanize (num: number): string {
    let roman = '';
    for (let [a, b] of romanLookup) {
        roman += (a as string).repeat(Math.floor(num / (b as number)));
        num %= (b as number);
    }
    return roman;
}

/**
 * 【新增】将阿拉伯数字转换为中文数字。
 *
 * 作用：
 *   1 → 一
 *   2 → 二
 *   ...
 *   10 → 十
 *   11 → 十一
 *   20 → 二十
 *   21 → 二十一
 *
 * 当前用于 Live Preview 中的中文编号。
 */
function chineseNumeral (num: number): string {
    const numerals = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

    // 目前支持 1～99；超出范围时暂时返回阿拉伯数字。
    if (num < 1 || num > 99) return "" + num;

    // 1～9
    if (num < 10) {
        return numerals[num];
    }

    // 10～19
    if (num < 20) {
        return '十' + (num % 10 === 0 ? '' : numerals[num % 10]);
    }

    // 20～99
    return numerals[Math.floor(num / 10)] + '十'
        + (num % 10 === 0 ? '' : numerals[num % 10]);
}

/**
 * Lookup for circled decimal 1-50.
 */
const circled = [
    '①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩',
    '⑪', '⑫', '⑬', '⑭', '⑮', '⑯', '⑰', '⑱', '⑲', '⑳',
    '㉑', '㉒', '㉓', '㉔', '㉕', '㉖', '㉗', '㉘', '㉙', '㉚',
    '㉛', '㉜', '㉝', '㉞', '㉟', '㊱', '㊲', '㊳', '㊴', '㊵',
    '㊶', '㊷', '㊸', '㊹', '㊺', '㊻', '㊼', '㊽', '㊾', '㊿'
];

/**
 * Render a given pattern for the given enumerator number. Return the corresponding counter as string.
 */
export function renderPattern(pattern: string, e: number): string {

    /**
     * 【修改】增加中文数字占位符 `一`。
     *
     * 原来支持：
     *   1 / a / A / i / I / ①
     *
     * 现在增加：
     *   一
     *
     * 因此：
     *   一、  → 一、二、三、……
     *
     * 注意：
     *   `、` 不参与编号计算，而是作为 pattern 的 suffix 保留。
     */
    let numberchar = (pattern.match(/(a{1,2}|A{1,2}|i|I|①|一|1)/) || "")[0];

    if (numberchar) {
        let [prefix, suffix] = pattern.split(RegExp(`${numberchar}(.*)`));
        let number = "" + e;

        switch (numberchar) {
            case "A": number = alphanum(e); break;
            case "a": number = alphanum(e).toLowerCase(); break;
            case "I": number = romanize(e); break;
            case "i": number = romanize(e).toLowerCase(); break;
            case "AA": number = alphanum(e).repeat(2); break;
            case "aa": number = alphanum(e).toLowerCase().repeat(2); break;
            case "①": number = circled[e - 1] || ("" + e); break;

            /**
             * 【新增】中文数字编号。
             *
             * 当 pattern 使用 `一` 作为编号占位符时：
             *
             *   e = 1 → 一
             *   e = 2 → 二
             *   e = 3 → 三
             *
             * 如果设置为 `一、`，最终显示：
             *
             *   一、
             *   二、
             *   三、
             */
            case "一": number = chineseNumeral(e); break;
        }

        return prefix + number + suffix;
    } else {
        return pattern;
    }
}