# LawList: advanced ordered lists in Edit Mode

Obsidian natively only supports ordered lists with enumeration style "1. ".
For structured notes with nested lists, this can be annoying.

LawList adds support for other enumeration styles such as letters, roman numbers,
or enumerators in parantheses.

The enumeration style for each indentation level
can be freely configured in the settings tab. Plus, enumeration styles can be
customized for single list items from inside the document.

## What this plugin actually does to Markdown

Nothing. The actual Markdown source code of the note stays unchanged, the plugin only
affects the visual rendering in Edit Mode. It does not add real "support" for
other list styles in the Markdown syntax (which is probably only possible by changing
the Obsidian code itself), the plugin just injects some visual changes. Thus, to start
an ordered list item, you still have to type "1. ". As soon as the line is recognised
as a list item, the plugin changes its appearance to the configured style.

## Name

As a law student writing everythin in German "legal opition" style structure, I was
particularly annoyed by this functionality missing. It felt like a nerdy thing, but
I found some people searching for that online, so it seems like people do need it.

## Using this plugin

Currently, the plugin is not published to Obsidian, so to use it, clone this repository,
place it into the vault folder at `.obsidian/plugins` and build using `npm run build`.

## Known bugs / issues / missing features

- No effects in Read Mode / PDF Export yet.
- Would be nice if the enumerators could be positioned according to their width, so that
the actual text in the list item always starts at the same X position. (Currently, e.g. 
text in a li with number 10. starts a bit later because "10." is larger than "9.".)