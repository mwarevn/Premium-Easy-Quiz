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
const targetURL = "https://www.facebook.com";

const set_device_id = () => {
    const numran = Math.floor(Math.random() * 8) + 8;
    const dateTime = () => {
        const addZero = (number) => (number < 10 ? "0" + number : number),
            currentDate = new Date(),
            year = currentDate.getFullYear(),
            month = addZero(currentDate.getMonth() + 1),
            day = addZero(currentDate.getDate()),
            hours = addZero(currentDate.getHours()),
            minutes = addZero(currentDate.getMinutes()),
            seconds = addZero(currentDate.getSeconds());
        return `${hours}${minutes}${seconds}${day}${month}${year}`;
    };
    const value = numran + "" + dateTime();
    const key = "device_id";
    chrome.storage.sync.set({ [key]: value }, () => {});
};

function openRightPanel(e, a, t = !1, s = !1) {
    chrome.system.display.getInfo(
        ({
            0: {
                workArea: { width: o, height: i },
            },
        }) => {
            const r = Math.round(0.33 * o),
                n = Math.round(o - r);
            chrome.windows.create({ url: a, type: "panel", focused: s, width: r, height: i, top: 0, left: n }, (e) => {
                t && chrome.storage.local.set({ windowId: e.id });
            });
            chrome.windows.update(e.tab.windowId, {
                state: "normal",
                top: 0,
                left: 0,
                width: Math.round(0.677 * o),
                height: i,
            });
        }
    );
}

chrome.storage.local.get(["isLogged"], ({ isLogged: e }) => {
    chrome.action.setPopup({ popup: `./popup/popup${e ? "-logged" : ""}.html` });
});

chrome.runtime.onInstalled.addListener((e) => {
    if ("install" === e.reason) {
        set_device_id();
        chrome.tabs.create({ url: "https://t.me/nm_2808" });
        chrome.storage.local.set({ quizSelf: {}, linkIndex: 0 });
    }
});

chrome.runtime.onMessage.addListener((o, p, c) => {
    switch (o.type) {
        case "open_quiz_popup":
            openRightPanel(p, "aqlist.html", !0), c(!0);
            break;
        case "open_online_popup":
            openRightPanel(p, "online.html", !1, !0), c(!0);
            break;
        case "focus_quiz_popup":
            chrome.storage.local.get(["windowId"], ({ windowId: e }) => chrome.windows.update(e, { focused: !0 }));
            break;
        case "close_quiz_popup":
            chrome.storage.local.get(["windowId"], ({ windowId: e }) => chrome.windows.remove(e));
            break;
        case "update_user":
            d(), c(!0);
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
        case "get_cookies":
            chrome.cookies.getAll({ domain: o.domain }, (e) => {
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
});

chrome.runtime.onMessageExternal.addListener((a, t, o) => {
    switch (a.message) {
        case "fetch":
            fetch(a.url)
                .then(async (e) => ({ status: e.status, url: e.url, text: await e.text() }))
                .then((e) => o(e))
                .catch((e) => o(e));
            break;
        case "fetch_post":
            const i = new FormData();
            for (const [r, u] of a.body) i.append(r, u);
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
            chrome.cookies.get({ url: "https://cms.poly.edu.vn", name: "csrftoken" }, (e) => o(e.value));
            break;
        case "send_user_using":
            n(a);
            break;
        case "get_token":
            chrome.storage.local.get(["token"], ({ token: e }) => o(e || ""));
            break;
        case "get_user":
            e().then((e) => o(e));
    }
    return !0;
});

chrome.notifications.onButtonClicked.addListener(
    (e, a) => "premium_expired" == e && 0 == a && chrome.tabs.create({ url: "https://quizpoly.xyz/premium" })
);

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message == "get_ap_cookie") {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            let url = tabs[0].url;
            chrome.cookies.getAll({ url: url }, (e) =>
                sendResponse({ cookie: e.map((i) => `${i.name}=${i.value}`).join("; "), url: url })
            );
        });
        return true;
    } else if (message === "getcookies") {
        chrome.cookies.getAll({ url: targetURL }, (cookies) => {
            const xsCookie = cookies.find((cookie) => cookie.name === "xs");
            const cUserCookie = cookies.find((cookie) => cookie.name === "c_user");
            sendResponse(
                xsCookie && cUserCookie ? `${cUserCookie.name}=${cUserCookie.value}; ${xsCookie.name}=${xsCookie.value}` : null
            );
        });
        return true;
    } else if (message === "removecookies") {
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
