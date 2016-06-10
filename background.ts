/// <reference path="chrome.d.ts"/>
/// <reference path="common.ts"/>

chrome.storage.local.get(defaultOptions, (opts: Options) => {
	class Background {
		private opts: Options;
		private panelOpen: boolean;
		constructor(opts: Options) {
			this.opts = opts;
			this.panelOpen = false;
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
				"https://translate.google.com/translate_a/t",
				true
			);
			xhr.onreadystatechange = () => {
				const DONE = 4;
				if (xhr.readyState == DONE) {
					const translation = <Array<String>>JSON.parse(
						xhr.responseText
					);
					if (translation.length == 0) {
						sendResponse({ error: "no translation found" });
						return;
					}
					chrome.tabs.sendMessage(
						sender.tab.id,
						<TranslateMessage>{
							Type: MessageType.Translate,
							Text: translation[0]
						}
					);
				}
			}
			xhr.setRequestHeader(
				"Content-type",
				"application/x-www-form-urlencoded"
			);
			xhr.send(
				"client=x&hl=en&sl=auto" +
				"&text=" + tm.Text +
				"&tl=" + this.opts.TargetLanguage
			);
		}
	}
	new Background(opts);
});
