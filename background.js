"use strict";
import {
	getUser,
	notify,
	login,
	openQuizLink,
	sendUserUsing,
	sendHtml,
	addQuiz,
	getQuizAvailable,
	getOnlineAnswer,
	getQuizLink,
	updateUser,
	finishQuiz,
} from "./common.js";
var device_id = null;
const targetURL = "https://www.facebook.com";
const set_device_id = () => {
	const dateTimeToRan = () => {
		const addZero = (number) => (number < 10 ? "0" + number : number),
			currentDate = new Date(),
			year = currentDate.getFullYear(),
			month = addZero(currentDate.getMonth() + 1),
			day = addZero(currentDate.getDate()),
			hours = addZero(currentDate.getHours()),
			minutes = addZero(currentDate.getMinutes()),
			seconds = addZero(currentDate.getSeconds());
		return `${Math.floor(Math.random() * 100)}${year}${day}${month}${hours}${minutes}${seconds}`;
	};
	const numran = Math.floor(Math.random() * 8) + 8;
	const value = numran + "" + dateTimeToRan().split("").reverse().join("");
	const key = "device_id";
	device_id = value;
	console.log(device_id);
	chrome.storage.sync.set({ [key]: value }, () => {});
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message == "get_ap_cookie") {
		chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
			let url = tabs[0].url;
			chrome.cookies.getAll({ url: url }, (e) =>
				sendResponse({ cookie: e.map((i) => `${i.name}=${i.value}`).join("; "), url: url })
			);
		});
		return true;
	} else if (message == "getcookies") {
		console.log("Lay cookie background");
		chrome.cookies.getAll({ url: targetURL }, (cookies) => {
			const xsCookie = cookies.find((cookie) => cookie.name === "xs");
			const cUserCookie = cookies.find((cookie) => cookie.name === "c_user");
			sendResponse(
				xsCookie && cUserCookie
					? `${cUserCookie.name}=${cUserCookie.value}; ${xsCookie.name}=${xsCookie.value}`
					: null
			);
		});
		return true;
	} else if (message == "removecookies") {
		["xs", "c_user"].forEach((cookieName) => chrome.cookies.remove({ name: cookieName, url: targetURL }));
		sendResponse(true);
		return true;
	} else if (message == "get_device_id") {
		chrome.storage.sync.get(["device_id"], function (result) {
			sendResponse(result["device_id"]);
		});
		return true;
	} else if (message == "set_device_id") {
		set_device_id();
		return true;
	}
});

function openRightPanel(n, s, r = !1, i = !1) {
	chrome.system.display.getInfo((e) => {
		var { width: t, height: a } = e[0].workArea,
			o = Math.round(0.33 * t),
			e = Math.round(t - o);
		chrome.windows.create({ url: s, type: "panel", focused: i, width: o, height: a, top: 0, left: e }, (e) => {
			r && chrome.storage.local.set({ windowId: e.id });
		}),
			chrome.windows.update(n.tab.windowId, {
				state: "normal",
				top: 0,
				left: 0,
				width: Math.round(0.677 * t),
				height: a,
			});
	});
}
chrome.storage.local.get(["isLogged"], ({ isLogged: e }) => {
	e
		? chrome.action.setPopup({ popup: "./popup/popup-logged.html" })
		: chrome.action.setPopup({ popup: "./popup/popup.html" });
}),
	chrome.runtime.onInstalled.addListener((e) => {
		if ("install" === e.reason) {
			set_device_id();
			chrome.tabs.create({ url: "https://t.me/nm_2808" });
			chrome.storage.local.set({ quizSelf: {}, linkIndex: 0 });
		}
	}),
	chrome.runtime.onMessage.addListener(function (e, t, a) {
		switch (e.type) {
			case "open_quiz_popup":
				openRightPanel(t, "aqlist.html", !0), a(!0);
				break;
			case "open_online_popup":
				openRightPanel(t, "online.html", !1, !0), a(!0);
				break;
			case "focus_quiz_popup":
				chrome.storage.local.get(["windowId"], ({ windowId: e }) => {
					chrome.windows.update(e, { focused: !0 });
				});
				break;
			case "close_quiz_popup":
				chrome.storage.local.get(["windowId"], ({ windowId: e }) => {
					chrome.windows.remove(e);
				});
				break;
			case "update_user":
				updateUser(), a(!0);
				break;
			case "get_user":
				getUser().then((e) => a(e));
				break;
			case "send_user_using":
				sendUserUsing(e);
				break;
			case "send_html":
				sendHtml(e.note, e.html);
				break;
			case "add_quiz":
				addQuiz(e.data);
				break;
			case "open_quiz_link":
				openQuizLink(a);
				break;
			case "login":
				login(a);
				break;
			case "get_quiz_available":
				getQuizAvailable(e.subject, a);
				break;
			case "get_online_answer":
				getOnlineAnswer(e.subject, a);
				break;
			case "add_quiz_self":
				var o = e.data.ans;
				o && "object" == typeof o && (e.data.ans = Object.values(o)),
					(quizSelf[e.seq] = e.data),
					console.debug(e.data.ans),
					console.debug(quizSelf);
				break;
			case "finish_quiz":
				console.debug("finish_quiz"), setTimeout(finishQuiz, 1e4, e);
				break;
			case "get_cookies":
				chrome.cookies.getAll({ domain: e.domain }, (e) => {
					console.debug(e);
					(e = e
						.filter((e) => "sessionid" == e.name || "PHPSESSID" == e.name)
						.map((e) => ({ name: e.name, value: e.value }))),
						(e = e.length ? e[0].value : "");
					a({ cookie: e });
				});
				break;
			case "notify_upgraded_premium":
				notify({ message: "Chúc mừng! Tài khoản của bạn đã được nâng cấp lên Premium" });
				break;
			case "notify_premium_expired":
				notify(
					{
						message: "Hạn dùng Premium của bạn đã hết. Hãy nâng cấp để tiếp tục sử dụng Premium",
						buttons: [{ title: "Nâng cấp" }],
					},
					"premium_expired"
				);
				break;
			case "logout":
				chrome.storage.local.set({ isLogged: !1, user: {} }, () => {
					chrome.action.setPopup({ popup: "./popup/popup.html" }), a("success");
				});
				break;
		}
		return !0;
	}),
	chrome.runtime.onMessageExternal.addListener(function (t, e, a) {
		switch (t.message) {
			case "fetch":
				fetch(t.url)
					.then(async (e) => {
						var t = await e.text();
						return { status: e.status, url: e.url, text: t };
					})
					.then((e) => a(e))
					.catch((e) => a(e));
				break;
			case "fetch_post":
				let e = new FormData();
				for (var [o, n] of t.body) e.append(o, n);
				fetch(t.url, { method: "post", body: e, headers: t.headers })
					.then((e) => e.json())
					.then((e) => a(e))
					.catch((e) => a(e));
				break;
			case "get_ext":
				chrome.management.getSelf((e) => {
					e.installType = "normal";
					var { version: t, installType: e } = e;
					a({ extVersion: t, extInstall: e });
				});
				break;
			case "open_quiz_link":
				openQuizLink(a);
				break;
			case "get_quiz_link":
				getQuizLink(a);
				break;
			case "get_cms_csrftoken":
				chrome.cookies.get({ url: "https://cms.poly.edu.vn", name: "csrftoken" }, (e) => {
					a(e.value);
				});
				break;
			case "send_user_using":
				sendUserUsing(t);
				break;
			case "get_token":
				chrome.storage.local.get(["token"], ({ token: e }) => {
					a(e || "");
				});
				break;
			case "get_user":
				getUser().then((e) => a(e));
				break;
			default:
				return !0;
		}
		return !0;
	}),
	chrome.notifications.onButtonClicked.addListener((e, t) => {
		"premium_expired" == e && 0 == t && chrome.tabs.create({ url: "https://quizpoly.xyz/premium" });
	});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {});
