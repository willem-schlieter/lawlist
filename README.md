# LawList: Custom List Styles

This is a plugin for [Obsidian](https://obsidian.md/). It allows you to customise the style of ordered and unordered lists in Edit Mode and Read Mode.

Obsidian natively only supports ordered lists with simple numbering such as `1. ` and unordered lists with bullet points `• `. For structured notes with nested lists, this can be insufficient. LawList adds support for other enumeration styles such as uppercase/lowercase letters, roman numbers, or enumerators in parantheses, as well as freely configurable bullet styles for unordered lists.

## Installation

Download this plugin [directly from within Obsidian](obsidian://show-plugin?id=lawlist).

Otherwise you can use the plugin by downloading this [repository](https://github.com/willem-schlieter/lawlist), placing it into the vault folder at `.obsidian/plugins` and running `npm install; npm run build`.

## How to use this plugin

After installation, open the settings tab for "LawList: Custom List Styles" where you can configure different list styles for up to 10 indentation levels.

### Ordered lists

In the first block of 10 input fields, type in a list style pattern for the indentation level you whish to set the style for. Once you have made your settings, go to your note and type `1. `&nbsp;to start an ordered list item. As soon as it is recognised, the plugin will change the visual appearance to match your preferences.

List style patterns are simply the first enumerator you would like to get, such as `a. `, `I. `, `(1)` or `i)`.

Patterns can be composed of
- a character indicating the desired numbering system, supported are:
    - decimal numbers (1, 2, 3)
    - circled numbers (① ② ③)
    - roman number (I, II, III as well as i, ii, iii)
    - letters (A, B, C as well as a, b, c)
    - double letters (AA, BB, CC as well as aa, bb, cc)
- other characters such as parantheses, dots, hyphens…

### Unordered lists

The second block of input fields in the settings tab is for unordered lists. You can enter any character or sequence that will be used as bullet.

### Inline custom styles

You can also style individual list items by typing a list style pattern or a bullet in `{`curly&nbsp;braces`}` right at the start of the item. For instance, `1. {a. } Text` will be displayed as `a. Text`.

## What this plugin actually does to Markdown syntax

Nothing. The actual Markdown source code of the note stays unchanged, the plugin only modifies the visual rendering. Thus, to start an ordered list item, you still have to type `1. `, for unordered list items, type `- `. As soon as the line is recognised as a list item, the plugin changes its appearance to the configured style.

## Plugin name

As a law student writing everything in "legal opinion" style, I was particularly annoyed by this functionality missing.
Of course, the plugin is useful for everyone using lists!

## Known issues / upgrade path

- **If you are missing a numbering system** (besides decimal, circled decimal, roman, letter, double letter): **This is quite easy to implement, create a feature request or implement it yourself in** [patterns.ts](https://github.com/willem-schlieter/lawlist/blob/master/src/patterns.ts).
- In Read Mode, in-text custom patterns have no effect, instead, the global setting is used.
- Custom style patterns (in curly braces) should be applied to a particular document or list, not only to an individual item.