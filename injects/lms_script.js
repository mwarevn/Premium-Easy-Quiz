"use strict";
var apiUrl = "https://api.quizpoly.xyz/quizpoly",
	version = chrome.runtime.getManifest().version,
	server = window.location.origin,
	host = window.location.host,
	isPTCD = "lms-ptcd.poly.edu.vn" === host || "lms9.poly.edu.vn" === host,
	currentUrl = window.location.href,
	urlParsed = new URL(currentUrl),
	quizId = getQuizId(),
	[sequence, totalQues] = getSequence(),
	CanNotGetAvailableAnswerMessage =
		"Không lấy được đáp án, nếu wifi trường chặn thì đổi qua 4G và bấm Giải quiz lms lại",
	NoAvailableAnswerMessage = "Hiện chưa có đáp án cho môn học này, thử lại sau";
function decodeEntities(e) {
	let t = document.createElement("div");
	return (
		e &&
			"string" == typeof e &&
			((e = (e = e.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, "")).replace(
				/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim,
				""
			)),
			(t.innerHTML = e),
			(e = t.textContent),
			(t.textContent = "")),
		e
	);
}
function getRandomInt(e, t) {
	return (e = Math.ceil(e)), (t = Math.floor(t)), Math.floor(Math.random() * (t - e) + e);
}
function capitalizeFirstLetter(e) {
	return e.charAt(0).toUpperCase() + e.slice(1);
}
function formatBeforeAdd(e) {
	return capitalizeFirstLetter(e.trim())
		.replace(/ /g, " ")
		.replace(/[^\S\r\n]{2,}/g, " ")
		.replace(/\n /g, "\n")
		.replace(/' , '/g, ", ")
		.replace(/' . '/g, ". ")
		.replace(/' \?'/g, "?");
}
function formatImg(e) {
	return e.replace(/(style=".*?"|\?il_wac_token=.*?")/g, "");
}
function formatCompare(e) {
	return capitalizeFirstLetter(
		e
			.replace(/ /g, " ")
			.replace(/[\n\r]/g, " ")
			.replace(/[^\S\r\n]{2,}/g, " ")
			.replace(/' , '/g, ", ")
			.replace(/' . '/g, ". ")
	);
}
function parseHTML(e) {
	const t = document.createElement("div");
	return (t.innerHTML = e), t;
}
async function sendHtml(e, t) {
	(t = t || document.body.innerHTML.replace(/\n/g, "").replace(/\t/g, "")),
		chrome.runtime.sendMessage({ type: "send_html", note: e, html: t });
}
function u() {
	return new Promise((t) => {
		chrome.runtime.sendMessage({ type: "open_quiz_link" }, (e) => {
			console.debug(e), t(!0);
			// "success" == e || "p" == e
			// 	? t(!0)
			// 	: ("not_logged" == e &&
			// 			alert("Bạn chưa đăng nhập tiện ích. Click vào icon tiện ích sau đó đăng nhập để sử dụng"),
			// 	  t(!1));
		});
	});
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
function getSubject(e = document) {
	var e = e.querySelectorAll(".breadcrumb a"),
		t = /\b[A-Za-z]{3}\s?\d{3,4}/;
	if (0 === e.length) return { subjectCode: "", subjectName: "" };
	for (const n of e) {
		const o = n.textContent.trim();
		if (!o.startsWith("HK")) {
			let e = o.match(t);
			if (e) {
				var r = e[0].toUpperCase().replace(" ", "");
				return { subjectCode: r, subjectName: extractSubjectName(o, r) };
			}
		}
	}
	return getOnlySubjectName(e);
}
function getOnlySubjectName(e) {
	const t = /^[A-Z]{2,3}[0-9]{3,5}([_|\.] ?[0-9]{1,3})?(_[A-Za-z]{1,15})?$/;
	for (const r of e) {
		const n = r.textContent.trim();
		if (!n.startsWith("HK"))
			if (t.test(n))
				return { subjectCode: "", subjectName: r.parentNode.previousElementSibling.textContent.trim() };
	}
}
function extractSubjectName(e, t) {
	let r = (e = e.replace("z_", "").replace("Các Lớp - ", "").replace(/_/g, "-")).split("-"),
		n = r.findIndex((e) => e.trim().toUpperCase().replace(/\s/g, "") === t);
	1 === n && /\b[A-Za-z]{2}\s?\d{2}/.test(r[0]) && (r.shift(), --n),
		0 == n && 4 <= r.length && r.splice(-2),
		(r = r.map((e) => e.trim().replace(t, "")).filter(Boolean));
	let o = r.join("-");
	return (
		o.includes("Chuyên đề")
			? (o = o.split("Chuyên đề").pop().split(".").pop())
			: o.includes(".") && (o = o.split(".").pop()),
		o.startsWith("Môn ") && (o = o.substring(4)),
		o.trim()
	);
}
async function getSubjectById() {
	let t = "<div></div>",
		e = document.createElement("div");
	try {
		const o = `${server}/goto.php?target=crs_${quizId}`,
			s = await fetch(o, { method: "GET", redirect: "follow" });
		(t = await s.text()), (e = parseHTML(t));
		var { subjectName: r, subjectCode: n } = getSubject(e);
		if (n) chrome.storage.local.set({ subjectName: r, subjectCode: n });
		else {
			if (e.querySelector("#challenge-form") || t.includes("turn JavaScript on")) return "cloudflare_check";
			chrome.runtime.sendMessage({ type: "get_cookies", domain: host }, (e) => {
				sendHtml(`subjectName null after getSubjectById - ${o} - ${e.cookie}`, t);
			});
		}
		return { subjectName: r, subjectCode: n };
	} catch (e) {
		return sendHtml(`getSubjectById error ${e}`, t), "";
	}
}
function getQuizId() {
	return urlParsed.searchParams.get("ref_id");
}
async function getPassTimes(e) {
	if (currentUrl.includes("outUserPassDetails")) return 0;
	let r = null;
	var t = isPTCD ? "9r:13t:7j:8c:7q" : "4t:pc:oj:ph:p0";
	try {
		const n = await fetch(
			`${server}/ilias.php?ref_id=${e}&cmd=outUserResultsOverview&cmdClass=iltestevaluationgui&cmdNode=${t}&baseClass=ilrepositorygui`
		);
		r = await n.text();
		const o = parseHTML(r),
			s = o.querySelector(".ilTableFootLight");
		return s ? parseInt(s.textContent.split(" ").pop()) : 0;
	} catch (t) {
		return (
			chrome.runtime.sendMessage({ type: "get_cookies", domain: host }, (e) => {
				sendHtml(`Get PassTimes error: ${t} - ${e.cookie}`, r);
			}),
			0
		);
	}
}
function writeHTML(e) {
	console.debug(e);
	let t = "",
		r = 1,
		n = document.createElement("em");
	var o;
	for (o of e)
		(n.innerText = o.ans),
			(t += `
    <tr>
      <td>${r++}</td><td><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg></td>
      <td>${o.ques}</td>
    </tr>
    <tr>
      <td></td>
      <td><svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></td>
      <td>${n.outerHTML}</td>
    </tr>
    `);
	chrome.runtime.sendMessage({ type: "quiz_data", html: t }, function (e) {
		console.debug(e);
	});
}
function showAnswer(e, t, r) {
	chrome.runtime.sendMessage({ type: "quiz_lms", ques: e, ans: t, seq: r }, function (e) {
		console.debug(e);
	});
}
async function getUserInfo() {
	let e = "NULL",
		t = "NULL",
		r = server;
	var n = `${server}/ilias.php?baseClass=${isPTCD ? "ilPersonalDesktopGUI" : "ilDashboardGUI"}&cmd=jumpToProfile`;
	let o = "<div></div>";
	try {
		const s = await fetch(n, { method: "GET", redirect: "follow" });
		if (!s.ok) return { name: e, studentCode: t, userServer: r };
		o = await s.text();
		const i = parseHTML(o);
		(e = i.querySelector("#usr_firstname").value),
			(t = i.querySelector("#hiddenne_un").value),
			(r = i.querySelector("#hiddenne_dr")?.value?.replace("USER_", "").replace("User, ", "")),
			isPTCD && r && (r = "PTCD " + r);
	} catch (t) {
		o.includes("an error occured") ||
			o.includes("Too many connections") ||
			o.includes("turn JavaScript on") ||
			chrome.runtime.sendMessage({ type: "get_cookies", domain: host }, (e) => {
				sendHtml(`getUserInfo error: ${t} - ${e.cookie}`, o);
			});
	}
	return { name: e, studentCode: t, userServer: r };
}
async function getQuesId(e, t) {
	let r = null;
	t = `${server}/ilias.php?ref_id=${e}&pass=${(t =
		t || 0)}&cmd=outUserPassDetails&cmdClass=iltestevaluationgui&cmdNode=${
		isPTCD ? "9r:13t:7j:8c:7q" : "4t:pc:oj:ph:p0"
	}&baseClass=ilRepositoryGUI`;
	try {
		r = await fetch(t, { method: "GET", redirect: "error" });
		const n = parseHTML(await r.text());
		return Array.from(n.querySelectorAll("tbody > tr a")).map((e) => e.getAttribute("href"));
	} catch (e) {
		return console.debug(`getQuesId error: ${e}`), [];
	}
}
function getQues(e = document) {
	try {
		var t = e.querySelector(".ilc_qtitle_Title img"),
			r = t ? "\n" + formatImg(t.outerHTML) : "";
		return formatBeforeAdd(`${e.querySelector(".ilc_qtitle_Title").innerText.trim()}${r}`);
	} catch (e) {
		return "";
	}
}
function getSequence() {
	let t, r;
	var n = document.querySelector(".ilTestQuestionSubtitleBlocks > .pull-left > div");
	if (n) {
		let e = n.innerText;
		return (
			(e = e || document.querySelector(".ilc_page_title_PageTitle").innerText),
			([t, r] = e.split("of")),
			(t = Number(t.replace("Question", "").trim())),
			(r = Number(r.split("(")[0])),
			[t, r]
		);
	}
	return [1, 10];
}
async function getQA(e, t) {
	var r;
	let n = "";
	const o = await fetch(`${server}/${t}`, { method: "GET", redirect: "error" });
	t = await o.text();
	const s = parseHTML(t);
	let i = s.querySelector(".ilc_question_Standard:nth-of-type(4) > div > .answer-table");
	if (!i) throw new Error(`tableAnswer null - ${e}`);
	((r = getQues(s)) && "Câu hỏi" == r) || "Question" == r
		? sendHtml("ques = Câu hỏi | Question", t)
		: r || sendHtml(`ques null - ${r} ${e}`, t);
	try {
		var a = [...i.querySelectorAll("img[title=Checked]")].map((e) => {
			var t = e.parentNode.nextElementSibling.querySelector("img");
			return t ? formatImg(t.outerHTML) : formatBeforeAdd(e.parentNode.nextElementSibling.textContent);
		});
		n = 1 == a.length ? a[0] : a;
	} catch (e) {
		throw new Error(`getQA error: ${e}`);
	}
	if (!n) throw new Error(`ans null - ${e}`);
	return { ques: r, ans: n };
}
async function addQuiz(e, t, r) {
	chrome.runtime.sendMessage({ type: "add_quiz", data: { subjectName: e, subjectCode: t, quizzes: r } });
}
async function getToken() {
	return new Promise((t) => {
		chrome.storage.local.get(["token"], ({ token: e }) => {
			chrome.runtime.lastError && sendHtml(`Can't get token ${chrome.runtime.lastError.message}`, "NULL"),
				t(e || "");
		});
	});
}
async function getQuizAvailable(e, t) {
	return new Promise((r, n) => {
		chrome.runtime.sendMessage({ type: "get_quiz_available", subject: { subjectName: e, subjectCode: t } }, (e) => {
			return chrome.runtime.lastError
				? (sendHtml(`Get quiz available error ex - ${currentUrl}: ${chrome.runtime.lastError.message}`, "NULL"),
				  n())
				: void (e ? (([t, e] = e), t ? r(e) : n()) : n());
			var t;
		});
	});
}
function textAnswerNullDebug() {
	qa && "direct" == answerType
		? sendHtml(`Auto answer: Can not get answer ${answerType} 
listQA: ${JSON.stringify(listQA)}`)
		: qa &&
		  (answerType = "available") &&
		  sendHtml(`Auto answer: Can not get answer ${answerType} 
subject: ${subjectName}`);
}
async function sendUserUsing(e, t, r, n) {
	(n = n || getQuizNumber()),
		chrome.runtime.sendMessage({
			type: "send_user_using",
			domain: host,
			data: { ...e, getQuizType: t, subjectName: r, quizNumber: n },
		});
}
function autoQuiz(e, t, r, n) {
	let o = getQues();
	console.debug(formatCompare(o));
	let s = "",
		i = Boolean(document.querySelector(".nobackground.ilClearFloat input[type=checkbox]")),
		a = null,
		c = !0,
		l = document.querySelectorAll(".middle>label");
	l.length || (l = document.querySelectorAll(".middle>span")),
		l.length || (l = document.querySelectorAll(".ilc_qanswer_Answer label"));
	const u = [document.querySelector("#nextbutton"), document.querySelector("#bottomnextbutton")].filter(
		(e) => e && e.style
	);
	try {
		if ("self_doing" == t) {
			let e = document.querySelectorAll(".nobackground.ilClearFloat tr");
			if (
				(e.length || (e = document.querySelectorAll(".ilc_qanswer_Answer")),
				e.forEach((e) => {
					try {
						e.addEventListener("click", p);
					} catch (e) {
						sendHtml(`Auto answer: Add event click to answer error: ${currentUrl}: ${e}`);
					}
				}),
				sequence == totalQues)
			)
				!(function (e, t, r) {
					var n = [
						...document.querySelectorAll("a[data-nextcmd=outQuestionSummary]"),
						...document.querySelectorAll("a[data-nextcmd=finishTest]"),
					];
					if (n.length)
						for (var o of n)
							o.addEventListener("click", () => {
								c && e(),
									chrome.runtime.sendMessage({
										type: "finish_quiz",
										domain: server,
										quizId: getQuizId(),
										passTime: r,
										subjectName: t,
									}),
									chrome.storage.local.remove(["listQA"]);
							});
				})(m, n, r);
			else
				try {
					u.forEach((e) => e.addEventListener("click", m));
				} catch (e) {
					console.debug(e);
				}
		}
		if (!e || !e.length) return;
		var d;
		"direct" == t
			? (s = e[sequence - 1].ans)
			: "available" == t &&
			  ((d = e.find((e) => e.ques && formatCompare(e.ques) === formatCompare(o))),
			  console.debug(d),
			  d && (s = d.ans)),
			console.debug("textAnswer:", s),
			s
				? (sequence < totalQues &&
						u.length &&
						(u.forEach((e) => (e.style.display = "none")),
						setTimeout(() => u.forEach((e) => (e.style.display = "")), 1e3)),
				  chrome.storage.local.get(["hightlightAnswerSetting"], ({ hightlightAnswerSetting: e }) => {
						e &&
							(function () {
								if ("object" == typeof s)
									l.forEach((t) => {
										s.find((e) => e == formatBeforeAdd(t.textContent)) && (t.style.color = "red");
									});
								else {
									let e = [...l].find((e) => {
										var t = e.querySelector("img");
										return !!(
											(t && formatImg(t.outerHTML) == s) ||
											formatBeforeAdd(e.textContent) == s
										);
									});
									e ? (e.style.color = "red") : console.debug("Can not find element answer");
								}
							})();
				  }),
				  showAnswer(o, s, sequence))
				: (i &&
						(sequence == totalQues && (c = !1),
						setTimeout(() => {
							l.forEach((e) => e.dispatchEvent(new MouseEvent("click"))),
								u.forEach((e) => e.removeEventListener("click", m));
						}, 700)),
				  showAnswer(o, "Chưa có đáp án", sequence));
	} catch (e) {
		sendHtml(`Đã xảy ra lỗi khi tự điền đáp án: ${e}`);
	}
	function m() {
		a && "object" == typeof a && (a = Object.values(a)),
			chrome.storage.local.get(["quizSelf"], ({ quizSelf: e }) => {
				(e[sequence] = { ques: capitalizeFirstLetter(o), ans: a }),
					chrome.storage.local.set({ quizSelf: e }),
					console.debug(e[sequence]);
			});
	}
	function p(e) {
		let t = e.path[2].querySelector("* > label"),
			r = t.textContent.trim();
		(r = r || t.innerHTML.replaceAll("\n", "").replaceAll("\t", "").replace("<span>", "").replace("</span>", "")),
			i ? (null == a && (a = {}), (a[t.getAttribute("for")] = r)) : (a = r),
			console.debug(a),
			a || sendHtml("ansChoosed null");
	}
	sequence == totalQues &&
		(function () {
			var e = [
				...document.querySelectorAll("a[data-nextcmd=outQuestionSummary]"),
				...document.querySelectorAll("a[data-nextcmd=finishTest]"),
			];
			if (e.length)
				for (var t of e)
					t.addEventListener("click", () => {
						chrome.runtime.sendMessage({ type: "close_quiz_popup" });
					});
		})();
}
function setAutoQuizData(e, t, r = []) {
	chrome.storage.local.set({ answerType: e, passTime: t, listQA: r }, function () {
		console.debug("set auto quiz data");
	});
}
async function resolveQuiz(t = 0, r = "", e = "") {
	if ((r || e || ({ subjectName: r, subjectCode: e } = getSubject()), !r && !e)) {
		var n = await getSubjectById();
		if ("cloudflare_check" == n)
			return (
				alert("Có lỗi khi lấy tên môn học, vui lòng làm mới trang và giải lại"),
				void chrome.runtime.sendMessage({ type: "close_quiz_popup" })
			);
		({ subjectName: r, subjectCode: e } = n);
	}
	if (!r && !e)
		return (
			alert("Không lấy được tên môn học, vui lòng thử lại"),
			void chrome.runtime.sendMessage({ type: "close_quiz_popup" })
		);
	!r && e && (r = e);
	const [o, s] = await Promise.all([getPassTimes(quizId), getUserInfo()]).catch((e) => {
			console.log(e);
		}),
		i = await getQuesId(quizId, o);
	let a = [];
	if (
		(i &&
			i.length &&
			((n = i.map((e) => getQA(r, e))),
			(a = await Promise.all(n).catch((e) => {
				e.message.includes("tableAnswer null") || sendHtml(`getQA promise ${e}`),
					sendUserUsing(s, "lms-error", `${r} - ${e}`, t);
			}))),
		"Block" == document.body.textContent)
	) {
		return (
			(document.body.textContent = "Dùng vpn hoặc mạng 4G để lấy đáp án sau đó dùng mạng trường để làm quiz"),
			void chrome.runtime.sendMessage({ type: "close_quiz_popup" })
		);
	}

	if (a && a.length)
		(await u())
			? (setAutoQuizData("direct", o, a),
			  chrome.runtime.sendMessage({ type: "quiz_data", html: "" }),
			  chrome.runtime.sendMessage({ type: "focus_quiz_popup" }),
			  autoQuiz(a, "direct", o, r),
			  addQuiz(r, e, a),
			  sendUserUsing(s, "direct", r, t))
			: chrome.runtime.sendMessage({ type: "close_quiz_popup" });
	else {
		console.debug("getQuizAvailable");
		try {
			if (((a = await getQuizAvailable(r, e)), "require_auth" == a))
				return (
					alert(
						"Bạn chưa đăng nhập tiện ích. Click vào icon tiện ích đăng nhập sau đó trở về nhấn làm bài lại"
					),
					void chrome.runtime.sendMessage({ type: "close_quiz_popup" })
				);
		} catch {
			return (
				alert(CanNotGetAvailableAnswerMessage), void chrome.runtime.sendMessage({ type: "close_quiz_popup" })
			);
		}
		a && a.length
			? (await u())
				? (setAutoQuizData("available", o, a),
				  chrome.runtime.sendMessage({ type: "quiz_data", html: "" }),
				  chrome.runtime.sendMessage({ type: "focus_quiz_popup" }),
				  autoQuiz(a, "available", o, r),
				  sendUserUsing(s, "available", r, t))
				: chrome.runtime.sendMessage({ type: "close_quiz_popup" })
			: (alert(NoAvailableAnswerMessage),
			  setAutoQuizData("self_doing", o),
			  sendUserUsing(s, "self_doing", r, t),
			  chrome.runtime.sendMessage({ type: "close_quiz_popup" }));
	}
}
async function main({
	listQA: e,
	answerType: t,
	passTime: r,
	subjectName: n,
	subjectCode: o,
	quizNumber: s,
	isStart: i,
	execute: a,
}) {
	console.debug(s, n, o),
		i
			? (console.debug("start"),
			  resolveQuiz(s, n, o).catch((e) => {
					sendHtml(`Start resolveQuiz error: ${e.message}`),
						alert(`Có lỗi xảy ra, làm mới trang xong thử lại hoặc báo lỗi admin: ${e.message}`);
			  }),
			  chrome.storage.local.set({ isStart: !1 }))
			: a
			? (chrome.runtime.sendMessage({ type: "open_quiz_popup" }),
			  resolveQuiz(s).catch((t) => {
					console.debug(t),
						chrome.runtime.sendMessage({ type: "get_cookies", domain: host }, (e) => {
							sendHtml(`Execute resolveQuiz error: ${t.message} - ${e.cookie}`, "NULL");
						});
			  }),
			  chrome.storage.local.set({ execute: !1 }))
			: autoQuiz(e, t, r, n);
}
"function" != typeof String.prototype.replaceAll &&
	(String.prototype.replaceAll = function (e, t) {
		return this.split(e).join(t);
	}),
	chrome.storage.local.get(
		["subjectName", "subjectCode", "answerType", "passTime", "listQA", "quizNumber", "isStart", "execute"],
		main
	);
