# LawList: advanced ordered lists in Edit Mode

Obsidian natively only supports ordered lists with enumeration style "1. ".
For structured notes with nested lists, this can be annoying.

LawList adds support for other enumeration styles such as letters, roman numbers,
or enumerators in parantheses. The enumeration style for each indentation level
can be freely configured in the settings tab.

The actual Markdown source code of the note stays unchanged, the plugin only affects
the visual rendering in Edit Mode / Life Preview. It does not add real "support" for
other list styles, just injects some visual changes. Thus, to start an ordered list,
you still have to type "1. ". As soon as the line is recognised as a list item, the
plugin changes its appearance to the configured style.

## Name

As a law student writing everythin in German "legal opition" style structure, I was
particularly annoyed by this functionality missing. It felt like a nerdy thing, but
I found some people searching for that online, so it seems like people do need it.

## Known bugs / issues / missing features
- No effects in Read Mode / PDF Export yet.
- Layout: Enumerators are shifted a bit left, compared to the native numbering. This
makes the layout a bit strange if you mix in unordered list items (with "-").
- If you type in "1.", the list item is recognised and visually converted as expected,
but the cursor is (visually, not really) placed in front of the enumerator.
- If you type in "1. " (the above, now with trailing space), the list item is not
recognised by the plugin anymore, so there is no conversion, you just see "1. ".
Once you start typing text, everything works fine.