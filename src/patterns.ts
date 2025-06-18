/**
 * This file contains code for rendering the style patterns set by the user in the settings tab
 * into enumerators for list items, and to create @counter-style CSS rules from patterns.
 * 
 * To add another numbering system, modify `createCounterStyleRule` (Read Mode) and `renderPattern` (Edit Mode)!
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
            case "あ": rule = `{ system: fixed; prefix: "${prefix}"; suffix: "${suffix}"; symbols: "あ" "い" "う" "え" "お" "か" "き" "く" "け" "こ" "さ" "し" "す" "せ" "そ" "た" "ち" "つ" "て" "と" "な" "に" "ぬ" "ね" "の" "は" "ひ" "ふ" "へ" "ほ" "ま" "み" "む" "め" "も" "や" "以" "ゆ" "江" "よ" "ら" "り" "る" "れ" "ろ" "わ" "ゐ" "于" "ゑ" "を" "ん"; }`; break;
            case "ア": rule = `{ system: fixed; prefix: "${prefix}"; suffix: "${suffix}"; symbols: "ア" "イ" "ウ" "エ" "オ" "カ" "キ" "ク" "ケ" "コ" "サ" "シ" "ス" "セ" "ソ" "タ" "チ" "ツ" "テ" "ト" "ナ" "二" "ヌ" "ネ" "ノ" "ハ" "ヒ" "フ" "ヘ" "ホ" "マ" "ミ" "ム" "メ" "モ" "ヤ" "以" "ユ" "江" "ヨ" "ラ" "リ" "ル" "レ" "ロ" "ワ" "ヰ" "汙" "ヱ "ヲ" "ン"; }`; break;
            case "一": rule = `{ system: fixed; prefix: "${prefix}"; suffix: "${suffix}"; symbols: "一" "二" "三" "四" "五" "六" "七" "八" "九" "十" "十一" "十二" "十三" "十四" "十五" "十六" "十七" "十八" "十九" "二十" "二十一" "二十二" "二十三" "二十四" "二十五" "二十六" "二十七" "二十八" "二十九" "三十" "三十一" "三十二" "三十三" "三十四" "三十五" "三十六" "三十七" "三十八" "三十九" "四十" "四十一" "四十二" "四十三" "四十四" "四十五" "四十六" "四十七" "四十八" "四十九" "五十" "五十一" "五十二" "五十三" "五十四" "五十五" "五十六" "五十七" "五十八" "五十九" "六十" "六十一" "六十二" "六十三" "六十四" "六十五" "六十六" "六十七" "六十八" "六十九" "七十" "七十一" "七十二" "七十三" "七十四" "七十五" "七十六" "七十七" "七十八" "七十九" "八十" "八十一" "八十二" "八十三" "八十四" "八十五" "八十六" "八十七" "八十八" "八十九" "九十" "九十一" "九十二" "九十三" "九十四" "九十五" "九十六" "九十七" "九十八" "九十九" "百"; }`; break;
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
    ['C', 100],  ['XC', 90],  ['L', 50],  ['XL', 40],
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
 * Lookup for hiragana.
 */
const hiragana = [
	'あ', 'い', 'う', 'え', 'お', 
	'か', 'き', 'く', 'け', 'こ', 
	'さ', 'し', 'す', 'せ', 'そ', 
	'た', 'ち', 'つ', 'て', 'と', 
	'な', 'に', 'ぬ', 'ね', 'の', 
	'は', 'ひ', 'ふ', 'へ', 'ほ', 
	'ま', 'み', 'む', 'め', 'も', 
	'や', '以', 'ゆ', '江', 'よ', 
	'ら', 'り', 'る', 'れ', 'ろ', 
	'わ', 'ゐ', '于', 'ゑ', 'を', 
	'ん'
];

/**
 * Lookup for katakana.
 */
const katakana = [
	'ア', 'イ', 'ウ', 'エ', 'オ', 
	'カ', 'キ', 'ク', 'ケ', 'コ', 
	'サ', 'シ', 'ス', 'セ', 'ソ', 
	'タ', 'チ', 'ツ', 'テ', 'ト', 
	'ナ', '二', 'ヌ', 'ネ', 'ノ', 
	'ハ', 'ヒ', 'フ', 'ヘ', 'ホ', 
	'マ', 'ミ', 'ム', 'メ', 'モ', 
	'ヤ', '以', 'ユ', '江', 'ヨ', 
	'ラ', 'リ', 'ル', 'レ', 'ロ', 
	'ワ', 'ヰ', '汙', 'ヱ "ヲ', 
	'ン'
];

/**
 * Lookup for hanzi.
 */
const hanzi = [
	'一', '二', '三', '四', '五', '六', '七', '八', '九', '十', 
	'十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', 
	'二十', '二十一', '二十二', '二十三', '二十四', '二十五', '二十六', '二十七', '二十八', '二十九', 
	'三十', '三十一', '三十二', '三十三', '三十四', '三十五', '三十六', '三十七', '三十八', '三十九', 
	'四十', '四十一', '四十二', '四十三', '四十四', '四十五', '四十六', '四十七', '四十八', '四十九', 
	'五十', '五十一', '五十二', '五十三', '五十四', '五十五', '五十六', '五十七', '五十八', '五十九', 
	'六十', '六十一', '六十二', '六十三', '六十四', '六十五', '六十六', '六十七', '六十八', '六十九', 
	'七十', '七十一', '七十二', '七十三', '七十四', '七十五', '七十六', '七十七', '七十八', '七十九', 
	'八十', '八十一', '八十二', '八十三', '八十四', '八十五', '八十六', '八十七', '八十八', '八十九', 
	'九十', '九十一', '九十二', '九十三', '九十四', '九十五', '九十六', '九十七', '九十八', '九十九', 
	'百'
];

/**
 * Render a given pattern for the given enumerator number. Return the corresponding counter as string.
 */
export function renderPattern(pattern: string, e: number): string {
    let numberchar = (pattern.match(/(a{1,2}|A{1,2}|i|I|①|1)/) || "")[0];
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
			case "あ": number = hiragana[e - 1] || ("" + e); break;
			case "ア": number = katakana[e - 1] || ("" + e); break;
			case "一": number = hanzi[e - 1] || ("" + e); break;
		}
        return prefix + number + suffix;
    } else return pattern;
}
