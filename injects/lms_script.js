"use strict";
var apiUrl = "https://api.quizpoly.xyz/quizpoly",
    version = chrome.runtime.getManifest().version,
    server = window.location.origin,
    currentUrl = window.location.href,
    urlParsed = new URL(currentUrl),
    quizId = getQuizId(),
    [sequence, totalQues] = getSequence(),
    CanNotGetAvailableAnswerMessage =
        "Không lấy được đáp án. Vui lòng thử lại hoặc liên hệ Admin",
    NoAvailableAnswerMessage =
        "Hiện chưa có đáp án cho môn học này, thử lại sau";
function decodeEntities(e) {
    let t = document.createElement("div");
    return (
        e &&
            "string" == typeof e &&
            ((e = (e = e.replace(
                /<script[^>]*>([\S\s]*?)<\/script>/gim,
                "",
            )).replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim, "")),
            (t.innerHTML = e),
            (e = t.textContent),
            (t.textContent = "")),
        e
    );
}
function getRandomInt(e, t) {
    return (
        (e = Math.ceil(e)),
        (t = Math.floor(t)),
        Math.floor(Math.random() * (t - e) + e)
    );
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
            .replace(/' . '/g, ". "),
    );
}
function parseHTML(e) {
    const t = document.createElement("div");
    return (t.innerHTML = e), t;
}
async function sendHtml(e, t) {
    try {
        t =
            t ||
            document.body.innerHTML.replaceAll("\n", "").replaceAll("\t", "");
        const n = await fetch(apiUrl + "/html", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ note: `${version}: ${e}`, html: t }),
        });
        var r = await n.json();
        console.debug(r.message);
    } catch (e) {
        console.debug(e);
    }
}
function u() {
    return new Promise((t) => {
        chrome.runtime.sendMessage({ type: "open_quiz_link" }, (e) => {
            console.debug(e),
                "success" == e || "p" == e
                    ? t(!0)
                    : ("not_logged" == e &&
                          alert(
                              "Bạn chưa đăng nhập tiện ích. Click vào icon tiện ích sau đó đăng nhập để sử dụng",
                          ),
                      t(!1));
        });
    });
}
function getQuizNumber() {
    try {
        let e = document.querySelector(".ilAccAnchor");
        return (
            (e = e || document.querySelector("#kioskTestTitle")),
            e && e.textContent
                ? (t = (t = e.textContent).match(/(^|\D)([1-9][0-9]?)(\D|$)/))
                    ? Number(t[2])
                    : 0
                : 0
        );
    } catch (e) {
        return 0;
    }
    var t;
}
function getSubjectCode(e = document) {
    var t = e.querySelectorAll(".breadcrumb a");
    for (let e = 0; e < t.length; e++) {
        const n = t[e];
        var r = /\b[A-Z]{3} {0,1}\d{3,4}/;
        const o = n.textContent.trim();
        if (!o.startsWith("HK")) {
            const s = o.match(r);
            if (s) return s[0].replace(" ", "");
        }
    }
}
function getSubject(n = document) {
    var o = window.location.host;
    let s = "";
    if ("lms-ptcd.poly.edu.vn" === o) {
        let e = n.querySelector("ol>li:nth-of-type(4)>a");
        if (!e) return "";
        let t = e.textContent.replace("z_", "").replace(/_/g, "-").split("-");
        s =
            1 < t.length
                ? t[1].split(":").pop().trim().replace("Môn ", "")
                : ((e = n.querySelector("ol>li:nth-of-type(5)>a")),
                  (t = e.textContent
                      .replace("z_", "")
                      .replace(/_/g, "-")
                      .split("-")),
                  (1 < t.length ? t[1] : t[0])
                      .split(":")
                      .pop()
                      .trim()
                      .replace("Môn ", ""));
    } else
        try {
            let t = n.querySelector(".breadcrumb>.crumb:nth-of-type(6)");
            if (!t)
                return (
                    chrome.runtime.sendMessage(
                        { type: "get_cookies", domain: o },
                        (t) =>
                            sendHtml(
                                `getSubject lms_start can't find breadcumb element - ${t.cookie} - ${e}`,
                            ),
                    ),
                    ""
                );
            (s = t.innerText.trim()),
                ([
                    "2d, 3d animation - dựng phim",
                    "2d",
                    "cơ khí",
                    "tự động hoá",
                    "thiết kế cơ bản",
                ].includes(s.toLowerCase()) ||
                    s.toLowerCase().startsWith("ngành")) &&
                    ((t = n.querySelector(".breadcrumb>.crumb:nth-of-type(7)")),
                    (s = t.innerText.trim()));
            let r = t.innerText.replace(/_/g, "-").split("-");
            return (
                1 < r.length
                    ? ((s = r[0].toLowerCase().includes("các lớp")
                          ? r[2]
                          : r[1].split(":").pop()),
                      s.includes("Chuyên đề")
                          ? (s = s.split("Chuyên đề")[1].split(".").pop())
                          : s.includes(".") && (s = s.split(".").pop()))
                    : (s = r[0]),
                s ? s.replace("Môn ", "").trim() : ""
            );
        } catch (e) {
            return console.debug(e), "";
        }
    return s;
}
async function getSubjectById() {
    let t = "<div></div>",
        e = document.createElement("div");
    try {
        const o = `${server}/goto.php?target=crs_${quizId}`,
            s = await fetch(o, { method: "GET", redirect: "follow" });
        (t = await s.text()), (e = parseHTML(t));
        var r = getSubject(e),
            n = getSubjectCode(e);
        if (r) chrome.storage.local.set({ subjectName: r, subjectCode: n });
        else {
            if (
                e.querySelector("#challenge-form") ||
                t.includes("turn JavaScript on")
            )
                return "cloudflare_check";
            chrome.runtime.sendMessage(
                { type: "get_cookies", domain: window.location.host },
                (e) => {
                    sendHtml(
                        `subjectName null after getSubjectById - ${o} - ${e.cookie}`,
                        t,
                    );
                },
            );
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
    if (window.location.href.includes("outUserPassDetails")) return 0;
    let r = null;
    var t =
        "lms-ptcd.poly.edu.vn" == window.location.host
            ? "9r:13t:7j:8c:7q"
            : "4t:pc:oj:ph:p0";
    try {
        const n = await fetch(
            `${server}/ilias.php?ref_id=${e}&cmd=outUserResultsOverview&cmdClass=iltestevaluationgui&cmdNode=${t}&baseClass=ilrepositorygui`,
        );
        r = await n.text();
        const o = parseHTML(r),
            s = o.querySelector(".ilTableFootLight");
        return s ? parseInt(s.textContent.split(" ").pop()) : 0;
    } catch (t) {
        return (
            chrome.runtime.sendMessage(
                { type: "get_cookies", domain: window.location.host },
                (e) => {
                    sendHtml(`Get PassTimes error: ${t} - ${e.cookie}`, r);
                },
            ),
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
    chrome.runtime.sendMessage(
        { type: "quiz_lms", ques: e, ans: t, seq: r },
        function (e) {
            console.debug(e);
        },
    );
}
async function getUserInfo() {
    let e = "NULL",
        t = "NULL",
        r = server;
    var n = window.location.host,
        o = `${server}/ilias.php?baseClass=${
            "lms-ptcd.poly.edu.vn" == n
                ? "ilPersonalDesktopGUI"
                : "ilDashboardGUI"
        }&cmd=jumpToProfile`;
    let s = "<div></div>";
    try {
        const i = await fetch(o, { method: "GET", redirect: "follow" });
        if (!i.ok) return { name: e, studentCode: t, userServer: r };
        s = await i.text();
        const a = parseHTML(s);
        (e = a.querySelector("#usr_firstname").value),
            (t = a.querySelector("#hiddenne_un").value),
            (r = a.querySelector("#hiddenne_dr")?.value?.replace("USER_", "")),
            "lms-ptcd.poly.edu.vn" == n && r && (r = "PTCD " + r);
    } catch (t) {
        s.includes("an error occured") ||
            s.includes("Too many connections") ||
            s.includes("turn JavaScript on") ||
            chrome.runtime.sendMessage(
                { type: "get_cookies", domain: n },
                (e) => {
                    sendHtml(`getUserInfo error: ${t} - ${e.cookie}`, s);
                },
            );
    }
    return { name: e, studentCode: t, userServer: r };
}
async function getQuesId(e, t) {
    t = t || 0;
    let r = null;
    var n =
            "lms-ptcd.poly.edu.vn" == window.location.host
                ? "9r:13t:7j:8c:7q"
                : "4t:pc:oj:ph:p0",
        n = `${server}/ilias.php?ref_id=${e}&pass=${t}&cmd=outUserPassDetails&cmdClass=iltestevaluationgui&cmdNode=${n}&baseClass=ilRepositoryGUI`;
    try {
        r = await fetch(n, { method: "GET", redirect: "error" });
        const o = parseHTML(await r.text());
        return Array.from(o.querySelectorAll("tbody > tr a")).map((e) =>
            e.getAttribute("href"),
        );
    } catch (e) {
        return console.debug(`getQuesId error: ${e}`), [];
    }
}
function getQues(e = document) {
    try {
        var t = e.querySelector(".ilc_qtitle_Title img"),
            r = t ? "\n" + formatImg(t.outerHTML) : "";
        return formatBeforeAdd(
            `${e.querySelector(".ilc_qtitle_Title").innerText.trim()}${r}`,
        );
    } catch (e) {
        return "";
    }
}
function getSequence() {
    let t, r;
    var n = document.querySelector(
        ".ilTestQuestionSubtitleBlocks > .pull-left > div",
    );
    if (n) {
        let e = n.innerText;
        return (
            (e =
                e ||
                document.querySelector(".ilc_page_title_PageTitle").innerText),
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
    const o = await fetch(`${server}/${t}`, {
        method: "GET",
        redirect: "error",
    });
    t = await o.text();
    const s = parseHTML(t);
    let i = s.querySelector(
        ".ilc_question_Standard:nth-of-type(4) > div > .answer-table",
    );
    if (!i) throw new Error(`tableAnswer null - ${e}`);
    ((r = getQues(s)) && "Câu hỏi" == r) || "Question" == r
        ? sendHtml("ques = Câu hỏi | Question", t)
        : r || sendHtml(`ques null - ${r} ${e}`, t);
    try {
        var a = [...i.querySelectorAll("img[title=Checked]")].map((e) => {
            var t = e.parentNode.nextElementSibling.querySelector("img");
            return t
                ? formatImg(t.outerHTML)
                : formatBeforeAdd(e.parentNode.nextElementSibling.textContent);
        });
        n = 1 == a.length ? a[0] : a;
    } catch (e) {
        throw new Error(`getQA error: ${e}`);
    }
    if (!n) throw new Error(`ans null - ${e}`);
    return { ques: r, ans: n };
}
async function addQuiz(e, t, r) {
    chrome.runtime.sendMessage({
        type: "add_quiz",
        data: { subjectName: e, subjectCode: t, quizzes: r },
    });
}
async function getToken() {
    return new Promise((t) => {
        chrome.storage.local.get(["token"], ({ token: e }) => {
            chrome.runtime.lastError &&
                sendHtml(
                    `Can't get token ${chrome.runtime.lastError.message}`,
                    "NULL",
                ),
                t(e || "");
        });
    });
}
async function getQuizAvailable(e, t) {
    return new Promise((r, n) => {
        chrome.runtime.sendMessage(
            {
                type: "get_quiz_available",
                subject: { subjectName: e, subjectCode: t },
            },
            (e) => {
                return chrome.runtime.lastError
                    ? (sendHtml(
                          `Get quiz available error ex - ${window.location.href}: ${chrome.runtime.lastError.message}`,
                          "NULL",
                      ),
                      n())
                    : void (e ? (([t, e] = e), t ? r(e) : n()) : n());
                var t;
            },
        );
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
            domain: window.location.host,
            data: { ...e, getQuizType: t, subjectName: r, quizNumber: n },
        });
}
function autoQuiz(e, t, r, n) {
    let o = getQues();
    console.debug(formatCompare(o));
    let s = "",
        i = Boolean(
            document.querySelector(
                ".nobackground.ilClearFloat input[type=checkbox]",
            ),
        ),
        a = null,
        c = !0,
        l = document.querySelectorAll(".middle>label");
    l.length || (l = document.querySelectorAll(".middle>span")),
        l.length ||
            (l = document.querySelectorAll(".ilc_qanswer_Answer label"));
    const u = [
        document.querySelector("#nextbutton"),
        document.querySelector("#bottomnextbutton"),
    ];
    try {
        if (!e || !e.length) return;
        var d;
        if (
            ("direct" == t
                ? (s = e[sequence - 1].ans)
                : "available" == t &&
                  ((d = e.find(
                      (e) =>
                          e.ques && formatCompare(e.ques) === formatCompare(o),
                  )),
                  console.debug(d),
                  d && (s = d.ans)),
            console.debug("textAnswer:", s),
            s)
        ) {
            if (sequence < totalQues) {
                try {
                    u.forEach((e) => (e.style.display = "none"));
                } catch (e) {
                    sendHtml(
                        `Auto answer: Can not add event click to next button: ${e} - ${window.location.href} - ${sequence}: ${totalQues}`,
                    );
                }
                setTimeout(
                    () =>
                        u.forEach((e) => {
                            e ? (e.style.display = "") : e;
                        }),
                    1e3,
                );
            }
            !(function () {
                if ("object" == typeof s)
                    l.forEach((t) => {
                        // set true aswaer
                        t ? t.click() : t;
                        s.find((e) => e == formatBeforeAdd(t.textContent)) &&
                            (t.style.color = "green");
                    });
                else {
                    let e = [...l].find((e) => {
                        var t = e.querySelector("img");
                        return !!(
                            (t && formatImg(t.outerHTML) == s) ||
                            formatBeforeAdd(e.textContent) == s
                        );
                    });
                    // set true aswaer

                    e ? e.click() : e;

                    e
                        ? (e.style.color = "green")
                        : console.debug("Can not find element answer");
                }
            })(),
                showAnswer(o, s, sequence);
        } else
            i &&
                (sequence == totalQues && (c = !1),
                setTimeout(() => {
                    l.forEach((e) => e.dispatchEvent(new MouseEvent("click"))),
                        u.forEach((e) => e.removeEventListener("click", m));
                }, 700)),
                showAnswer(o, "Chưa có đáp án", sequence);
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
    sequence == totalQues &&
        (function () {
            var e = [
                ...document.querySelectorAll(
                    "a[data-nextcmd=outQuestionSummary]",
                ),
                ...document.querySelectorAll("a[data-nextcmd=finishTest]"),
            ];
            if (e.length)
                for (var t of e)
                    t.addEventListener("click", () => {
                        chrome.runtime.sendMessage({
                            type: "close_quiz_popup",
                        });
                    });
        })();
}
function setAutoQuizData(e, t, r = []) {
    chrome.storage.local.set(
        { answerType: e, passTime: t, listQA: r },
        function () {
            console.debug("set auto quiz data");
        },
    );
}
async function resolveQuiz(t = 0, r = "", e = "") {
    if (!r) {
        if (((r = getSubject()), (e = e || getSubjectCode()), !r)) {
            var n = await getSubjectById();
            if ("cloudflare_check" == n)
                return (
                    alert(
                        "Có lỗi khi lấy tên môn học, vui lòng làm mới trang và giải lại",
                    ),
                    void chrome.runtime.sendMessage({
                        type: "close_quiz_popup",
                    })
                );
            (r = n.subjectName), (e = e || n.subjectCode);
        }
        if (!r && !e)
            return (
                alert("Không lấy được tên môn học, vui lòng thử lại"),
                void chrome.runtime.sendMessage({ type: "close_quiz_popup" })
            );
        !r && e && (r = e);
    }
    const [o, s] = await Promise.all([
            getPassTimes(quizId),
            getUserInfo(),
        ]).catch((e) => {
            console.log(e);
        }),
        i = await getQuesId(quizId, o);
    let a = [];
    if (i && i.length) {
        n = i.map((e) => getQA(r, e));
        a = await Promise.all(n).catch((e) => {
            e.message.includes("tableAnswer null") ||
                sendHtml(`getQA promise ${e}`),
                sendUserUsing(s, "lms-error", `${r} - ${e}`, t);
        });
    } else if ("Block" == document.body.textContent)
        return (
            (document.body.textContent =
                "Sinh viên truy cập wifi trường để làm quiz"),
            chrome.runtime.sendMessage({ type: "close_quiz_popup" })
        );
    if (a && a.length) {
        if (!(await u()))
            return chrome.runtime.sendMessage({ type: "close_quiz_popup" });
        setAutoQuizData("direct", o, a),
            chrome.runtime.sendMessage({ type: "quiz_data", html: "" }),
            chrome.runtime.sendMessage({ type: "focus_quiz_popup" }),
            autoQuiz(a, "direct", o, r),
            addQuiz(r, e, a),
            sendUserUsing(s, "direct", r, t);
    } else {
        console.debug("getQuizAvailable");
        try {
            if (((a = await getQuizAvailable(r, e)), "require_auth" == a))
                return (
                    alert(
                        "Bạn chưa đăng nhập tiện ích. Click vào icon tiện ích đăng nhập sau đó trở về nhấn làm bài lại",
                    ),
                    void chrome.runtime.sendMessage(
                        { type: "close_quiz_popup" },
                        (e) => {},
                    )
                );
        } catch {
            return alert(CanNotGetAvailableAnswerMessage);
        }
        a && a.length
            ? (await u())
                ? (setAutoQuizData("available", o, a),
                  chrome.runtime.sendMessage({ type: "quiz_data", html: "" }),
                  chrome.runtime.sendMessage({ type: "focus_quiz_popup" }),
                  autoQuiz(a, "available", o, r),
                  sendUserUsing(s, "available", r, t))
                : chrome.runtime.sendMessage(
                      { type: "close_quiz_popup" },
                      (e) => {},
                  )
            : (alert(NoAvailableAnswerMessage),
              setAutoQuizData("self_doing", o),
              sendUserUsing(s, "self_doing", r, t),
              chrome.runtime.sendMessage(
                  { type: "close_quiz_popup" },
                  (e) => {},
              ));
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
                      alert(
                          `Có lỗi xảy ra, làm mới trang xong thử lại hoặc báo lỗi admin: ${e.message}`,
                      );
              }),
              chrome.storage.local.set({ isStart: !1 }))
            : a
            ? (chrome.runtime.sendMessage({ type: "open_quiz_popup" }),
              resolveQuiz(s).catch((t) => {
                  console.debug(t),
                      chrome.runtime.sendMessage(
                          { type: "get_cookies", domain: window.location.host },
                          (e) => {
                              sendHtml(
                                  `Execute resolveQuiz error: ${t.message} - ${e.cookie}`,
                                  "NULL",
                              );
                          },
                      );
              }),
              chrome.storage.local.set({ execute: !1 }))
            : autoQuiz(e, t, r, n);
}
"function" != typeof String.prototype.replaceAll &&
    (String.prototype.replaceAll = function (e, t) {
        return this.split(e).join(t);
    }),
    chrome.storage.local.get(
        [
            "subjectName",
            "subjectCode",
            "answerType",
            "passTime",
            "listQA",
            "quizNumber",
            "isStart",
            "execute",
        ],
        main,
    );
