/**
 * This is a CodeMirror Editor Extension ["View Plugin"](https://docs.obsidian.md/Plugins/Editor/View+plugins).
 * It is loaded in main.ts and contains all the actual functionality.
 */

import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import {
    Decoration,
    DecorationSet,
    EditorView,
    PluginSpec,
    PluginValue,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
} from '@codemirror/view';
import { parsePattern, store } from "patterns";
import type { SyntaxNode, SyntaxNodeRef } from "@lezer/common";

class LawListEnumeratorWidget extends WidgetType {
    constructor (private enumerator: number, private indentLevel: number, private customPattern?: string) { super(); }
    toDOM(view: EditorView): HTMLElement {
        // There is some weird layout stuff going on at the moment. Enumerators are too far left, idk why.
        const div = document.createElement('span');
        
        // For some styling in `styles.css`.
        div.classList.add("lawlist-olchar");

        div.innerText = parsePattern(this.customPattern || store.patterns[this.indentLevel] || "1. ", this.enumerator);

        return div;
    }
}

class LawListCMViewPlugin implements PluginValue {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
        this.decorations = this.buildDecorations(update.view);
    }

    destroy() { }

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();

        // Would be nice if specifying a custom style for one li would affect all lis in that indent level.
        // const customs: string[] = [];

        /** Little helper to read the text content of a node. */
        const read = (node: SyntaxNode | SyntaxNodeRef): string => view.state.doc.sliceString(node.from, node.to);

        for (let { from, to } of view.visibleRanges) {
            syntaxTree(view.state).iterate({
                from,
                to,
                enter(node) {
                    if (node.type.name.startsWith("formatting_formatting-list_formatting-list-ol_list-")) {
                        // Get the enumerator and indentation level of the LI.
                        const enumerator = Number.parseInt(view.state.doc.sliceString(node.from, node.to - 2));
                        const indentLevel = Number.parseInt(((node.node.parent?.type.name || "").match(/\d+$/) || [""])[0]);
                        if (Number.isNaN(indentLevel)) throw new Error(`Node indentation level not found.`);
                        
                        // Custom Styles can be set by writing a pattern in { } at the beginning of the line. ("inlineConfig")
                        // (The inlineConfig is hidden and applied as soon as it is recognised.)
                        const textNode = node.node.nextSibling;
                        const inlineConfig = ((textNode ? read(textNode) : "").match(/^\{(.*)\}/) || [, ""])[1] || "";
                        
                        // If there is a cursor inside the LIs enumerator or inlineConfig, or a selection containing at least
                        // a part of them, the original source should be visible.
                        if (view.state.selection.ranges.filter(
                            r => r.from < node.to + inlineConfig.length + (inlineConfig ? 2 : 0) && r.to > node.from - 1
                        ).length) return;
                        
                        // If you specify "{!}" as inline config, the LI is not modified.
                        if (textNode && inlineConfig === "!") builder.add(
                            // We just need to hide the inlineConfig.
                            textNode.from,
                            textNode.from + inlineConfig.length + 2,
                            Decoration.replace({})
                        );
                        else if (inlineConfig) builder.add(
                            node.from,
                            // We need to hide the inlineConfig…
                            node.to + inlineConfig.length + 2,
                            Decoration.replace({
                                // …and render the enumerator.
                                widget: new LawListEnumeratorWidget(enumerator, indentLevel -1, inlineConfig)
                            })
                        );
                        else builder.add(
                            node.from,
                            node.to,
                            Decoration.replace({
                                // No inlineConfig, we just render the enumerator according to the global settings.
                                widget: new LawListEnumeratorWidget(enumerator, indentLevel - 1)
                            })
                        );
                    }
                }
            });
        }

        return builder.finish();
    }
}

const pluginSpec: PluginSpec<LawListCMViewPlugin> = {
    decorations: (value: LawListCMViewPlugin) => value.decorations,
};

export const lawListCMViewPlugin = ViewPlugin.fromClass(
    LawListCMViewPlugin,
    pluginSpec
);