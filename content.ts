/// <reference path="chrome.d.ts"/>
/// <reference path="common.ts"/>

chrome.storage.local.get(defaultOptions, (opts: Options) => {
	class TranslationHandler {
		private opts: Options;
		private panel: HTMLDivElement;
		private text: HTMLDivElement;
		constructor(opts: Options) {
			this.opts = opts;
			chrome.runtime.onMessage.addListener(this.onMessage);
		}
		private onMessage = (message: Message,
			sender: chrome.runtime.MessageSender,
			sendResponse: (response: any) => void) => {
			switch (message.Type) {
				case MessageType.PanelState: {
					const m = <PanelStateMessage>message;
					if (!m.Open && this.panel) {
						document.removeEventListener("mouseup",
							this.onMouseup);
						document.body.removeChild(this.panel);
						this.panel = this.text = null;
					} else if (m.Open && !this.panel) {
						document.addEventListener("mouseup",
							this.onMouseup);
						this.createPanel();
						document.body.appendChild(this.panel);
					}
				} break;
				case MessageType.Translate: {
					const m = <TranslateMessage>message;
					this.text.textContent = m.Text;
				} break;
			}
		}
		private onMouseup = (ev: MouseEvent) => {
			const selected = document.getSelection();
			if (selected.type != "Range"
				|| selected.focusNode.parentNode == this.text) {
				return;
			}
			chrome.runtime.sendMessage(<TranslateMessage>{
				Type: MessageType.Translate,
				Text: selected.toString()
			});
		}
		private createPanel = () => {
			const minh = 30;
			const maxh = 500;
			const panel = <HTMLDivElement>document.createElement("div");
			panel.style.position = "fixed";
			panel.style.left = "0";
			panel.style.bottom = "0";
			panel.style.zIndex = "100";
			panel.style.background = "#9a9a9a";
			panel.style.width = "100%";
			panel.style.height = this.opts.DefaultHeight + "px";
			const border = <HTMLDivElement>document.createElement("div");
			border.style.background = "#696969";
			border.style.height = "5px";
			border.style.cursor = "n-resize";
			border.onmousedown = (ev: MouseEvent) => {
				const panel = <HTMLDivElement>ev.srcElement.parentElement;
				const startHeight = panel.clientHeight;
				const pY = ev.pageY;
				const onmousemove = (ev: MouseEvent) => {
					const my = ev.pageY - pY;
					panel.style.height = Math.max(
						Math.min(
							maxh,
							(startHeight - my)
						),
						minh
					) + "px";
				};
				const onmouseup = (ev: MouseEvent) => {
					document.removeEventListener("mouseup", onmouseup);
					document.removeEventListener("mousemove", onmousemove);
				};
				document.addEventListener("mouseup", onmouseup);
				document.addEventListener("mousemove", onmousemove);
			};
			panel.appendChild(border);
			const text = <HTMLDivElement>document.createElement("div");
			text.style.fontSize = this.opts.FontSize + "px";
			text.style.padding = "5px";
			text.textContent = "Select some text to translate";
			panel.appendChild(text);
			this.panel = panel;
			this.text = text;
		}
	}
	new TranslationHandler(opts);
});
