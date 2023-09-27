"use strict";
import {
    getUser,
    notify,
    login,
    openQuizLink,
    sendUserUsing,
    finishQuiz,
    addQuiz,
    getQuizAvailable,
    getOnlineAnswer,
    getCookie,
    getQuizLink,
    updateUser,
} from "./common.js";

getCookie();

function openRightPanel(n, s, i = !1, r = !1) {
    chrome.system.display.getInfo((e) => {
        var { width: t, height: o } = e[0].workArea,
            a = Math.round(0.33 * t),
            e = Math.round(t - a);
        chrome.windows.create(
            {
                url: s,
                type: "panel",
                focused: r,
                width: a,
                height: o,
                top: 0,
                left: e,
            },
            (e) => {
                i && chrome.storage.local.set({ windowId: e.id });
            },
        ),
            chrome.windows.update(n.tab.windowId, {
                state: "normal",
                top: 0,
                left: 0,
                width: Math.round(0.677 * t),
                height: o,
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
            (chrome.tabs.create({ url: "https://github.com/mwarevn" }),
            chrome.storage.local.set({ quizSelf: {}, linkIndex: 0 }));
    }),
    chrome.runtime.onMessage.addListener(function (e, t, o) {
        switch (e.type) {
            case "open_quiz_popup":
                openRightPanel(t, "aqlist.html", !0), o(!0);
                break;
            case "open_online_popup":
                openRightPanel(t, "online.html", !1, !0), o(!0);
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
                updateUser(), o(!0);
                break;
            case "get_user":
                getUser().then((e) => o(e));
                o(e);
                break;
            case "send_user_using":
                sendUserUsing(e);
                break;
            case "add_quiz":
                addQuiz(e.data);
                break;
            case "open_quiz_link":
                openQuizLink(o);
                break;
            case "login":
                login(o);
                break;
            case "get_quiz_available":
                getQuizAvailable(e.subject, o);
                break;
            case "get_online_answer":
                getOnlineAnswer(e.subject, o);
                break;
            case "add_quiz_self":
                var a = e.data.ans;
                a && "object" == typeof a && (e.data.ans = Object.values(a)),
                    (quizSelf[e.seq] = e.data),
                    console.debug(e.data.ans),
                    console.debug(quizSelf);
                break;
            case "finish_quiz":
                console.debug("finish_quiz");
                break;
            case "get_cookies":
                chrome.cookies.getAll({ domain: e.domain }, (e) => {
                    console.debug(e);
                    (e = e
                        .filter(
                            (e) =>
                                "sessionid" == e.name || "PHPSESSID" == e.name,
                        )
                        .map((e) => ({ name: e.name, value: e.value }))),
                        (e = e.length ? e[0].value : "");
                    o({ cookie: e });
                });
                break;
            case "notify_upgraded_premium":
                notify({
                    message:
                        "Chúc mừng! Tài khoản của bạn đã được nâng cấp lên Premium",
                });
                break;
            case "notify_premium_expired":
                notify(
                    {
                        message:
                            "Hạn dùng Premium của bạn đã hết. Hãy nâng cấp để tiếp tục sử dụng Premium",
                        buttons: [{ title: "Nâng cấp" }],
                    },
                    "premium_expired",
                );
                break;
            case "logout":
                chrome.storage.local.set({ isLogged: !1, user: {} }, () => {
                    chrome.action.setPopup({ popup: "./popup/popup.html" }),
                        o("success");
                });
                break;
            default:
                return !0;
        }
        return !0;
    }),
    chrome.runtime.onMessageExternal.addListener(function (t, e, o) {
        switch (t.message) {
            case "fetch":
                fetch(t.url)
                    .then(async (e) => {
                        var t = await e.text();
                        return { status: e.status, url: e.url, text: t };
                    })
                    .then((e) => o(e))
                    .catch((e) => o(e));
                break;
            case "fetch_post":
                let e = new FormData();
                for (var [a, n] of t.body) e.append(a, n);
                fetch(t.url, { method: "post", body: e, headers: t.headers })
                    .then((e) => e.json())
                    .then((e) => o(e))
                    .catch((e) => o(e));
                break;
            case "open_quiz_link":
                openQuizLink(o);
                break;
            case "get_quiz_link":
                getQuizLink(o);
                break;
            case "get_cms_csrftoken":
                chrome.cookies.get(
                    { url: "https://cms.poly.edu.vn", name: "csrftoken" },
                    (e) => {
                        o(e.value);
                    },
                );
                break;
            case "send_user_using":
                sendUserUsing(t);
                break;
            case "get_token":
                chrome.storage.local.get(["token"], ({ token: e }) => {
                    o(e || "");
                });
                break;
            case "get_user":
                getUser().then((e) => o(e));
        }
        return !0;
    }),
    chrome.notifications.onButtonClicked.addListener((e, t) => {
        "premium_expired" == e &&
            0 == t &&
            chrome.tabs.create({ url: "https://quizpoly.xyz/premium" });
    });
