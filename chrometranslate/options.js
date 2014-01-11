function save_options() {
	var select = document.getElementById("targetLang");
	localStorage["targetLang"] = select.value;
	var status = document.getElementById("status");
	status.innerHTML = "Options Saved.";
	setTimeout(function() {
		status.innerHTML = "";
	}, 750);
}

function restore_options() {
	var targetLang = localStorage["targetLang"];
	if (!targetLang) {
		return;
	}
	var select = document.getElementById("targetLang");
	select.value = targetLang;
}
document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);