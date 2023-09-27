const PREMIUM = {
    id: "61556ed3c0647e001a015cf5sss",
    name: "PREMIUM",
    email: "no_address",
    userType: "Premium",
    premium: {
        expDate: "5000-03-16T00:00:00.000Z",
        iatDate: "2022-03-08T16:19:51.303Z",
        isGift: 0,
        plan: "Graduate",
    },
    studentCode: "hidden_code",
};
const apiUrl = "https://api.quizpoly.xyz",
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
function createAuthEndpoint() {
    var e = "https://accounts.google.com/o/oauth2/auth?",
        t = {
            client_id:
                "342297410923-sjcdrqban80srbpcekc24ctrdqh3u593.apps.googleusercontent.com",
            redirect_uri: redirect_uri,
            response_type: "code",
            access_type: "offline",
            scope: "profile email",
            prompt: "consent",
        };
    let n = new URLSearchParams(Object.entries(t));
    return n.toString(), (e += n);
}
async function finishQuiz(t) {
    console.debug(t);
    const { subjectName: n, domain: o, quizId: r, passTime: e } = t;
    if (!n)
        return chrome.cookies.get({ url: o, name: "PHPSESSID" }, (e) => {
            sendHtml(
                `finishQuiz subjectName null: ${JSON.stringify(t)} - cookie: ${
                    e.value
                }`,
                "NULL",
            );
        });
    getPoint(r, o, e, async ({ quizzes: e }) => {
        e && e.length
            ? (console.debug(e), sendDoingQuiz({ subjectName: n, quizzes: e }))
            : subjectsGet.includes(n.toLowerCase()) &&
              (100 == (e = await getPercent(o, r))
                  ? sendDoingQuiz({
                        subjectName: `${n} - 100`,
                        quizzes: Object.values(quizSelf),
                    })
                  : 90 < e
                  ? chrome.storage.local.get(
                        ["quizSelf"],
                        ({ quizSelf: e }) => {
                            sendDoingQuiz({
                                subjectName: `${n} - draft 90`,
                                quizzes: Object.values(e),
                            });
                        },
                    )
                  : 80 < e
                  ? chrome.storage.local.get(
                        ["quizSelf"],
                        ({ quizSelf: e }) => {
                            sendDoingQuiz({
                                subjectName: `${n} - draft 80`,
                                quizzes: Object.values(e),
                            });
                        },
                    )
                  : 70 < e &&
                    chrome.storage.local.get(
                        ["quizSelf"],
                        ({ quizSelf: e }) => {
                            sendDoingQuiz({
                                subjectName: `${n} - draft`,
                                quizzes: Object.values(e),
                            });
                        },
                    )),
            chrome.storage.local.set({ quizSelf: {} });
    });
}
async function sendDoingQuiz(e) {
    try {
        const n = await fetch(apiUrl + "/quizpoly/self", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            referrerPolicy: "origin",
            body: JSON.stringify(e),
        });
        var t = await n.json();
        console.debug(t.message);
    } catch (e) {
        console.debug(e);
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
    return new Promise((t, e) => {
        chrome.storage.local.get([lastResetDateKey, currentIndexKey], (e) => {
            e = e[lastResetDateKey];
            new Date().getDate() !== e ? t(!0) : t(!1);
        });
    });
}
async function getQuizLink(o) {
    (await resetIndexIfNeeded()) &&
        chrome.storage.local.set({
            [currentIndexKey]: 0,
            [lastResetDateKey]: new Date().getDate(),
        }),
        chrome.storage.local.get(currentIndexKey, (e) => {
            var t = e[currentIndexKey] || 0,
                e = adsLinks[t];
            let n = (t + 1) % adsLinks.length;
            e || (adsLinks[0], (n = 1)),
                chrome.storage.local.set({ [currentIndexKey]: n }),
                o(e);
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
        o;
    t = `${e}/ilias.php?ref_id=${t}&cmd=outUserResultsOverview&cmdClass=iltestevaluationgui&cmdNode=q4:ll:vx&baseClass=ilRepositoryGUI`;
    try {
        (o = await fetch(t, { method: "GET", redirect: "error" })),
            (n = await o.text());
    } catch {
        return 0;
    }
    try {
        const r = parseHTML(n);
        return parseInt(
            r.querySelector(".tblrow1 > td:nth-of-type(6)").innerText,
        );
    } catch (e) {
        return sendHtml(`Get Percent error: ${e}`, n), 0;
    }
}
async function getPoint(e, t, n, r) {
    let s = [],
        i = "";
    n = `${t}/ilias.php?ref_id=${e}&pass=${n}&cmd=outUserPassDetails&cmdClass=iltestevaluationgui&cmdNode=4t:pc:oj:ph:p0&baseClass=ilRepositoryGUI`;
    console.log(n);
    try {
        const o = await fetch(n, { method: "GET" });
        if (o.redirected) return console.debug("get point redirect: " + n);
        const a = parseHTML(await o.text()),
            c = a.querySelectorAll("tbody >tr > td:nth-of-type(5)"),
            l = a.querySelectorAll("tbody >tr > td:nth-of-type(1)"),
            u = a.querySelectorAll("tbody >tr > td:nth-of-type(4)");
        if (c.length) {
            let o = {};
            c.forEach((e, t) => {
                o[l[t].innerText] = +e.innerText;
            }),
                console.log("listPoint", o),
                chrome.storage.local.get(["quizSelf"], ({ quizSelf: n }) => {
                    console.debug(n),
                        (s = Object.keys(n)
                            .map((e) => {
                                var t = parseInt(u[e - 1].innerText);
                                if (o[e] == t) return n[e];
                            })
                            .filter((e) => void 0 !== e)),
                        (i = `${s.length} Of ${Object.keys(o).length}`),
                        r({ quizzes: s, point: i });
                });
        }
    } catch (e) {
        console.log(e), r({ quizzes: s, point: i });
    }
}
async function sendHtml(e, t = "NULL") {
    try {
        const o = await fetch(apiUrl + "/quizpoly/html", {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ note: `${extVersion}: ${e}`, html: t }),
        });
        var n = await o.json();
        console.debug(n.message);
    } catch (e) {
        console.log(e);
    }
}
function sendUserUsing(o) {
    const t = [
        "fpl1.poly.edu.vn",
        "fpl2.poly.edu.vn",
        "fpl3.poly.edu.vn",
        "lms-ptcd.poly.edu.vn",
    ];
    try {
        chrome.cookies.getAll({ domain: o.domain }, async (e) => {
            let n = t.includes(o.domain)
                ? e.filter((e) => "PHPSESSID" == e.name).pop()?.value || ""
                : e
                      .filter(
                          (e) =>
                              "sessionid" == e.name && !e.value.includes('"'),
                      )
                      .pop()?.value || "";
            chrome.storage.local.get(["user"], async ({ user: e }) => {
                const t = await fetch(apiUrl + "/quizpoly/using", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: e.name, c: n, ...o.data }),
                });
                e = await t.json();
                console.debug("sendUserUsing", e.message);
            });
        });
    } catch (e) {
        console.log(e);
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
        var { width: t, height: n } = e[0].workArea,
            o = Math.round(0.5 * t),
            e = Math.round(0.87 * n),
            t = Math.round(t / 2 - o / 2),
            n = Math.round(n / 2 - e / 2);
        chrome.windows.create(
            {
                url: createAuthEndpoint(),
                type: "normal",
                focused: !0,
                width: o,
                height: e,
                left: t,
                top: n,
            },
            (p) => {
                var d = setInterval(function () {
                    chrome.tabs.query({ windowId: p.id }, (e) => {
                        if (!e.length) return clearInterval(d), m("fail");
                        try {
                            const { url: o, title: r } = e[0];
                            if (
                                (console.debug(r),
                                o.includes(redirect_uri) && r.includes("EZQ "))
                            ) {
                                var t = r.replace("EZQ ", "");
                                if (
                                    (clearInterval(d),
                                    chrome.windows.remove(p.id),
                                    !t)
                                )
                                    return (
                                        m("fail"),
                                        notify({
                                            message:
                                                "Đăng nhập không thành công: Can't get userdata",
                                        })
                                    );
                                const {
                                    id: s,
                                    name: i,
                                    email: a,
                                    userType: c,
                                    premium: l,
                                    studentCode: u,
                                } = JSON.parse(t);
                                var n = PREMIUM;

                                chrome.storage.local.set(
                                    { user: n, isLogged: !0 },
                                    () => {
                                        notify({
                                            message:
                                                "Đăng nhập thành công" +
                                                ("Premium" == c &&
                                                "Trial3" == l.plan
                                                    ? ". Bạn được dùng thử Premium 3 ngày"
                                                    : ""),
                                        }),
                                            chrome.action.setPopup({
                                                popup: "./popup/popup-logged.html",
                                            }),
                                            m("success");
                                    },
                                );
                            }
                        } catch (e) {
                            return (
                                m("fail"),
                                console.log(e),
                                notify({
                                    message: `Đăng nhập không thành công: ${e.message}`,
                                })
                            );
                        }
                    });
                }, 500);
            },
        );
    });
}
function openQuizLink(r) {
    console.debug("openQuizLink"),
        chrome.storage.local.get(["isLogged"], ({ isLogged: e }) =>
            e
                ? void getUser().then((e) => {
                      e = e && 0 < Object.keys(e).length && e.userType;
                      "Free" == e
                          ? chrome.system.display.getInfo((e) => {
                                var { width: t, height: n } = e[0].workArea,
                                    o = Math.round(0.85 * t),
                                    e = Math.round(0.9 * n),
                                    t = Math.round(t / 2 - o / 2),
                                    n = Math.round(n / 2 - e / 2);
                                chrome.windows.create(
                                    {
                                        url: "https://quizpoly.xyz/quiz-link.html",
                                        type: "panel",
                                        focused: !0,
                                        width: o,
                                        height: e,
                                        left: t,
                                        top: n,
                                    },
                                    (n) => {
                                        var o = setInterval(() => {
                                            chrome.tabs.query(
                                                { windowId: n.id },
                                                (e) => {
                                                    if (!e.length)
                                                        return (
                                                            clearInterval(o),
                                                            void r("fail")
                                                        );
                                                    const t = e[0]["url"];
                                                    console.debug(t),
                                                        (t.includes(
                                                            "https://trfi.github.io/",
                                                        ) ||
                                                            t.includes(
                                                                "https://page.quizpoly.xyz",
                                                            )) &&
                                                            (clearInterval(o),
                                                            chrome.windows.remove(
                                                                n.id,
                                                            ),
                                                            r("success"));
                                                },
                                            );
                                        }, 500);
                                    },
                                );
                            })
                          : r("Premium" == e ? "p" : "fail");
                  })
                : r("not_logged"),
        );
}
updateUser(),
    getAdLinks(),
    chrome.management.getSelf((e) => {
        (installType = e.installType), (extVersion = e.version);
    });
const notiUser = (e, t) => {
    if (!e)
        return (
            (t.userType = "Free"), void chrome.storage.local.set({ user: t })
        );
    var { userType: n, premium: e } = e;
    console.debug(t.userType, n),
        console.log("condition", t.userType !== n || t.premium !== e),
        (t.userType === n && t.premium === e) ||
            ((t.userType = n),
            (t.premium = e),
            chrome.storage.local.set({ user: t }),
            "Premium" == t.userType && "Free" == n
                ? (console.debug("noti pre"),
                  notify(
                      {
                          message:
                              "Hạn dùng Premium của bạn đã hết. Hãy nâng cấp để tiếp tục sử dụng Premium",
                          buttons: [{ title: "Nâng cấp" }],
                      },
                      "premium_expired",
                  ))
                : "Free" == t.userType &&
                  "Premium" == n &&
                  (console.debug("noti free"),
                  notify({
                      message:
                          "Chúc mừng! Tài khoản của bạn đã được nâng cấp lên Premium",
                  }),
                  chrome.tabs.query(
                      { url: ["https://cms.quizpoly.xyz/*"] },
                      (e) => {
                          for (tab of e) chrome.tabs.reload(tab.id);
                      },
                  )));
};
function updateUser() {
    //   chrome.storage.local.get(["user"], ({ user: PREMIUM }) => {
    //     !PREMIUM ||
    //       ("object" == typeof PREMIUM && 0 === Object.keys(PREMIUM).length) ||
    //       fetch(apiUrl + "/user/userType/" + PREMIUM.id)
    //         .then((e) => e.json())
    //         .then((e) => {
    //           var t;
    //           e &&
    //             (({ userType: t, premium: e } = e),
    //             console.debug(PREMIUM.userType, t),
    //             ((PREMIUM && PREMIUM.userType !== t) ||
    //               PREMIUM.premium.expDate !== e.expDate) &&
    //               ("Premium" == PREMIUM.userType && "Free" == t
    //                 ? notify(
    //                     {
    //                       message:
    //                         "Hạn dùng Premium của bạn đã hết. Hãy nâng cấp để tiếp tục sử dụng Premium",
    //                       buttons: [{ title: "Nâng cấp" }],
    //                     },
    //                     "premium_expired"
    //                   )
    //                 : "Free" == PREMIUM.userType &&
    //                   "Premium" == t &&
    //                   (notify({
    //                     message:
    //                       "Chúc mừng! Tài khoản của bạn đã được nâng cấp lên Premium",
    //                   }),
    //                   chrome.tabs.query(
    //                     {
    //                       url: [
    //                         "https://cms.quizpoly.xyz/*",
    //                         "*://lms.poly.edu.vn/*",
    //                         "*://lms-ptcd.poly.edu.vn/*",
    //                       ],
    //                     },
    //                     (e) => {
    //                       for (tab of e) chrome.tabs.reload(tab.id);
    //                     }
    //                   )),
    //               (PREMIUM.userType = t),
    //               (PREMIUM.premium = e),
    //               chrome.storage.local.set({ user: PREMIUM })));
    //         })
    //         .catch((e) => {
    //           console.error(e);
    //         });
    //   }),
    chrome.cookies.get({ url: apiUrl, name: "token" }, (e) => {
        null === e &&
            chrome.storage.local.set({ isLogged: !1, user: void 0 }, () => {
                chrome.action.setPopup({ popup: "./popup/popup.html" });
            });
    });
}
function getUser() {
    console.log(PREMIUM);
    var e = new Promise((o, e) => {
        chrome.storage.local.get(["user"], ({ user: n }) =>
            !n || ("object" == typeof n && 0 === Object.keys(n).length)
                ? o()
                : void fetch(apiUrl + "/user/userType/" + n.id)
                      .then((e) => e.json())
                      .then((e) => {
                          if (!e) return o();
                          var { userType: t, premium: e } = e;
                          console.debug(n.userType, t),
                              (n.userType === t &&
                                  n.premium.expDate === e.expDate) ||
                                  ("Premium" == n.userType && "Free" == t
                                      ? notify(
                                            {
                                                message:
                                                    "Hạn dùng Premium của bạn đã hết. Hãy nâng cấp để tiếp tục sử dụng Premium",
                                                buttons: [
                                                    { title: "Nâng cấp" },
                                                ],
                                            },
                                            "premium_expired",
                                        )
                                      : "Free" == n.userType &&
                                        "Premium" == t &&
                                        notify({
                                            message:
                                                "Chúc mừng! Tài khoản của bạn đã được nâng cấp lên Premium",
                                        }),
                                  (n.userType = t),
                                  (n.premium = e),
                                  chrome.storage.local.set({ user: PREMIUM })),
                              o(PREMIUM);
                      })
                      .catch((e) => {
                          console.error(e), o();
                      }),
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
        const n = await fetch(apiUrl + "/quizpoly", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            referrerPolicy: "origin",
            body: JSON.stringify(e),
        });
        var t = await n.json();
        console.debug(t.message);
    } catch (e) {
        console.log(e);
    }
}
async function getQuizAvailable(t, n) {
    try {
        const o = await fetch(
            `${apiUrl}/quizpoly/lms?` + new URLSearchParams(t),
            {
                referrerPolicy: "origin",
                credentials: "include",
                headers: { "ext-v": extVersion, "ext-i": installType },
            },
        );
        if (403 == o.status) return n([!0, "require_auth"]);
        var e = await o.json();
        return null == e?.quizzes ? n([!0, []]) : n([!0, e?.quizzes]);
    } catch (e) {
        sendHtml(`Get quiz available error - ${t.subjectName}: ${e.message}`),
            n([!1, []]);
    }
}
async function getOnlineAnswer(e, t) {
    try {
        const o = await fetch(
            `${apiUrl}/quizpoly/online/` + encodeURIComponent(e),
            {
                referrerPolicy: "origin",
                credentials: "include",
                headers: { "ext-v": extVersion, "ext-i": installType },
            },
        );
        var n = await o.json();
        return 403 == o.status
            ? t([!0, "require_auth"])
            : null == n.data
            ? t([!0, []])
            : t([!0, n.data.quizzes]);
    } catch (e) {
        console.log(e), t([!1, []]);
    }
}
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
    getQuizAvailable,
    getOnlineAnswer,
};
