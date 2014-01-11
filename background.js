var panelOpened = false;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.method) {
	case "search":
		if(!panelOpened) {
			return;
		}
		
		var xhr = new XMLHttpRequest();
		xhr.open(
			"POST",
			"http://translate.google.com/translate_a/t",
			true
		);
		xhr.onreadystatechange = function() {
			if (xhr.readyState == 4) {
				var data = JSON.parse(xhr.responseText);
				var sentences = data.sentences;
				if(sentences.length == 0) {
					sendResponse({error:"no translation found"});
					return;
				}
				var text = "";
				for(var i = 0; i < sentences.length; i++) {
					text += sentences[i].trans;
				}
				chrome.tabs.sendMessage(
					sender.tab.id,
					{
						method:"search",
						text:text
					}
				);
			}
		}
		xhr.setRequestHeader(
			"Content-type",
			"application/x-www-form-urlencoded"
		);
		var targetLang = localStorage["targetLang"];
		if(!targetLang) {
			targetLang = "en";
		}
		xhr.send(
			"client=x&hl=en&sl=auto" +
			"&text=" + request.text +
			"&tl=" + targetLang
		);
	break;
	}
});

function sendPanelOpened(tab_id) {
	chrome.tabs.sendMessage(
		tab_id,
		{method:"panelOpened", panelOpened:panelOpened}
	);
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	sendPanelOpened(tab.id);
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
	sendPanelOpened(activeInfo.tabId);
});

chrome.windows.onFocusChanged.addListener(function(windowId) {
	chrome.tabs.query(
		{active:true, windowId:windowId},
		function(tabs) {
			for(var i = 0; i < tabs.length; i++) {
				sendPanelOpened(tabs[i].id);
			}
		}
	);
});

chrome.browserAction.onClicked.addListener(function(tab) {
	panelOpened = !panelOpened;
	chrome.browserAction.setIcon(
		{path: panelOpened ? "button_active.png" : "button_inactive.png"}
	);
	chrome.tabs.query(
		{},
		function(tabs) {
			for(var i = 0; i < tabs.length; i++) {
				sendPanelOpened(tabs[i].id);
			}
		}
	);
});
