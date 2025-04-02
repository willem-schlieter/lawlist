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
import { text } from 'stream/consumers';

class LawListWidget extends WidgetType {
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

class LawlistCMPlugin implements PluginValue {
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

        for (let { from, to } of view.visibleRanges) {
            syntaxTree(view.state).iterate({
                from,
                to,
                enter(node) {
                    const read = (node: SyntaxNode | SyntaxNodeRef): string => view.state.doc.sliceString(node.from, node.to);
                    if (node.type.name.startsWith("formatting_formatting-list_formatting-list-ol_list-")) {
                        const enumerator = Number.parseInt(view.state.doc.sliceString(node.from, node.to - 2));
                        const indentLevel = Number.parseInt(((node.node.parent?.type.name || "").match(/\d+$/) || [""])[0]);
                        if (Number.isNaN(indentLevel)) throw new Error(`Node indentation level not found.`);
                        
                        const textNode = node.node.nextSibling;
                        // Custom Styles can be set by writing a pattern in { } at the beginning of the line.
                        // (The pattern notation is hidden and applied as soon as it is recognised.)
                        const custom = ((textNode ? read(textNode) : "").match(/^\{(.*)\}/) || ["", ""])[1];
                        // // This was for layout debugging / comparison.
                        // let render = ! (textNode && read(textNode)[0] === "ö");
                        // if (! render) return;

                        if (custom) {
                            builder.add(
                                node.from,
                                node.to + custom.length + 2,
                                Decoration.replace({
                                    widget: new LawListWidget(enumerator, indentLevel -1, custom)
                                })
                            );
                        } else {
                            builder.add(
                                node.from,
                                node.to,
                                Decoration.replace({
                                    widget: new LawListWidget(enumerator, indentLevel - 1)
                                })
                            );
                        }
                    }
                }
            });
        }

        return builder.finish();
    }
}

const pluginSpec: PluginSpec<LawlistCMPlugin> = {
    decorations: (value: LawlistCMPlugin) => value.decorations,
};

export const lawlistCMPlugin = ViewPlugin.fromClass(
    LawlistCMPlugin,
    pluginSpec
);