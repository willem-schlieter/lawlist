# Build and release

- [x] Add `.github/workflows/release.yml`, matching the one Obsidian ships in
  its sample plugin. It builds on a tag, attests `main.js` and `styles.css`, and
  opens a draft release with those two plus `manifest.json`. The releases so far
  were built by hand, which is why the scorecard reports two release assets
  without a GitHub artifact attestation.
- [x] The workflow also fails if the committed `styles.css` does not match what
  the build produces, so the generated file cannot drift from its sources.
- [x] Replace the `builtin-modules` dependency with `builtinModules` from
  `node:module`, which has been in Node since 9.3.
- [x] Fix the package metadata, which still described the Obsidian sample
  plugin. The version was also stuck at 1.0.0, which matters because
  `version-bump.mjs` copies it into `manifest.json`.

# Lint and type hygiene

Clears the warnings the community plugin scorecard reports, other than the
forbidden `style` element, which is handled separately.

- [x] Build the Edit Mode widgets with `createSpan()` and adopt them into the
  editor's own document, so popout windows get nodes that belong to them. This
  also uses the `view` argument that was previously ignored.
- [x] Declare `@codemirror/language`, `@codemirror/state`, `@codemirror/view` and
  `@lezer/common`. They were imported but never declared, which is why
  `SyntaxNode` and `SyntaxNodeRef` resolved to error types acting as `any`.
  `@codemirror/state` and `@codemirror/view` are pinned to the versions
  `obsidian` requires as peers.
- [x] Drop `codemirror` and `@codemirror/stream-parser`. Neither is imported, and
  the latter was pulled from a raw GitHub URL.
- [x] Type the settings load instead of assigning the `any` that `Object.assign`
  returns, and copy the arrays so the settings tab no longer writes through into
  `DEFAULT_SETTINGS`.
- [x] Sentence case for the two settings headings.
- [x] `prefer-const` throughout.
# Read Mode without a runtime stylesheet

Obsidian does not allow plugins to create and attach `style` elements, which is
what the Read Mode styling was built on.

- [x] Move every selector into `styles.css`, which Obsidian loads for us.
  `scripts/build-styles.mjs` generates one block of rules per indentation level
  from `src/styles.src.css`.
- [x] Express list styles as `::marker` content driven by one custom property per
  level, written onto the body by `main.ts`. Only the values change at runtime.
- [x] Declare the three non-built-in numbering systems (circled, `AA`, `aa`) as
  static `@counter-style` rules instead of building them per level.
- [x] Apply the properties to popout windows too, which the old stylesheet never
  reached.
- [x] Escape user input before it goes into CSS. A pattern containing `"` or `\`
  used to break the rule it landed in.
- [x] Levels past the configured depth now keep Obsidian's own markers rather
  than being forced to decimal, so themes and `--list-numbered-style` still apply.

# Requested changes in review process
- [x] Remove settings heading. (Revise settings in general.)
- [x] Enhance plugin <> editor extension communication by passing arguments into the View Plugin constructor.
- [x] Clean up the generated stylesheet.
- [x] Remove the limit for counters to be rendered (was 15).
- [x] Change counter color in Edit Mode to `list-marker-color`.
- [x] Move source files to `src`.
- [x] Use `@counter-style` rules instead of styling every single LI and cluttering the document with stylesheets.

# Changes for v1.1.0 (June 2025)
- [x] Edit Mode: Skip LI in rendering process and show original source if cursor or selection touching the enumerator.
- [x] Loop through styles instead of defaulting (if switched on in settings).
    - Due to how styles are assigned in Read Mode (fixed CSS selectors), infinite looping is not possible.
    - Thus, style settings are only looped to reach 30 levels, enumerators beyond that will fall back to decimal.
    - (Looping is limited in Edit Mode as well to make it consistent.)
- [x] Support circled numbers. (Only up to 50 items, larger enumerators will default to decimal.)
- [x] Support unordered lists.