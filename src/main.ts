/**
 * This file contains some framework stuff and the settings tab, plus the actual functionality for Read Mode.
 */

import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { LawListCMViewPlugin } from 'src/view_plugin';
import { PluginSpec, ViewPlugin } from '@codemirror/view';
import { createCounterStyleRule } from 'src/patterns';

const MAX_LEVEL = 30; // Maximum indentation level that will be affected by the plugin.

export interface LawListSettings {
	ol_input: string[],
	ul_input: string[],
	loop: boolean
}

const DEFAULT_SETTINGS: LawListSettings = {
	ol_input: [],
	ul_input: [],
	loop: true
}

export default class LawListPlugin extends Plugin {
	settings: LawListSettings;
	patternStylesheet: HTMLStyleElement;
	ol_patterns: string[];
	ul_patterns: string[];

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

		// We iterate over the first MAX_LEVEL indentation levels (these are the levels that can be affected by the plugin).
		for (let level = 0; level < MAX_LEVEL; level++) {
			// For each level, if there is a style pattern defined…
			if (this.ol_patterns[level]) {
				// …we implement this pattern into a @counter-style rule…
				let rule = createCounterStyleRule(this.ol_patterns[level]);
				sheet?.insertRule(`@counter-style lawlist_${level} ${rule}`);
				// …and apply it to all OLs in this level.
				// (Indentation levels are - to match what the view plugin does in Edit Mode - counted as the number of LIs in the
				// parent chain, regardless of whether they are in an OL or UL.)
				sheet?.insertRule(`.markdown-rendered ${Array(level).fill("li").join(" ")} ol { list-style: lawlist_${level}; }`);
			} else {
				// If there is no style pattern defined for this level, fallback must be provided.
				// Else, this level would inherit the higher level's style.
				sheet?.insertRule(`.markdown-rendered ${Array(level).fill("li").join(" ")} ol { list-style: decimal; }`)
			}
		}
		// We also set the fallback for the first level beyond MAX_LEVEL.
		// (Generally, the style of the parent level is inherited because of CSS selector specifity.
		// Thus, this rule will style all levels beyond MAX_LEVEL.)
		sheet?.insertRule(`.markdown-rendered ${Array(MAX_LEVEL).fill("li").join(" ")} ol { list-style: decimal; }`);

		// Now the same for ULs.
		for (let level = 0; level < MAX_LEVEL; level++) {
			// But without @counter-style rules, we don't need them for ULs.
			if (this.ul_patterns[level]) {
				sheet?.insertRule(`.markdown-rendered ${Array(level).fill("li").join(" ")} ul.has-list-bullet > li::marker { color: var(--list-marker-color); content: "${this.ul_patterns[level]}"; }`);
				sheet?.insertRule(`.markdown-rendered ${Array(level).fill("li").join(" ")} ul > li > .list-bullet::after { visibility: hidden; }`);
				// This took me so long to figure out! Obsidian has some strange CSS for ULs that needs to be overridden.
			}
			else {
				sheet?.insertRule(`.markdown-rendered ${Array(level).fill("li").join(" ")} ul.has-list-bullet > li::marker { content: ""; }`);
				sheet?.insertRule(`.markdown-rendered ${Array(level).fill("li").join(" ")} ul > li > .list-bullet::after { visibility: visible; }`);
			}
		}
		sheet?.insertRule(`.markdown-rendered ${Array(MAX_LEVEL).fill("li").join(" ")} ul.has-list-bullet > li::marker { content: ""; }`);
		sheet?.insertRule(`.markdown-rendered ${Array(MAX_LEVEL).fill("li").join(" ")} ul > li > .list-bullet::after { visibility: visible; }`);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		this.computePatterns();
		// this.settings.ol_input = this.settings.ol_input; // What was this for? Should have no effect.
	}

	computePatterns() {
		const test = (s: string) => !! (s && s.trim().length > 0);

		const ol = this.settings.ol_input.slice(0, this.settings.ol_input.findLastIndex(test) + 1);
		this.ol_patterns = ol.slice();
		if (this.settings.loop) while (this.ol_patterns.length < MAX_LEVEL)
			this.ol_patterns.push(ol[this.ol_patterns.length % ol.length]);
		
		const ul = this.settings.ul_input.slice(0, this.settings.ul_input.findLastIndex(test) + 1);
		this.ul_patterns = ul.slice();
		if (this.settings.loop) while (this.ul_patterns.length < MAX_LEVEL)
			this.ul_patterns.push(ul[this.ul_patterns.length % ul.length]);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.computePatterns();
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
		desc.appendText("Need help? Check the ");
		desc.appendChild(createEl("a", { text: "README", href: "https://github.com/willem-schlieter/lawlist" }));
		desc.appendText("!");
		desc.appendChild(createEl("br"));
		desc.appendChild(createEl("br"));

		new Setting(containerEl).setName("Ordered List Styles").setHeading();
		const desc2 = containerEl.createEl("p");
		desc2.classList.add("lawlist-settings-desc");
		desc2.appendText("For each indentation level in ordered lists, type in the first enumerator. Supported numbering systems are:");
		desc2.appendChild(createEl("code", { text: " 1, I, i, ①, A, AA, a, aa" }));
		desc2.appendText(". Enumerators can also include other characters as prefix/suffix, e.g. ");
		desc2.appendChild(createEl("code", { text: "(a) " }));
		desc2.appendText(" or ");
		desc2.appendChild(createEl("code", { text: "I. " }));
		desc2.appendText(".");
		for (let i = 0; i < 10; i++) {
			new Setting(containerEl)
			.setName(`Level ${i}`)
			.addText(text => text
				.setPlaceholder('1. ')
				.setValue(this.plugin.settings.ol_input[i] || "")
				.onChange(async (value) => {
					this.plugin.settings.ol_input[i] = value || "";
					await this.plugin.saveSettings();
				}));
		}
		new Setting(containerEl).setName("Unordered List Styles").setHeading();
		const desc3 = containerEl.createEl("p");
		desc3.classList.add("lawlist-settings-desc");
		desc3.appendText("For each indentation level in unordered lists, type in any character/sequence as bullet.");
		for (let i = 0; i < 10; i++) {
			new Setting(containerEl)
			.setName(`Level ${i}`)
			.addText(text => text
				.setPlaceholder('• ')
				.setValue(this.plugin.settings.ul_input[i] || "")
				.onChange(async (value) => {
					this.plugin.settings.ul_input[i] = value || "";
					await this.plugin.saveSettings();
				}));
		}

		new Setting(containerEl)
		.setName("Loop styles").setHeading()
		.setDesc(`If enabled, your sequence of styles will be looped for higher levels, but only for ${MAX_LEVEL} levels. Otherwise, unset levels will default to decimal.`)
		.addToggle(toggle => toggle
			.setValue(this.plugin.settings.loop)
			.onChange(async (value) => {
				this.plugin.settings.loop = value;
				await this.plugin.saveSettings();
			}));
	}
}
