/**
 * This module contains code for parsing the style patterns set by the user in the settings tab
 * into enumerators for list items, as well as a "global store" for these style settings.
 */

/**
 * This is a "global store" of the plugin settings.
 * `store` is modified by the user via the settings tab (main.ts) and read in view_plugin.ts.
 * This is probably not best practise, but I couldn't figure out how to properly communicate
 * with the CM View Plugin from within main.ts.
 */
export const store: {
    /**
     * The enumerator patterns (such as `1. ` or `(A) `) for all indentation levels.
     */
    patterns: string[]
} = {
    patterns: []
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];
const ALPHA = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];

/**
 * Parses the concrete enumerator from a style pattern and the actual number of the list item.
 * @param pattern Enumerator style pattern (such as `1. ` or `(A) `.
 * @param enumerator The actual enumeration number.
 */
export function parsePattern(pattern: string, enumerator: number): string {
    return pattern.replaceAll("1", enumerator.toString())
        .replaceAll("I", ROMAN[enumerator - 1] || enumerator.toString())
        .replaceAll("i", ROMAN[enumerator - 1].toLowerCase() || enumerator.toString())
        .replaceAll("A", ALPHA[enumerator - 1] || enumerator.toString())
        .replaceAll("a", ALPHA[enumerator - 1].toLowerCase() || enumerator.toString());
        
        //
        // This would be the place to implement other numbering systems!
        //

}
