/**
 * This just contains some framework stuff and the settings tab.
 * For the actual functionality, see `view_plugin.ts`.
 */

import { App, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { lawlistCMPlugin } from 'view_plugin';
import { store } from 'patterns';

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

		// Register the view plugin.
		this.registerEditorExtension(lawlistCMPlugin);

		// Add the settings tab for style customisation.
		this.addSettingTab(new SampleSettingTab(this.app, this));

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
				// .setDesc('It\'s a secret')
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
