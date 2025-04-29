/**
 * This is a CodeMirror Editor Extension ["View Plugin"](https://docs.obsidian.md/Plugins/Editor/View+plugins).
 * It is loaded in main.ts and contains the actual functionality for Edit Mode.
 */

import { syntaxTree } from '@codemirror/language';
import { RangeSetBuilder } from '@codemirror/state';
import {
    Decoration,
    DecorationSet,
    EditorView,
    PluginValue,
    ViewUpdate,
    WidgetType,
} from '@codemirror/view';
import parsePattern from "src/patterns";
import type { SyntaxNode, SyntaxNodeRef } from "@lezer/common";
import type LawListPlugin from './main';

class LawListEnumeratorWidget extends WidgetType {
    constructor (private enumerator: number, private pattern: string) { super(); }
    toDOM(view: EditorView): HTMLElement {
        const div = document.createElement('span');
        
        // For some styling in `styles.css`.
        div.classList.add("lawlist-olchar");

        // div.innerText = parsePattern(this.customPattern || store.patterns[this.indentLevel] || "1. ", this.enumerator);
        div.innerText = parsePattern(this.pattern || "1. ", this.enumerator);

        return div;
    }
}

export class LawListCMViewPlugin implements PluginValue {
    decorations: DecorationSet;

    constructor(view: EditorView, private obsPlugin: LawListPlugin) {
        this.decorations = this.buildDecorations(view);
    }

    update(update: ViewUpdate) {
        this.decorations = this.buildDecorations(update.view);
    }

    destroy() { }

    buildDecorations(view: EditorView): DecorationSet {
        const builder = new RangeSetBuilder<Decoration>();
        
        // We have to declare this reference because this.obsPlugin cannot be accessed from within the `enter` closure below.
        const patterns = this.obsPlugin.settings.patterns;

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

                        builder.add(
                            node.from,
                            node.to + (custom ? custom.length + 2 : 0), // If cutsom is defined, hide it as well.
                            Decoration.replace({
                                widget: new LawListEnumeratorWidget(enumerator, custom || patterns[indentLevel - 1])
                            })
                        );
                    }
                }
            });
        }

        return builder.finish();
    }
}