# Requested changes in review process
- [x] Remove settings heading. (Revise settings in general.)
- [x] Enhance plugin <> editor extension communication by passing arguments into the View Plugin constructor.
- [x] Clean up the generated stylesheet.
- [x] Remove the limit for counters to be rendered (was 15).
- [x] Change counter color in Edit Mode to `list-marker-color`.
- [x] Move source files to `src`.
- [x] Use `@counter-style` rules instead of styling every single LI and cluttering the document with stylesheets.

# Changes for v1.0.0 (June 2025)
- [x] Edit Mode: Skip LI in rendering process and show original source if cursor or selection touching the enumerator.
- [x] Loop through styles instead of defaulting (if switched on in settings).
    - Due to how styles are assigned in Read Mode (fixed CSS selectors), infinite looping is not possible.
    - Thus, now there are only 3 "rounds" – from indent level 30 on, enumerators default to "1. ".
    - (Looping is limited in Edit Mode as well to make it consistent.)
- [x] Support circled numbers. (Only up to 50 items, larger enumerators will default to decimal.)
- [ ] Support unordered lists.