# Changes in v1.1.0 compared to master as it was proposed to Obsidian

- Read Mode: Enable enumerator color.
- Edit Mode: Skip LI in rendering process and show original source if cursor or selection touching the enumerator or inlineConfig.
- Skip LI in rendering process and show original numbering if `inlineConfig === {!}`.
- Read Mode: Add support for inlineConfigs (`{pattern}` or `{!}`).
- I tried to implement a toggle setting to set if the enumerators should be marked in green or follow the color convention for list markers, but it did not work yet.