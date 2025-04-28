/**
 * This just contains some framework stuff and the settings tab.
 * For the actual functionality, see `view_plugin.ts`.
 */

import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { LawListCMViewPlugin } from 'src/view_plugin';
import { store, parsePattern } from 'src/patterns';
import {
    PluginSpec,
    ViewPlugin
} from '@codemirror/view';

interface LawListSettings {
	patterns: string[]
}

const DEFAULT_SETTINGS: LawListSettings = {
	patterns: []
}

export default class LawListPlugin extends Plugin {
	settings: LawListSettings;
	patternStylesheet: HTMLStyleElement;

	async onload() {
		// Load saved settings
		await this.loadSettings();

		// Add the settings tab for style customisation.
		this.addSettingTab(new LawListSettingsTab(this.app, this));

		// Register the view plugin (for Edit Mode).
		const pluginSpec: PluginSpec<LawListCMViewPlugin> = {
			decorations: (value: LawListCMViewPlugin) => value.decorations,
		};
		const editorExtension = ViewPlugin.fromClass(
			LawListCMViewPlugin,
			pluginSpec
		);
		this.registerEditorExtension(editorExtension);

		// this.registerEditorExtension(ViewPlugin.define((view) => new LawListCMViewPlugin(view, this)));
		// This would be nicer, passing the Obsidian plugin (including the pattern settings) into the view plugin
		// instead of using the workaround with `store`. But it does not work. If I register the CM editor extension
		// this way and read the patterns from the passed reference to the obsidian plugin, there is no effect in Edit
		// Mode - I suppose because the decorations are not found since there is no pluginSpec.
		// So: Is there any way to pass paramters into the View Plugin constructor while also applying the pluginSpec?

		// Create a stylesheet that will define all the list styles.
		this.patternStylesheet = document.head.appendChild(document.createElement("style"));
		// Initially fill it.
		this.updatePatternStylesheet(false);
	}

	onunload() {
		// Clean up the stylesheet.
		document.head.removeChild(this.patternStylesheet);
	}

	/** Updates the pattern stylesheet according to the current settings. */
	updatePatternStylesheet(empty: boolean) {
		let sheet = this.patternStylesheet.sheet;
		if (empty) while (sheet?.cssRules.length) sheet.deleteRule(0);
		// We iterate over all the indentation levels that can be styled. 
		for (let level = 0; level < 10; level++) {
			// For each level, if the is a style pattern defined…
			if (store.patterns[level]) {
				// …we implement this pattern into a @counter-style rule…
				sheet?.insertRule(`@counter-style lawlist_${level} { system: fixed; suffix: ""; symbols: ${Array(26).fill("").map((_, ix) => `"${parsePattern(store.patterns[level] || "1.", ix + 1)}"`).join(" ")}; }`);
				// …and apply it to all OLs in this level. (Now, indentation levels are counted only by OL ancestors. Nesting levels in ULs will be ignored.)
				sheet?.insertRule(`${Array(level + 1).fill("ol").join(" ")} { list-style: lawlist_${level}; }`);
			} else {
				// If there is no style pattern defined for this level, fallback must be provided.
				// Else, this level would inherit the higher level's style.
				sheet?.insertRule(`${Array(level + 1).fill("ol").join(" ")} { list-style: decimal; }`)
			}
		}
		// We also need to set the fallback for the indentation levels higher than 9.
		sheet?.insertRule("ol ol ol ol ol ol ol ol ol ol ol { list-style: decimal; }");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		store.patterns = this.settings.patterns;
	}

	async saveSettings() {
		store.patterns = this.settings.patterns; // afaik this should be unnecessary, but seems like it is.
		this.updatePatternStylesheet(true);
		await this.saveData(this.settings);
	}
}

class LawListSettingsTab extends PluginSettingTab {
	plugin: LawListPlugin;

	constructor(app: App, plugin: LawListPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const desc = containerEl.createEl("p");
		desc.classList.add("lawlist-settings-desc");
		desc.appendText("Customize the enumeration style for ordered lists. For every indentation level, type in a style pattern containing decimal numbers, roman numbers or letters, which is simply the first enumerator. E.g. use ");
		desc.appendChild(createEl("code", { text: "1. " }));
		desc.appendText(", ");
		desc.appendChild(createEl("code", { text: "(a) " }));
		desc.appendText(" or ");
		desc.appendChild(createEl("code", { text: "i) " }));
		desc.appendText(".");
		desc.appendChild(createEl("br"));
		desc.appendChild(createEl("br"));
		desc.appendText("Fallback style for layers without specification is ")
		desc.appendChild(createEl("code", { text: "1. " }));
		desc.appendText(".");
		desc.appendChild(createEl("br"));
		desc.appendChild(createEl("br"));
		desc.appendText("You can also customize the style for a single list item by typing the style pattern inside curly braces at the start of the list item. Example: ");
		desc.appendChild(createEl("code", { text: "1. {a. }Text text text." }));
		desc.appendText(" would be displayed as ");
		desc.appendChild(createEl("code", { text: "a. Text text text." }));

		for (let i = 0; i < 10; i++) {
			new Setting(containerEl)
				.setName(`Level ${i}`)
				.addText(text => text
					.setPlaceholder('1. ')
					.setValue(this.plugin.settings.patterns[i] || "")
					.onChange(async (value) => {
						this.plugin.settings.patterns[i] = value || "";
						await this.plugin.saveSettings();
					}));
		}

	}
}
