/**
 * This module is currently used as a "global" store of the Plugin settings.
 * `store` is modified by the user via the settings tab (main.ts) and read in view_plugin.ts.
 * This is probably not best practise, but I couldn't figure out how to properly communicate
 * with the CM View Plugin from within main.ts.
 */

interface Store {
    /**
     * The enumerator patterns (such as `1. ` or `(A) `) for all indentation levels.
     */
    patterns: string[]
}

export const store: Store = {
    patterns: []
}