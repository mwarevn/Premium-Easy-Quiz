var server = window.location.origin,
	currentUrl = window.location.href,
	apiUrl = "https://api.quizpoly.xyz/quizpoly",
	version = chrome.runtime.getManifest().version,
	host = window.location.host;
async function sendHtml(e, t) {
	(t = t || document.body.innerHTML.replace(/\n/g, "").replace(/\t/g, "")),
		chrome.runtime.sendMessage({ type: "send_html", note: e, html: t });
}
function getSubject(e = document) {
	var e = e.querySelectorAll(".breadcrumb a"),
		t = /\b[A-Za-z]{3}\s?\d{3,4}/;
	if (0 === e.length) return { subjectCode: "", subjectName: "" };
	for (const o of e) {
		const r = o.textContent.trim();
		if (!r.startsWith("HK")) {
			let e = r.match(t);
			if (e) {
				var n = e[0].toUpperCase().replace(" ", "");
				return { subjectCode: n, subjectName: extractSubjectName(r, n) };
			}
		}
	}
	return getOnlySubjectName(e);
}
function getOnlySubjectName(e) {
	const t = /^[A-Z]{2,3}[0-9]{3,5}([_|\.] ?[0-9]{1,3})?(_[A-Za-z]{1,15})?$/;
	for (const n of e) {
		const o = n.textContent.trim();
		if (!o.startsWith("HK"))
			if (t.test(o))
				return { subjectCode: "", subjectName: n.parentNode.previousElementSibling.textContent.trim() };
	}
}
function extractSubjectName(e, t) {
	let n = (e = e.replace("z_", "").replace("Các Lớp - ", "").replace(/_/g, "-")).split("-"),
		o = n.findIndex((e) => e.trim().toUpperCase().replace(/\s/g, "") === t);
	1 === o && /\b[A-Za-z]{2}\s?\d{2}/.test(n[0]) && (n.shift(), --o),
		0 == o && 4 <= n.length && n.splice(-2),
		(n = n.map((e) => e.trim().replace(t, "")).filter(Boolean));
	let r = n.join("-");
	return (
		r.includes("Chuyên đề")
			? (r = r.split("Chuyên đề").pop().split(".").pop())
			: r.includes(".") && (r = r.split(".").pop()),
		r.startsWith("Môn ") && (r = r.substring(4)),
		r.trim()
	);
}
function getQuizNumber() {
	try {
		let e = document.querySelector(".ilAccAnchor");
		return (
			(e = e || document.querySelector("#kioskTestTitle")),
			e && e.textContent ? ((t = (t = e.textContent).match(/(^|\D)([1-9][0-9]?)(\D|$)/)) ? Number(t[2]) : 0) : 0
		);
	} catch (e) {
		return 0;
	}
	var t;
}
async function main({ quizNumber: e, subjectName: t, subjectCode: n }, o) {
	chrome.runtime.sendMessage({ type: "open_quiz_popup" }),
		chrome.storage.local.remove("listQA"),
		chrome.storage.local.set({ subjectName: t, subjectCode: n, quizNumber: e, isStart: !0 }, () => {
			console.debug("set subject"), o();
		});
}
!(function () {
	const e = document.querySelector(".navbar-form > input");
	if (e) {
		const { subjectName: t, subjectCode: n } = getSubject();
		if ((console.debug(t, n), !t && !n)) return console.debug("subjectName null");
		const o = getQuizNumber();
		e.setAttribute("type", "button");
		const r = e.cloneNode(!0);
		r.setAttribute("type", "submit"),
			r.setAttribute("style", "display:none"),
			document.querySelector(".navbar-form").appendChild(r),
			e.addEventListener("click", () => {
				e.setAttribute("disabled", ""),
					main({ quizNumber: o, subjectName: t, subjectCode: n }, () => {
						console.debug("click"),
							r.setAttribute("type", "submit"),
							r.dispatchEvent(new MouseEvent("click"));
					});
			});
	}
})();
