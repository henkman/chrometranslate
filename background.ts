/// <reference path="chrome.d.ts"/>
/// <reference path="common.ts"/>

chrome.storage.local.get(defaultOptions, (opts: Options) => {
	class Background {
		private opts: Options;
		private panelOpen: boolean;
		private reTranslations: RegExp;
		private reTranslation: RegExp;
		constructor(opts: Options) {
			this.opts = opts;
			this.panelOpen = false;
			this.reTranslations = new RegExp("^\\[{2}(.*?)\\]{2},", "g");
			this.reTranslation = new RegExp("\\[\"([^\"]+)\"", "g");
			chrome.runtime.onMessage.addListener(this.onMessage);
			chrome.tabs.onUpdated.addListener(this.onUpdated);
			chrome.tabs.onActivated.addListener(this.onActivated);
			chrome.browserAction.onClicked.addListener(this.onClicked);
			chrome.windows.onFocusChanged.addListener(this.onFocusChanged);
		}
		private sendPanelState = (tab_id: number) => {
			chrome.tabs.sendMessage(tab_id, <PanelStateMessage>{
				Type: MessageType.PanelState,
				Open: this.panelOpen
			});
		}
		private onClicked = (tab: chrome.tabs.Tab) => {
			this.panelOpen = !this.panelOpen;
			chrome.browserAction.setIcon(
				<chrome.browserAction.TabIconDetails>{
					path: this.panelOpen ?
						"button_active.png" :
						"button_inactive.png"
				}
			);
			chrome.tabs.query(
				<chrome.tabs.QueryInfo>{},
				(tabs: chrome.tabs.Tab[]) => {
					for (let i = 0; i < tabs.length; i++) {
						this.sendPanelState(tabs[i].id);
					}
				}
			);
		}
		private onActivated = (activeInfo: chrome.tabs.TabActiveInfo) => {
			this.sendPanelState(activeInfo.tabId);
		}
		private onUpdated = (tabId: number,
			changeInfo: chrome.tabs.TabChangeInfo,
			tab: chrome.tabs.Tab) => {
			this.sendPanelState(tab.id);
		}
		private onFocusChanged = (windowId: number,
			filters?: chrome.windows.WindowEventFilter) => {
			chrome.tabs.query(
				<chrome.tabs.QueryInfo>{
					active: true,
					windowId: windowId
				},
				(tabs: chrome.tabs.Tab[]) => {
					for (let i = 0; i < tabs.length; i++) {
						this.sendPanelState(tabs[i].id);
					}
				}
			);
		}
		private onMessage = (message: Message,
			sender: chrome.runtime.MessageSender,
			sendResponse: (response: any) => void) => {
			if (message.Type != MessageType.Translate || !this.panelOpen) {
				return;
			}
			const tm = <TranslateMessage>message;
			const xhr = new XMLHttpRequest();
			xhr.open(
				"POST",
				"https://translate.googleapis.com/translate_a/single",
				true
			);
			xhr.onreadystatechange = () => {
				const DONE = 4;
				if (xhr.readyState == DONE) {
					const trs = this.reTranslations.exec(xhr.responseText);
					if (!trs) {
						sendResponse({ error: "no translation found" });
						return;
					}
					const strs = trs[1].replace(new RegExp("\\\\n", "g"), "<br>");
					let tr: RegExpExecArray;
					let t = "";
					while (tr = this.reTranslation.exec(strs)) {
						t += tr[1]
					}
					chrome.tabs.sendMessage(
						sender.tab.id,
						<TranslateMessage>{
							Type: MessageType.Translate,
							Text: t
						}
					);
				}
			}
			xhr.setRequestHeader(
				"Content-type",
				"application/x-www-form-urlencoded"
			);
			const ps = {
				"client": "gtx",
				"ie": "UTF-8",
				"oe": "UTF-8",
				"sl": "auto",
				"tl": this.opts.TargetLanguage,
				"dt": "t",
				"q": tm.Text,
			};
			let p = "";
			for (let key in ps) {
				if (p != "") {
					p += "&";
				}
				p += key + "=" + encodeURIComponent(ps[key]);
			}
			xhr.send(p);
		}
	}
	new Background(opts);
});
