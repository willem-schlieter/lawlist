/**
 * This file contains some framework stuff and the settings tab, plus the actual functionality for Read Mode.
 */

import { App, Plugin, PluginSettingTab, Setting, WorkspaceWindow } from 'obsidian';
import { LawListCMViewPlugin } from 'src/view_plugin';
import { PluginSpec, ViewPlugin } from '@codemirror/view';
import { createMarkerContent, cssString } from 'src/patterns';
import { maxLevel } from 'src/config.json';

// Maximum indentation level that will be affected by the plugin. Shared with
// scripts/build-styles.mjs, which has to emit one block of rules per level.
const MAX_LEVEL = maxLevel;

/** Set a custom property, or remove it when there is no value for it. */
function setProperty(style: CSSStyleDeclaration, name: string, value: string | null) {
	if (value === null) style.removeProperty(name);
	else style.setProperty(name, value);
}

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
	ol_patterns: string[];
	ul_patterns: string[];
	/** Every document we have written custom properties to, so that unload can clear them. */
	private styledDocs = new Set<Document>();

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

		// Popout windows are separate documents and do not inherit the custom
		// properties written into the main one, so each gets its own copy.
		this.registerEvent(this.app.workspace.on("window-open", (win: WorkspaceWindow) => {
			this.styledDocs.add(win.doc);
			this.writePatterns(win.doc);
		}));
		this.registerEvent(this.app.workspace.on("window-close", (win: WorkspaceWindow) => {
			this.styledDocs.delete(win.doc);
		}));

		this.app.workspace.onLayoutReady(() => this.applyPatterns());
	}

	onunload() {
		// Hand the list markers back to Obsidian.
		for (const doc of this.styledDocs) {
			const style = doc.body.style;
			for (let level = 0; level < MAX_LEVEL; level++) {
				style.removeProperty(`--lawlist-ol-${level}`);
				style.removeProperty(`--lawlist-ul-${level}`);
				style.removeProperty(`--lawlist-ul-bullet-${level}`);
			}
		}
		this.styledDocs.clear();
	}

	/** Applies the current settings to every window that is open. */
	applyPatterns() {
		this.styledDocs.add(this.app.workspace.rootSplit.doc);
		// Picks up popouts that were already open when the plugin was enabled,
		// which is too late for us to have seen their `window-open`.
		this.app.workspace.iterateAllLeaves(leaf => this.styledDocs.add(leaf.getContainer().doc));
		for (const doc of this.styledDocs) this.writePatterns(doc);
	}

	/**
	 * Writes one custom property per indentation level onto the body of `doc`.
	 * The selectors that read them live in `styles.css`; Obsidian loads that file
	 * for us, and plugins are not allowed to attach stylesheets of their own, so
	 * the values are all we are free to change at runtime.
	 *
	 * A level the user has not configured gets no property at all, which leaves
	 * the fallback in `styles.css` to hand that level back to Obsidian's own
	 * marker rather than forcing a style onto it.
	 */
	private writePatterns(doc: Document) {
		const style = doc.body.style;
		for (let level = 0; level < MAX_LEVEL; level++) {
			const ol = this.ol_patterns[level];
			setProperty(style, `--lawlist-ol-${level}`, ol ? createMarkerContent(ol) : null);

			// ULs need no counter, just the bullet itself. Obsidian draws its own
			// bullet in a `.list-bullet` span, which has to be hidden when we
			// supply one, and left alone when we do not.
			const ul = this.ul_patterns[level];
			setProperty(style, `--lawlist-ul-${level}`, ul ? cssString(ul) : null);
			setProperty(style, `--lawlist-ul-bullet-${level}`, ul ? "hidden" : null);
		}
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
		this.applyPatterns();
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
		.setDesc(`If enabled, your sequence of styles will be looped for higher levels, but only for ${MAX_LEVEL} levels. Otherwise, unset levels keep Obsidian's own markers.`)
		.addToggle(toggle => toggle
			.setValue(this.plugin.settings.loop)
			.onChange(async (value) => {
				this.plugin.settings.loop = value;
				await this.plugin.saveSettings();
			}));
	}
}
