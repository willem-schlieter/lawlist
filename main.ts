/**
 * This just contains some framework stuff and the settings tab.
 * For the actual functionality, see `view_plugin.ts`.
 */

import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { lawlistCMPlugin } from 'view_plugin';
import { store, parsePattern } from 'patterns';

interface LawListSettings {
	patterns: string[]
}

const DEFAULT_SETTINGS: LawListSettings = {
	patterns: []
}

export default class LawListPlugin extends Plugin {
	settings: LawListSettings;

	async onload() {
		// Load saved settings
		await this.loadSettings();

		// Add the settings tab for style customisation.
		this.addSettingTab(new SampleSettingTab(this.app, this));

		// Register the view plugin.
		this.registerEditorExtension(lawlistCMPlugin);

		this.registerMarkdownPostProcessor(mainContainer => {
			// Contains all LIs with their index and indentation level
			const listItems: {li: Element, ix: number, level: number}[] = [];

			// Iterate over all the OLs
			Array.from(mainContainer.querySelectorAll("ol")).forEach(ol => {
				// Get the indentation level of the OL
				let level = 0;
				// The OL itself should have a parent.
				let parent = ol.parentElement;
				if (! parent) throw new Error("This OL has no parent.");
				// Now we have to count the OL/UL elements in the parent chain up to mainContainer.
				// If the OL's direct parent is the mainContainer, indentation level stays 0.
				while (parent !== mainContainer) {
					if (parent === null) throw new Error("Parent chain interrupted before mainContainer.");
					// Should ULs be considered as well? Or should an indentation level due to nesting in UL not count?
					if (parent.tagName === "OL" || parent.tagName === "UL") level ++;
					parent = parent.parentElement;
				}

				// Get all the LIs that are direct children of that OL
				const lis = Array.from(ol.children).filter(e => e.tagName === "LI");
				// Register the LIs to "listItems"
				lis.forEach((li, index) => listItems.push({li, ix: index + ol.start, level}));
			});

			// Now we have to give every LI a unique ID and style it according to its ix and level
			// by dynamically generating a <style> sheet adressing all the LIs individually.
			const stylesheet = document.createElement("style");
			document.head.appendChild(stylesheet);
			const sheet = stylesheet.sheet;
			if (! sheet) throw new Error("Why is there no sheet?");
			listItems.forEach((item, id) => {
				// Assign an individual id
				item.li.classList.add("lawlist-li-id-" + id);
				// Insert CSS rule to style according to the pattern configured in the settings tab.
				// (In-Text custom patterns not supported yet.)
				sheet.insertRule(`.lawlist-li-id-${id}::marker { content: "${parsePattern(store.patterns[item.level] || "1. ", item.ix)}" }`, sheet.cssRules.length);
			});
		});
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		store.patterns = this.settings.patterns;
	}

	async saveSettings() {
		store.patterns = this.settings.patterns; // afaik this should be unnecessary, but seems like it is.
		await this.saveData(this.settings);
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: LawListPlugin;

	constructor(app: App, plugin: LawListPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "LawList Settings" });
		const desc = containerEl.createEl("p");
		desc.classList.add("lawlist-settings-desc");
		desc.appendText("Customize the enumeration style for ordered lists! For every indentation level, type in a style pattern, which is simply the first enumerator, such as ");
		desc.appendChild(createEl("code", { text: "1. " }));
		desc.appendText(", ");
		desc.appendChild(createEl("code", { text: "(a) " }));
		desc.appendText(" or ");
		desc.appendChild(createEl("code", { text: "i) " }));
		desc.appendText(" (roman numbers.)");
		desc.appendChild(createEl("br"));
		desc.appendChild(createEl("br"));
		desc.appendText("Fallback style for layers without specification is '1. '.")
		desc.appendChild(createEl("br"));
		desc.appendChild(createEl("br"));
		desc.appendText("You can also customize the style for a single list item by typing the style pattern inside curly braces at the start of the list item. Example: ");
		desc.appendChild(createEl("code", { text: "1. {a. }Text text text." }));
		desc.appendText(" would be displayed as ");
		desc.appendChild(createEl("code", { text: "a. Text text text." }));


		for (let i = 0; i < 10; i++ ) {
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
