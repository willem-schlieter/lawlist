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



class LawListWidget extends WidgetType {
    constructor (private enumerator: number, private indentLevel: number) { super(); }
    toDOM(view: EditorView): HTMLElement {
        const div = document.createElement('span');

        div.innerText = `${this.enumerator}#${this.indentLevel}`;

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
        // formatLawList();
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
                        // As sth in this part of the code is still weird, I just skip the node instead of throwing...
                        else if (liCharIfUL !== ".") return;

                        
                        // Now we are sure that the current node is an ol item.
                        // Next, we need to count the indentations (\t or 4 spaces) to know the indent level.
                        // (There is node types list-1, list-2, list-3, but the next indent level is list-1 again xO)
                        
                        // Currently, we have the trailing "." at start.
                        // Let's get the enumerator and its position index:
                        let enumerator: number;
                        ix --; // ix = last digit of enumerator
                        // maybe enumerator > 9, so we have two digits
                        if (char(ix - 1).match(/\d/)) {
                            enumerator = Number.parseInt(char(ix - 1) + char(ix));
                            ix --;
                        } else {
                            enumerator = Number.parseInt(char(ix));
                        }
                        const enumeratorPos = ix;
                        
                        // No we count the indentations.
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