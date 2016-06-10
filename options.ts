/// <reference path="chrome.d.ts"/>
/// <reference path="common.ts"/>

class OptionsHandler {
	constructor() {
		document.addEventListener('DOMContentLoaded', this.restore);
		document.getElementById('save')
			.addEventListener('click', this.save);
		document.getElementById('restore')
			.addEventListener('click', this.restore);
	}
	private save = () => {
		chrome.storage.local.set(<Options>{
			DefaultHeight: (<HTMLInputElement>
				document.getElementById('DefaultHeight')
			).valueAsNumber,
			FontSize: (<HTMLInputElement>
				document.getElementById('FontSize')
			).valueAsNumber,
			TargetLanguage: (<HTMLSelectElement>
				document.getElementById('TargetLanguage')
			).value,
		}, () => {
			const status = <HTMLDivElement>document.getElementById('status');
			status.textContent = 'Options saved.';
			setTimeout(() => {
				status.textContent = '';
			}, 750);
		});
	}
	private restore = () => {
		chrome.storage.local.get(defaultOptions, (opts: Options) => {
			(<HTMLInputElement>
				document.getElementById('DefaultHeight')
			).valueAsNumber = opts.DefaultHeight;
			(<HTMLInputElement>
				document.getElementById('FontSize')
			).valueAsNumber = opts.FontSize;
			(<HTMLSelectElement>
				document.getElementById('TargetLanguage')
			).value = opts.TargetLanguage;
		});
	}
}
new OptionsHandler();