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
import { store } from "store";


const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV", "XV"];
const ALPHA = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P"];

/**
 * Parses the concrete enumerator from a style pattern and the actual number of the list item.
 * @param pattern Enumerator style pattern (such as `1. ` or `(A) `.
 * @param enumerator The actual enumeration number.
 */
function parsePattern (pattern: string, enumerator: number): string {
    return pattern.replaceAll("1", enumerator.toString())
    .replaceAll("I", ROMAN[enumerator - 1] || enumerator.toString())
    .replaceAll("i", ROMAN[enumerator - 1].toLowerCase() || enumerator.toString())
    .replaceAll("A", ALPHA[enumerator - 1] || enumerator.toString())
    .replaceAll("a", ALPHA[enumerator - 1].toLowerCase() || enumerator.toString());
}

class LawListWidget extends WidgetType {
    constructor (private enumerator: number, private indentLevel: number) { super(); }
    toDOM(view: EditorView): HTMLElement {
        // There is some weird layout stuff going on at the moment. Enumerators are too far left, idk why.
        const div = document.createElement('span');
        
        // For some styling in `styles.css`.
        div.classList.add("lawlist-olchar");

        div.innerText = parsePattern(store.patterns[this.indentLevel] || "1. ", this.enumerator);

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

        for (let { from, to } of view.visibleRanges) {
            syntaxTree(view.state).iterate({
                from,
                to,
                enter(node) {
                    if (node.type.name.startsWith('list')) {
                        // As ul and ol seem not to be differentiated in the SyntaxTree,
                        // we need to check if this is an ol or ul item by analysing the node text content.
                        
                        // Just a litte Helper
                        const char = (ix: number): string => view.state.doc.sliceString(ix, ix + 1);
                        
                        // First, we sort out the ul items.
                        // Lets take this char:
                        let ix = node.from - 2;
                        // If there is some editing going on, there might be whitespace or the enumerator at ix.
                        while (char(ix).match(/\s|\d/)) ix += 1;
                        // Now we should have the */+/- for ul items or the trailing "." for ol items.
                        const liCharIfUL = char(ix);
                        if (liCharIfUL === "*" || liCharIfUL === "-" || liCharIfUL === "+") return;
                        // else if (liCharIfUL !== ".") throw new Error(`Unexpected node: The node from ${node.from} is: "${view.state.doc.sliceString(node.from - 2, node.to)}" – its char "${liCharIfUL}" should be the ul li char "*/+/-", or the trailing "." as in ol items, but it isn't. Node is of type ${node.type.name}. This is an unknown case not yet handled in the plugin.`);
                        // This is necessary as I don't know if there are other "list*" type nodes than these.
                        // In some cases while the current node is being edited, there is some unexpected stuff with the text
                        // content of the node going on. Since I could not figure out how exactly it works, I skip these nodes
                        // instead of throwing. Would be nicer to support nodes while being edited as well, but it only affects
                        // some special cases so it's not too bad.
                        else if (liCharIfUL !== ".") return;

                        // Now we are sure that the current node is an ol item.
                        // Next, let's get the enumerator and its position index:
                        let enumerator: number;
                        // Currently, we have the trailing "." at `ix`.
                        ix --; // now ix = last digit of enumerator
                        // maybe enumerator > 9, so we have two digits
                        if (char(ix - 1).match(/\d/)) {
                            enumerator = Number.parseInt(char(ix - 1) + char(ix));
                            ix --;
                        } else {
                            enumerator = Number.parseInt(char(ix));
                        }
                        const enumeratorPos = ix;
                        
                        // For Layout Comparison
                        // if (enumerator === 3) return;
                        
                        // Next, we need to count whitespace (\t or 4 spaces) to know the indentation level.
                        // (There is node types list-1, list-2, list-3, but the next indent level is list-1 again xO)
                        ix --; // ix = last whitespace char before the enumerator.
                        // \t or 4 space indentation?
                        let spaceIndent = (char(ix) === " ");
                        if (! char(ix).match(/\s?/)) throw new Error(`Unexpected char: The node from ${node.from} ("${view.state.doc.sliceString(node.from - 2, node.to)}") has sth else than space or \\t in front of the enumerator: "${char(ix)}"`);
                        let indentLevel = 0;
                        for (let i = 0; i < (spaceIndent ? 80 : 20); i++) {
                            if (char(ix).match(/^\n?$/)) break;
                            else if (char(ix).match(/ |\t/)) { ix --; indentLevel ++; }
                            else throw new Error(`Unexpected char: While counting the indentations in the node from ${node.from} ("${view.state.doc.sliceString(node.from - 2, node.to)}"), this char occured: "${char(ix)}".`);
                        }
                        if (spaceIndent) indentLevel /= 4;

                        // Great, now we have the enumerator, its pos and the indentation level.
                        // We finish by adding a decoration to replace the enumerator by the style variant.
                        builder.add(
                            enumeratorPos,
                            enumeratorPos + ((enumerator < 10) ? 2 : 3),
                            Decoration.replace({
                                widget: new LawListWidget(enumerator, indentLevel),
                            })
                        );
                    }
                },
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