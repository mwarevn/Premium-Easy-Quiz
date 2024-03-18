const urlParsed = new URL(window.location.href),
	fileId = "file-" + urlParsed.searchParams.get("ref_id") + urlParsed.searchParams.get("ass_id");
document.querySelector('input[name="cmd[uploadFileGD]"]').addEventListener("click", () => {
	var e = [...document.querySelectorAll("#deliver input[type=file]")].map((e) => ({
		name: e.files[0].name,
		size: e.files[0].size,
	}));
	chrome.storage.local.set({ [fileId]: e });
});
