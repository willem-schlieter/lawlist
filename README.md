# LawList: Custom List Styles

This is a plugin for [Obsidian](https://obsidian.md/). It allows you to customise the style of ordered lists in Edit Mode and Read Mode.

Obsidian natively only supports ordered lists with simple numbering such as `1. `. For structured notes with nested lists, this can be insufficient. LawList adds support for other enumeration styles such as uppercase/lowercase letters, roman numbers, or enumerators in parantheses.

## How to use this plugin

After installation, open the settings tab for "LawList: Custom List Styles". There you can freely configure different list styles for up to 10 indentation levels.

In the corresponding input field, type in a list style pattern. Once you have made your settings, go to your note and type `1. `&nbsp;to start an ordered list item. As soon as it is recognised, the plugin will change the visual appearance to match your preferences.

### How list style patterns work
List style patterns are simply the first enumerator you would like to get, such as `a. `, `I. `, `(1)` or `i)`.

Patterns can be composed of
- a character indicating the desired numbering system, supported are:
    - arabic numbers (1, 2, 3)
    - roman number (I, II, III as well as i, ii, iii)
    - letters (A, B, C as well as a, b, c)
    - double letters (AA, BB, CC as well as aa, bb, cc)
- other characters such as parantheses, dots, hyphens…

### Inline custom styles

You can also style individual list items by typing a list style pattern in `{`curly&nbsp;braces`}` right at the start of the item. For instance, `1. {a. } Text` will be displayed as `a. Text`.

## What this plugin actually does to Markdown syntax

Nothing. The actual Markdown source code of the note stays unchanged, the plugin only modifies the visual rendering. Thus, to start an ordered list item, you still have to type `1. `. As soon as the line is recognised as a list item, the plugin changes its appearance to the configured style.

## Plugin name

As a law student writing everything in "legal opinion" style, I was particularly annoyed by this functionality missing.
Of course, the plugin is useful for everyone using ordered lists!

## Installation from GitHub

Until the plugin is available directly at the Obsidian website, you can use this plugin by downloading this repository, placing it into the vault folder at `.obsidian/plugins` and running `npm install; npm run build`.

## Known issues / upgrade path

- **If you are missing a numbering system** (besides arabic, roman, letter, double letter): **This is quite easy to implement, create a feature request or implement it yourself in** [patterns.ts](https://github.com/willem-schlieter/lawlist/blob/master/patterns.ts).
- In Read Mode, in-text custom patterns have no effect, instead, the global setting is used.
- Would be nice if custom style patterns could be defined for a particular document or list, not only globally or individually (in curly braces).
- Loop through the 10 level-specific patterns instead of falling back to decimal for levels higher than 9. ([Feature Request](https://github.com/willem-schlieter/lawlist/issues/7))