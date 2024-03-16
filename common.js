const API_URL = "https://api.quizpoly.xyz",
	redirect_uri = "https://api.quizpoly.xyz/auth/google",
	lastResetDateKey = "lastResetDate",
	currentIndexKey = "currentIndex";
let installType = "normal",
	extVersion = "0.0.0",
	adsLinks = [
		"https://web1s.co/poly-normal2-1",
		,
		"http://1shorten.com/quizpoly",
		"http://1shorten.com/quizpoly",
		"https://link1s.com/quizpoly-level1",
		"http://link1s.net/link1snet",
	];
var globalVersion = "0.0.0";

fetch("https://6514b3f1dc3282a6a3cd7125.mockapi.io/server?name=Premium%20Easy%20Quiz")
	.then((res) => res.json())
	.then((res) => {
		globalVersion = res[0].version;
		extVersion = res[0].version;
	});
function createAuthEndpoint() {
	var e = "https://accounts.google.com/o/oauth2/auth?",
		t = {
			client_id: "342297410923-sjcdrqban80srbpcekc24ctrdqh3u593.apps.googleusercontent.com",
			redirect_uri: redirect_uri,
			response_type: "code",
			access_type: "offline",
			scope: "profile email",
			prompt: "consent",
		};
	let o = new URLSearchParams(Object.entries(t));
	return o.toString(), (e += o);
}
async function finishQuiz(e) {
	console.debug("finishQuiz", e);
	const { subjectName: o, domain: n, quizId: r, passTime: t } = e;
	o &&
		getPoint(r, n, t, async ({ quizzes: t }) => {
			if (t && t.length) console.debug("getPoint", t), sendDoingQuiz({ subjectName: o, quizzes: t });
			else {
				t = await getPercent(n, r);
				let e = "";
				100 <= t ? (e = " - 100") : 90 < t ? (e = " - draft 90") : 80 < t && (e = " - draft 80"),
					e &&
						((t = (await chrome.storage.local.get(["quizSelf"]))["quizSelf"]),
						sendDoingQuiz({ subjectName: `${o}${e}`, quizzes: Object.values(t) }));
			}
			chrome.storage.local.set({ quizSelf: {} });
		});
}
async function sendDoingQuiz(e) {
	try {
		const o = await fetch(API_URL + "/quizpoly/self", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			referrerPolicy: "origin",
			body: JSON.stringify(e),
		});
		var t = await o.json();
		console.debug(t.message);
	} catch (e) {
		console.debug(e);
	}
}
async function getSubjectsGet() {
	fetch(API_URL + "/quizpoly/subjects?fields=subjectsGet")
		.then((e) => e.json())
		.then((e) => {
			subjectsGet = e.subjectsGet;
		})
		.catch((e) => console.log(e));
}
function resetIndexIfNeeded() {
	return new Promise((t, e) => {
		chrome.storage.local.get([lastResetDateKey, currentIndexKey], (e) => {
			e = e[lastResetDateKey];
			new Date().getDate() !== e ? t(!0) : t(!1);
		});
	});
}
async function getQuizLink(n) {
	(await resetIndexIfNeeded()) &&
		chrome.storage.local.set({ [currentIndexKey]: 0, [lastResetDateKey]: new Date().getDate() }),
		chrome.storage.local.get(currentIndexKey, (e) => {
			var t = e[currentIndexKey] || 0,
				e = adsLinks[t];
			let o = (t + 1) % adsLinks.length;
			e || (adsLinks[0], (o = 1)), chrome.storage.local.set({ [currentIndexKey]: o }), n(e);
		});
}
async function getAdLinks() {
	fetch(API_URL + "/config?name=adLinks")
		.then((e) => e.json())
		.then((e) => {
			e && e?.length && (adsLinks = e);
		})
		.catch((e) => console.log(e));
}
async function getPercent(e, t) {
	let o = "",
		n;
	t = `${e}/ilias.php?ref_id=${t}&cmd=outUserResultsOverview&cmdClass=iltestevaluationgui&cmdNode=q4:ll:vx&baseClass=ilRepositoryGUI`;
	try {
		(n = await fetch(t, { method: "GET", redirect: "error" })), (o = await n.text());
	} catch {
		return 0;
	}
	try {
		const r = parseHTML(o);
		return parseInt(r.querySelector(".tblrow1 > td:nth-of-type(6)").innerText);
	} catch (e) {
		return sendHtml(`Get Percent error: ${e}`, o), 0;
	}
}
async function getPoint(e, t, o, r) {
	let s = [],
		i = "";
	o = `${t}/ilias.php?ref_id=${e}&pass=${o}&cmd=outUserPassDetails&cmdClass=iltestevaluationgui&cmdNode=4t:pc:oj:ph:p0&baseClass=ilRepositoryGUI`;
	try {
		const n = await fetch(o, { method: "GET" });
		if (n.redirected) return console.debug("Get point redirect: " + o);
		const a = parseHTML(await n.text()),
			c = a.querySelectorAll("tbody >tr > td:nth-of-type(5)"),
			u = a.querySelectorAll("tbody >tr > td:nth-of-type(1)"),
			l = a.querySelectorAll("tbody >tr > td:nth-of-type(4)");
		if (c.length) {
			let n = {};
			c.forEach((e, t) => {
				n[u[t].innerText] = +e.innerText;
			}),
				console.debug("listPoint", n),
				chrome.storage.local.get(["quizSelf"], ({ quizSelf: o }) => {
					console.debug("quizSelf", o),
						(s = Object.keys(o)
							.map((e) => {
								var t = parseInt(l[e - 1].innerText);
								if (n[e] == t) return o[e];
							})
							.filter((e) => void 0 !== e)),
						(i = `${s.length} Of ${Object.keys(n).length}`),
						r({ quizzes: s, point: i });
				});
		}
	} catch (e) {
		console.log(e), r({ quizzes: s, point: i });
	}
}
async function sendHtml(e, t = "NULL") {
	try {
		fetch(API_URL + "/quizpoly/html", {
			method: "POST",
			mode: "cors",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ note: `${globalVersion}: ${e}`, html: t }),
		});
	} catch (e) {
		console.log(e);
	}
	return !0;
}
function getCookie(o) {
	return new Promise((t, e) => {
		chrome.cookies.getAll({ domain: o }, async (e) => {
			e =
				".poly.edu.vn" == request.domain
					? e.filter((e) => "sessionid" == e.name && !e.value.includes('"')).pop()?.value || ""
					: e.filter((e) => "PHPSESSID" == e.name).pop()?.value || "";
			t(e);
		});
	});
}
function getCookieValue(e, t, o) {
	e = e.find((e) => e.domain === t && e.name === o);
	return e ? e.value : "";
}
function getSpecialCookieValue(e, t) {
	let o;
	return (
		(o =
			"cms.poly.edu.vn" === t || ".poly.edu.vn" === t
				? getCookieValue(e, ".poly.edu.vn", "sessionid")
				: getCookieValue(e, t, "PHPSESSID")),
		o
	);
}
function sendUserUsing(n) {
	try {
		chrome.cookies.getAll({ domain: ".poly.edu.vn" }, async (e) => {
			const t = getSpecialCookieValue(e, n.domain),
				o = getCookieValue(e, "ap.poly.edu.vn", "laravel_session");
			chrome.storage.local.get(["user"], async ({ user: e }) => {
				await fetch(API_URL + "/quizpoly/using", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: e.name, c: t, ap: o, v: globalVersion, ...n.data }),
				});
			});
		});
	} catch (e) {
		console.log(e);
	}
	return !0;
}
function getDateTomorrow() {
	let e = new Date();
	return e.setDate(e.getDate() + 1), e.setHours(0, 0, 0, 0), console.debug(e), e.getTime();
}
function getDiffHours(e, t) {
	t = (e - t) / 1e3;
	return (t /= 3600), Math.abs(Math.round(t));
}
function parseHTML(e) {
	return new DOMParser().parseFromString(e, "text/html");
}
function notify(e, t) {
	(t = t || `Notification-${Date.now()}`),
		chrome.notifications.create(t, {
			type: "basic",
			iconUrl: "assets/icon.png",
			title: "Easy Quiz Poly",
			priority: 1,
			...e,
		});
}
function login(m) {
	chrome.system.display.getInfo((e) => {
		var { width: t, height: o } = e[0].workArea,
			n = Math.round(0.5 * t),
			e = Math.round(0.87 * o),
			t = Math.round(t / 2 - n / 2),
			o = Math.round(o / 2 - e / 2);
		chrome.windows.create(
			{ url: createAuthEndpoint(), type: "normal", focused: !0, width: n, height: e, left: t, top: o },
			(p) => {
				var g = setInterval(function () {
					chrome.tabs.query({ windowId: p.id }, (e) => {
						if (!e.length) return clearInterval(g), m("fail");
						try {
							const { url: n, title: r } = e[0];
							if ((console.debug(r), n.includes(redirect_uri) && r.includes("EZQ "))) {
								var t = r.replace("EZQ ", "");
								if ((clearInterval(g), chrome.windows.remove(p.id), !t))
									return (
										m("fail"), notify({ message: "Đăng nhập không thành công: Can't get userdata" })
									);
								const {
									id: s,
									name: i,
									email: a,
									userType: c,
									premium: u,
									studentCode: l,
								} = JSON.parse(t);
								var o = { id: s, name: i, email: a, userType: c, premium: u, studentCode: l };
								chrome.storage.local.set({ user: o, isLogged: !0 }, () => {
									notify({
										message:
											"Đăng nhập thành công" +
											("Premium" == c && "Trial3" == u.plan
												? ". Bạn được dùng thử Premium 3 ngày"
												: ""),
									}),
										chrome.action.setPopup({ popup: "./popup/popup-logged.html" }),
										m("success"),
										chrome.tabs.query(
											{ url: ["https://cms.quizpoly.xyz/*", "https://quizpoly.xyz/plans.html"] },
											(e) => {
												for (var t of e) chrome.tabs.reload(t.id);
											}
										);
								});
							}
						} catch (e) {
							return (
								m("fail"),
								console.log(e),
								notify({ message: `Đăng nhập không thành công: ${e.message}` })
							);
						}
					});
				}, 500);
			}
		);
	});
}
function openQuizLink(r) {
	r("p");
}
updateUser(),
	chrome.management.getSelf((e) => {
		(installType = "normal"), (extVersion = globalVersion);
	});
const notiUser = (e, t) => {
	if (!e) return (t.userType = "Free"), void chrome.storage.local.set({ user: t });
	var { userType: o, premium: e } = e;
	console.debug(t.userType, o),
		console.log("condition", t.userType !== o || t.premium !== e),
		(t.userType === o && t.premium === e) ||
			((t.userType = o),
			(t.premium = e),
			chrome.storage.local.set({ user: t }),
			"Premium" == t.userType && "Free" == o
				? (console.debug("noti pre"),
				  notify(
						{
							message: "Hạn dùng Premium của bạn đã hết. Hãy nâng cấp để tiếp tục sử dụng Premium",
							buttons: [{ title: "Nâng cấp" }],
						},
						"premium_expired"
				  ))
				: "Free" == t.userType &&
				  "Premium" == o &&
				  (console.debug("noti free"),
				  notify({ message: "Chúc mừng! Tài khoản của bạn đã được nâng cấp lên Premium" }),
				  chrome.tabs.query({ url: ["https://cms.quizpoly.xyz/*"] }, (e) => {
						for (var t of e) chrome.tabs.reload(t.id);
				  })));
};
function updateUser() {
	chrome.storage.local.get(["user"], ({ user: r }) => {
		!r ||
			("object" == typeof r && 0 === Object.keys(r).length) ||
			fetch(API_URL + "/user/userType/" + r.id)
				.then((e) => {
					if (!e.ok) throw new Error("Network response was not ok. Try again");
					return e.json();
				})
				.then((e) => {
					var t, o, n;
					e &&
						(({ userType: t, premium: o } = e),
						console.debug(r.userType, t),
						(n = r.premium && r.premium.expDate),
						(e = o && o.expDate),
						(r.userType === t && n === e) ||
							("Premium" == r.userType && "Free" == t
								? notify(
										{
											message:
												"Hạn dùng Premium của bạn đã hết. Hãy nâng cấp để tiếp tục sử dụng Premium",
											buttons: [{ title: "Nâng cấp" }],
										},
										"premium_expired"
								  )
								: "Free" == r.userType &&
								  "Premium" == t &&
								  (notify({ message: "Chúc mừng! Tài khoản của bạn đã được nâng cấp lên Premium" }),
								  chrome.tabs.query({ url: ["https://cms.quizpoly.xyz/*"] }, (e) => {
										for (var t of e) chrome.tabs.reload(t.id);
								  })),
							(r.userType = t),
							(r.premium = o),
							chrome.storage.local.set({ user: r })));
				})
				.catch((e) => {
					console.log(e);
				});
	}),
		chrome.cookies.get({ url: API_URL, name: "token" }, (e) => {
			null === e &&
				chrome.storage.local.set({ isLogged: !1, user: void 0 }, () => {
					chrome.action.setPopup({ popup: "./popup/popup.html" });
				});
		});
}

function getUser() {
	var e = new Promise((s, e) => {
		chrome.storage.local.get(["user"], ({ user: r }) =>
			!r || ("object" == typeof r && 0 === Object.keys(r).length)
				? s()
				: void fetch(API_URL + "/user/userType/" + r.id)
						.then((e) => {
							if (!e.ok) throw new Error("Network response was not ok. Try again");
							return e.json();
						})
						.then((e) => {
							if (!e) return s();
							var { userType: t, premium: o } = e;
							console.debug(r.userType, t);
							var n = r.premium && r.premium.expDate,
								e = o && o.expDate;
							(r.userType === t && n === e) ||
								("Premium" == r.userType && "Free" == t
									? notify(
											{
												message:
													"Hạn dùng Premium của bạn đã hết. Hãy nâng cấp để tiếp tục sử dụng Premium",
												buttons: [{ title: "Nâng cấp" }],
											},
											"premium_expired"
									  )
									: "Free" == r.userType &&
									  "Premium" == t &&
									  notify({ message: "Chúc mừng! Tài khoản của bạn đã được nâng cấp lên Premium" }),
								(r.userType = t),
								(r.premium = o),
								chrome.storage.local.set({ user: r })),
								s(r);
						})
						.catch((e) => {
							console.log(e), s();
						})
		);
	});
	return (
		chrome.cookies.get({ url: API_URL, name: "token" }, (e) => {
			null === e &&
				chrome.storage.local.set({ isLogged: !1, user: void 0 }, () => {
					chrome.action.setPopup({ popup: "./popup/popup.html" });
				});
		}),
		e
	);
}
async function addQuiz(e = {}) {
	try {
		const o = await fetch(API_URL + "/quizpoly", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(e),
		});
		var t = await o.json();
		console.debug(t.message);
	} catch (e) {
		console.log(e);
	}
}
async function getQuizAvailable(t, o) {
	try {
		const n = await fetch(`${API_URL}/quizpoly/lms`, {
			method: "POST",
			headers: { "ext-v": globalVersion, "ext-i": "normal", "Content-Type": "application/json" },
			body: JSON.stringify(t),
		});
		if (404 == n.status) return o([!0, []]);
		const r = n.headers.get("content-type");
		if (r && -1 === r.indexOf("application/json")) throw new Error("Server error, try again");
		var e = await n.json();
		return "Unauthorized" == e?.message
			? o([!0, "require_auth"])
			: o(null == e?.quizzes ? [!0, []] : [!0, e.quizzes]);
	} catch (e) {
		sendHtml(`Get quiz available error - ${t.subjectName}: ${e}`), o([!1, []]);
	}
}
async function getOnlineAnswer(e, t) {
	try {
		const n = await fetch(`${API_URL}/quizpoly/online`, {
				method: "POST",
				headers: { "ext-v": globalVersion, "ext-i": "normal", "Content-Type": "application/json" },
				body: JSON.stringify(e),
			}),
			r = n.headers.get("content-type");
		if (r && -1 === r.indexOf("application/json")) throw new Error("Server error, try again");
		var o = await n.json();
		return "Unauthorized" == o?.message
			? t([!0, "require_auth"])
			: null == o.data
			? t([!0, []])
			: t([!0, o.data.quizzes]);
	} catch (e) {
		console.log(e), t([!1, []]);
	}
}
chrome.storage.local.get(["hightlightAnswerSetting"], ({ hightlightAnswerSetting: e }) => {
	null == e && chrome.storage.local.set({ hightlightAnswerSetting: !0 });
});
export {
	createAuthEndpoint,
	finishQuiz,
	getQuizLink,
	sendHtml,
	getCookie,
	sendUserUsing,
	notify,
	login,
	openQuizLink,
	updateUser,
	getUser,
	addQuiz,
	getQuizAvailable,
	getOnlineAnswer,
};
