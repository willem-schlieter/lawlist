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

const MAX = 26; // This is the maximum enumerator that can be parsed - ROMAN and ALPHA should aways have MAX elements!
const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI", "XXII", "XXIII", "XXIV", "XXV", "XXVI"];
const ALPHA = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

/**
 * Parses the concrete enumerator from a style pattern and the actual number of the list item.
 * @param pattern Enumerator style pattern (such as `1. ` or `(A) `.
 * @param e The actual enumeration number.
 */
export function parsePattern(pattern: string, e: number): string {
    return pattern.replaceAll("1", e.toString())
        .replaceAll("I", ROMAN[e - 1] || e.toString())
        .replaceAll("i", ROMAN[e - 1] ? ROMAN[e - 1].toLowerCase() : e.toString())
        .replaceAll("A", ALPHA[e - 1] || e.toString())
        .replaceAll("a", ALPHA[e - 1] ? ALPHA[e - 1].toLowerCase() : e.toString());
        
        //
        // This would be the place to implement other numbering systems!
        //

}
