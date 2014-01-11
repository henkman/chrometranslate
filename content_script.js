
function addPanel() {
	var panel = $("<div id='chrometranslate_panel'>");
	panel.append(
		$("<p>")
		.attr("id", "chrometranslate_panel_translated")
		.text("Select some text to translate")
	);
	$("body").append(panel);
	$("#chrometranslate_panel").resizable({
		handles: "n",
		maxHeight: 300,
		minHeight: 30,
		resize: function(event, ui) {
			$(this).height(ui.size.height);
			$(this).css("top", "auto");
			$(this).css("bottom", 0);
		}
	});
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	switch(request.method) {
	case "panelOpened":
		var panelExists = $("#chrometranslate_panel").length != 0;
		if(request.panelOpened) {
			if(!panelExists) {
				addPanel();
			}
		} else {
			if(panelExists) {
				$("#chrometranslate_panel").remove();
			}
		}
	break;
	case "search":
		$("#chrometranslate_panel_translated").text(request.text);
	break;
	}
});

document.onmouseup = function() {
	var selected = document.getSelection();
	if(selected.type != "Range" ||
		selected.focusNode.parentNode.id == "chrometranslate_panel_translated") {
		return;
	}
	chrome.runtime.sendMessage(
		{
			method: "search",
			text: selected.toString()
		}
	);
};
