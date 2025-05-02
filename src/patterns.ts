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
    let numberchar = (pattern.match(/(a{1,2}|A{1,2}|i|I|1)/) || "")[0];
    if (numberchar) {
        let [prefix, suffix] = pattern.split(RegExp(`${numberchar}(.*)`));
        let system = "decimal";
        switch (numberchar) {
            case "A": system = "upper-alpha"; break;
            case "a": system = "lower-alpha"; break;
            case "I": system = "upper-roman"; break;
            case "i": system = "lower-roman"; break;
            case "AA": system = "alphabetic"; break;
            case "aa": system = "alphabetic"; break;
        }
        if (system === "alphabetic") return `{ system: alphabetic; prefix: "${prefix}"; suffix: "${suffix}"; symbols: "aa" "bb" "cc" "dd" "ee" "ff" "gg" "hh" "ii" "jj" "kk" "ll" "mm" "nn" "oo" "pp" "qq" "rr" "ss" "tt" "uu" "vv" "ww" "xx" "yy" "zz"; }`;
        else return `{ system: extends ${system}; prefix: "${prefix}"; suffix: "${suffix}"; }`;
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
 * Render a given pattern for the given enumerator number. Return the corresponding counter as string.
 */
export function renderPattern(pattern: string, e: number): string {
    let numberchar = (pattern.match(/(a{1,2}|A{1,2}|i|I|1)/) || "")[0];
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
        }
        return prefix + number + suffix;
    } else return pattern;
}
