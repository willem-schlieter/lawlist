/**
 * This file contains some framework stuff and the settings tab, plus the actual functionality for Read Mode.
 */

import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { LawListCMViewPlugin } from 'src/view_plugin';
import { PluginSpec, ViewPlugin } from '@codemirror/view';
import parsePattern from 'src/patterns';

export interface LawListSettings {
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
		this.registerEditorExtension(ViewPlugin.define((view) => new LawListCMViewPlugin(view, this), pluginSpec));

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

		// This, for some reason, does not work. (P) Fallback in Edit Mode is the patter with decimal numbering, here it is just the number.
		// The suffix does not appear…
		sheet?.insertRule("@counter-style decimal_fallback { system: extends decimal; suffix: \". \"; }");
		// We iterate over all the indentation levels that can be styled. 
		for (let level = 0; level < 10; level++) {
			// For each level, if the is a style pattern defined…
			if (this.settings.patterns[level]) {
				// …we implement this pattern into a @counter-style rule…
				sheet?.insertRule(`@counter-style lawlist_${level} { system: fixed; suffix: ""; fallback: decimal_fallback; symbols: ${Array(26).fill("").map((_, ix) => `"${parsePattern(this.settings.patterns[level] || "1.", ix + 1)}"`).join(" ")}; }`);
				// …and apply it to all OLs in this level.
				// (Indentation levels are - to match what the view plugin does in Edit Mode - counted as the number of LIs in the
				// parent chain, regardless of whether they are in an OL or UL.)
				sheet?.insertRule(`${Array(level).fill("li").join(" ")} ol { list-style: lawlist_${level}; }`);
			} else {
				// If there is no style pattern defined for this level, fallback must be provided.
				// Else, this level would inherit the higher level's style.
				sheet?.insertRule(`${Array(level).fill("li").join(" ")} ol { list-style: decimal; }`)
			}
		}
		// We also need to set the fallback for the indentation levels higher than 9.
		// (Generally, the style of the parent level is inherited because of CSS selector specifity.
		// Thus, this rule will style all levels higher than 9.)
		sheet?.insertRule("li li li li li li li li li li ol { list-style: decimal; }");
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.settings.patterns = this.settings.patterns;
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.updatePatternStylesheet(true);
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
