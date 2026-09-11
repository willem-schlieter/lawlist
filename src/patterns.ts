/**
 * This file contains code for rendering the style patterns set by the user in the settings tab
 * into enumerators for list items, and to turn patterns into CSS marker content.
 * 
 * To add another numbering system, add it to `COUNTER_STYLES` (Read Mode) and `renderPattern` (Edit Mode)!
 */

/**
 * The `@counter-style` each supported number character maps to. Names that are not
 * CSS built-ins are declared in `src/styles.src.css`.
 */
const COUNTER_STYLES: Record<string, string> = {
    "1": "decimal",
    "I": "upper-roman",
    "i": "lower-roman",
    "A": "upper-alpha",
    "a": "lower-alpha",
    "AA": "lawlist-upper-alpha-double",
    "aa": "lawlist-lower-alpha-double",
    "①": "lawlist-circled"
};

/**
 * Quote a user-supplied string as a CSS string token. Without this, a pattern
 * containing a quote or a backslash would break the declaration it lands in.
 */
export function cssString(value: string): string {
    return '"' + value
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\A ")
        + '"';
}

/**
 * Return a CSS `content` value that renders the given pattern, for use as the
 * marker of a list item. Patterns without a number character become a fixed
 * string, which is how bullets and unnumbered markers are expressed.
 */
export function createMarkerContent(pattern: string): string {
    const numberchar = (pattern.match(/(a{1,2}|A{1,2}|i|I|①|1)/) || "")[0];
    if (!numberchar) return cssString(pattern);
    const [prefix, suffix] = pattern.split(RegExp(`${numberchar}(.*)`));
    return [
        prefix && cssString(prefix),
        `counter(list-item, ${COUNTER_STYLES[numberchar]})`,
        suffix && cssString(suffix)
    ].filter(Boolean).join(" ");
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
    for (const [a, b] of romanLookup) {
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
 * Render a given pattern for the given enumerator number. Return the corresponding counter as string.
 */
export function renderPattern(pattern: string, e: number): string {
    const numberchar = (pattern.match(/(a{1,2}|A{1,2}|i|I|①|1)/) || "")[0];
    if (numberchar) {
        const [prefix, suffix] = pattern.split(RegExp(`${numberchar}(.*)`));
        let number = "" + e;
        switch (numberchar) {
            case "A": number = alphanum(e); break;
            case "a": number = alphanum(e).toLowerCase(); break;
            case "I": number = romanize(e); break;
            case "i": number = romanize(e).toLowerCase(); break;
            case "AA": number = alphanum(e).repeat(2); break;
            case "aa": number = alphanum(e).toLowerCase().repeat(2); break;
            case "①": number = circled[e - 1] || ("" + e); break;
        }
        return prefix + number + suffix;
    } else return pattern;
}
