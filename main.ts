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

		// Register the view plugin (fror Edit Mode).
		this.registerEditorExtension(lawlistCMPlugin);
		
		// Create and register a MarkdownPostProcessor (for Read Mode).
		this.registerMarkdownPostProcessor((function(){
			// We create a closure to host some variables that should be available to the post processor.
			let mainContainerCounter = 0;
			// Here we store the stylesheets for every mainContainer according to its assigned id.
			// Else we would add another <style> for each call of the postProcessor, which might result
			// in a bad performance/a cluttered DOM.
			const stylesheets: HTMLStyleElement[] = [];
			// The problem with this:
			// I just found out that on every Markdown render, the engine removes the mainContainer
			// currently modified and rebuilds it. That means: EVERYTIME the postProcessor is run, it
			// will encounter a newly created mainContainer not touched by the plugin yet. EVERYTIME it is
			// invoked, a new <style> will be added.
			// So the whole thing with saving stylesheets in this closure variable to prevent cluttering
			// the document with houndreds of <style>s does not work. Hopefully, this is not going to
			// be a performance problem. But I don't know how to prevent it. Doing "garbage collection"
			// and removing all unused <style>s on every postProcessor call might be even worse for
			// the performance.

			return function(mainContainer: HTMLElement): void {
				// This array will contain all LIs with their index and indentation level
				const listItems: {li: Element, ix: number, level: number}[] = [];
				
				// This block will collect all LIs in the mainContainer.
				// First, we iterate over all the OLs in the mainContainer.
				Array.from(mainContainer.querySelectorAll("ol")).forEach(ol => {
					// Get the indentation level of the OL
					let level = 0;
					// The OL itself should have a parent.
					let parent = ol.parentElement;
					if (! parent) throw new Error("This OL has no parent.");
					// Now we have to count the OL/UL elements in the parent chain up to mainContainer.
					// If the OL's direct parent is the mainContainer, indentation level stays 0.
					while (parent !== mainContainer) {
						if (parent === null) throw new Error("No parent found, but still inside mainContainer.");
						// Should ULs be considered as well? Or should an indentation level due to nesting in UL not count?
						if (parent.tagName === "OL" || parent.tagName === "UL") level ++;
						parent = parent.parentElement;
					}

					// Next, get all the LIs that are direct children of that OL
					const lis = Array.from(ol.children).filter(e => e.tagName === "LI");
					// Register the LIs to "listItems"
					lis.forEach((li, index) => listItems.push({li, ix: index + ol.start, level}));
				});

				// If there are no listItems inside this mainContainer, it is irrelevant to the plugin and can be skipped.
				if (listItems.length === 0) return;
				
				// Else, we need to detect if this mainContainer has already been touched by the plugin.
				let mcid = Number.parseInt((mainContainer.className.match(/lawlist-mcid-(\d*)/) || [, ""])[1] || "");
				// If there is no mainContainer id, this is the first encounter with this mainContainer.
				if (Number.isNaN(mcid)) {
					console.log("maincontainer never touched: ", mainContainer);
					// So we assign an mcid…
					mcid = mainContainerCounter ++;
					mainContainer.classList.add("lawlist-mcid-" + mcid);
					// …and a <style>.
					stylesheets[mcid] = document.head.appendChild(document.createElement("style"));
				}
				// First, we need to give the mainContainer an ID to identify the LIs inside.
				// (There might be more than one list in the document, resulting in different
				// mainContainers ("el ol" nodes).)

				// Now we have to give every LI a unique ID and style it according to its ix and level
				// by dynamically filling the <style> to adress all the LIs individually.
				const sheet = stylesheets[mcid].sheet;
				if (! sheet) throw new Error("Why is there no sheet?");
				// We empty the stylesheet…
				while (sheet.cssRules.length) sheet.deleteRule(0);
				// And generate it again. (Else, we would clutter up the stylesheet with unused rules.)
				listItems.forEach((item, id) => {
					// Assign an individual id to the LI.
					// The id class needs to contain the mcid as well, otherwise, there could be several
					// LIs with the same LI id, as the postProcessor only touches one mainContainer at a time.
					item.li.classList.add(`lawlist-li-mcid-${mcid}-id-${id}`);
					// Insert CSS rule to style the LI according to the pattern configured in the settings tab.
					// (In-Text custom patterns not supported yet.)
					sheet.insertRule(`.lawlist-li-mcid-${mcid}-id-${id}::marker { content: "${parsePattern(store.patterns[item.level] || "1. ", item.ix)}" }`, sheet.cssRules.length);
				});
			}
		})());
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
