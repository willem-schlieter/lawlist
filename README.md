# LawList: Custom List Styles

This is a plugin for [Obsidian](https://obsidian.md/). It allows you to customise the style of ordered lists in Edit Mode and Read Mode.

Obsidian natively only supports ordered lists with simple numbering such as `1. `. For structured notes with nested lists, this can be insufficient. LawList adds support for other enumeration styles such as uppercase/lowercase letters, roman numbers, or enumerators in parantheses.

## How to use this plugin

After installation, open the settings tab for "LawList: Custom List Styles". There you can freely configure different list styles for up to 10 indentation levels.

In the corresponding field, type in a list style pattern that simply equals the first enumerator you would like to get, such as `a. `, `I. `, `(1)` or `i)`. Supported numbering systems are
- arabic numbers (1, 2, 3)
- roman uppercase (I, II, III)
- roman lowercase (i, ii, iii)
- uppercase letters (A, B, C) and
- lowercase letters (a, b, c).

You can freely add other characters such as parantheses, dots, hyphens…

Once you have made your settings, got to your note and type `1. `&nbsp;to start an ordered list item. As soon as it is recognised, the plugin will change the visual appearance to match your preferences.

### Inline custom styles

You can also style individual list items by typing a list style pattern in `{`curly&nbsp;braces`}` right at the start of the item. For instance, `1. {a. } Text` will be displayed as `a. Text`.

## What this plugin actually does to Markdown syntax

Nothing. The actual Markdown source code of the note stays unchanged, the plugin only modifies the visual rendering. Thus, to start an ordered list item, you still have to type "1. ". As soon as the line is recognised as a list item, the plugin changes its appearance to the configured style.

## Plugin name

As a law student writing everything in "legal opinion" style, I was
particularly annoyed by this functionality missing. Of course, the plugin is useful for everyone using ordered lists!

## Installation from GitHub

Until the plugin is available directly at the Obsidian website, you can use this plugin by downloading this repository, placing it into the vault folder at `.obsidian/plugins` and running `npm install; npm run build`.

## Known issues / missing features

- **If you miss a numbering system** (besides 1, I, i, A and a): **This is quite easy to implement, give me a hint or create a pull request** for [patterns.ts](https://github.com/willem-schlieter/lawlist/blob/master/patterns.ts).
- In Read Mode, in-text custom patterns have no effect, instead, fallback is the global setting.
- In Read Mode, nested lists that start with another enumerator than 0 are not recognised. (The Markdown engine itself does not recognise those as lists.) Lists starting with higher numbers are only supported at indentation level 0.
- Would be nice if the enumerators could be positioned according to their width, so that the actual text in the list item always starts at the same X position. (Currently, e.g. text in a li with number 10. starts a bit later because "10." is broader than "9.".)
- Would be nice if custom style patterns could be defined for a particular document or list, not only globally or individually (in curly braces).