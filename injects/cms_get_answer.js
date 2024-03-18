const apiUrl = "https://api.quizpoly.xyz",
	formatAns = (e) => e.trim().replace(/\s+correct+$/g, ""),
	formatText = (e) =>
		e.replace(/ \n\r/g, "\n").replace(/\n\r/g, "\n").replace(/\r/g, "\n").replace(/\n\n/g, "\n").replace(/ /g, " ");
let open = window.XMLHttpRequest.prototype.open,
	send = window.XMLHttpRequest.prototype.send;
function openReplacement(e, t, r, n, o) {
	return (this._url = t), open.apply(this, arguments);
}
function sendReplacement(e) {
	return (
		this.onreadystatechange && (this._onreadystatechange = this.onreadystatechange),
		(this.onreadystatechange = onReadyStateChangeReplacement),
		send.apply(this, arguments)
	);
}
function onReadyStateChangeReplacement() {
	if (
		(4 == this.readyState && this.responseURL.includes("problem_check") && submit(JSON.parse(this.response)),
		this._onreadystatechange)
	)
		return this._onreadystatechange.apply(this, arguments);
}
function parseHTML(e) {
	return new DOMParser().parseFromString(e, "text/html");
}
async function addQuiz(e) {
	try {
		var t = document.title.split("|")[2].replace("Courseware", "").trim();
		if (!t) return;
		const n = await fetch(apiUrl + "/cms", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ courseId: t, quizzes: e }),
			credentials: "include",
		});
		var r = await n.json();
		console.debug(r.message);
	} catch (e) {
		console.log(e);
	}
}
function submit(e) {
	if (e.contents) {
		const t = parseHTML(e.contents.replace(/allowfullscreen="true"\/>/g, 'allowfullscreen="true"/></iframe>')),
			r = Array.from(t.querySelectorAll("div.poly")),
			n = Array.from(t.querySelectorAll("div.wrapper-problem-response"));
		if (r.length !== n.length) throw new Error("quesel and ansel not compare");
		(qaEle = r.map((e, t) => [e, n[t]])),
			addQuiz(
				qaEle
					.map(([e, t]) => {
						const r = e.querySelector(".poly-body"),
							n = r.querySelector("img");
						var o = r.querySelector("audio"),
							e = r.querySelector("a");
						const a = r.querySelector("iframe");
						e = formatText(
							`${r.textContent.trim()}${n ? `\n${n.outerHTML}` : ""}${o ? `\n${o.outerHTML}` : ""}${
								e ? `\n${e.outerHTML}` : ""
							}${a ? `\n${a.outerHTML.replace(/iframe/g, "div")}` : ""}`
						);
						let l = "";
						const s = t.querySelectorAll("input[checked=true]");
						if (!t.querySelector(".correct")) return { q: null, a: null };
						if (s && s.length)
							if (1 < s.length)
								l = Array.from(s).map((e) => {
									var t = e.parentNode.querySelector("img");
									return formatText(
										formatAns(`${e.parentNode.innerText.trim()}${t ? `\n${t.outerHTML}` : ""}`)
									);
								});
							else {
								const n = s[0].parentNode.querySelector("img");
								l = formatText(
									formatAns(`${s[0].parentNode.innerText.trim()}${n ? `\n${n.outerHTML}` : ""}`)
								);
							}
						else {
							const c = t.querySelector("div.correct > input");
							c && (l = c.getAttribute("value")), (l = l && l.toLowerCase().trim());
						}
						return { q: e, a: l };
					})
					.filter((e) => e.q && e.a)
			);
	}
}
(window.XMLHttpRequest.prototype.open = openReplacement), (window.XMLHttpRequest.prototype.send = sendReplacement);
