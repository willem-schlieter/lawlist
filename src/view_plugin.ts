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
import { renderPattern } from "src/patterns";
import type { SyntaxNode, SyntaxNodeRef } from "@lezer/common";
import type LawListPlugin from './main';

class LawListEnumeratorWidget extends WidgetType {
    constructor (private enumerator: number, private pattern: string) { super(); }
    toDOM(view: EditorView): HTMLElement {
        const div = document.createElement('span');
        
        // For some styling in `styles.css`.
        div.classList.add("lawlist-olchar");

        // div.innerText = parsePattern(this.customPattern || store.patterns[this.indentLevel] || "1. ", this.enumerator);
        div.innerText = renderPattern(this.pattern || "1. ", this.enumerator);

        return div;
    }
}
class LawListULWidget extends WidgetType {
    constructor (private listchar: string) { super(); }
    toDOM(view: EditorView): HTMLElement {
        const div = document.createElement('span');
        // For some styling in `styles.css`.
        div.classList.add("lawlist-ulchar");
        div.innerText = this.listchar || "• ";
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
        const read = (node: SyntaxNode | SyntaxNodeRef): string => view.state.doc.sliceString(node.from, node.to);
        
        // We have to declare these references because this.obsPlugin cannot be accessed from within the `enter` closure below.
        const ol_patterns = this.obsPlugin.ol_patterns;
        const ul_patterns = this.obsPlugin.ul_patterns;

        for (let { from, to } of view.visibleRanges) {
            syntaxTree(view.state).iterate({
                from,
                to,
                enter(node) {
                    const ol = (node.type.name.startsWith("formatting_formatting-list_formatting-list-ol_list-"));
                    const ul = (node.type.name.startsWith("formatting_formatting-list_formatting-list-ul_list-"));
                    if (ol || ul) {
                        const ol_enumerator = Number.parseInt(view.state.doc.sliceString(node.from, node.to - 2)); // NaN if ul.
                        
                        // Useless so far, but maybe later for customization through listchar -/*/+.
                        // const ul_listchar = view.state.doc.sliceString(node.from, node.to - 1);
                        
                        let indentLevel = Number.parseInt(((node.node.parent?.type.name || "").match(/\d+$/) || [""])[0]) - 1;
                        if (Number.isNaN(indentLevel)) throw new Error(`Node indentation level not found.`);
                        
                        // Custom Styles can be set by writing a pattern in { } at the beginning of the line.
                        // (The pattern notation is hidden and applied as soon as it is recognised.)
                        const textNode = node.node.nextSibling;
                        const custom = ((textNode ? read(textNode) : "").match(/^\{(.*)\}/) || ["", ""])[1];

                        // Skip this node if cursor is touching the enumerator.
                        if (view.state.selection.ranges.filter(
                            r => r.from < node.to + custom.length + (custom ? 2 : 0) && r.to > node.from - 1
                        ).length) return;

                        if (ul && (custom || ul_patterns[indentLevel])) {
                            builder.add(
                                node.from,
                                node.to + (custom ? custom.length + 2 : 0), // If custom is defined, hide it as well.
                                Decoration.replace({
                                    widget: new LawListULWidget(custom || ul_patterns[indentLevel])
                                })
                            );
                        } else if (ol && (custom || ol_patterns[indentLevel])) {
                            builder.add(
                                node.from,
                                node.to + (custom ? custom.length + 2 : 0), // If custom is defined, hide it as well.
                                Decoration.replace({
                                    widget: new LawListEnumeratorWidget(ol_enumerator, custom || ol_patterns[indentLevel])
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