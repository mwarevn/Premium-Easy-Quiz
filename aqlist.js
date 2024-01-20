const iconQues =
        '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
    iconAns =
        '<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
    listSeq = {};
function disabledEvent(e) {
    return e.stopPropagation ? e.stopPropagation() : window.event && (window.event.cancelBubble = !0), e.preventDefault(), !1;
}
chrome.runtime.onMessage.addListener(function (e, t, n) {
    let i = document.createElement("em"),
        o = document.createElement("table");
    if ((o.setAttribute("style", "width: 100%;"), "quiz_data" === e.type)) {
        if (((o.innerHTML = e.html), document.getElementById("loading")?.remove(), e.online)) {
            const l = document.createElement("h2");
            (l.innerHTML = `
				<span>Thiếu câu hỏi? </span>
				<a href="chrome-extension://bookcfenenijcoedjlpfknknlgfimopp/online.html">Đóng góp thêm tại đây</a>
			`),
                document.getElementById("mySection").appendChild(l);
        } else {
            const c = document.createElement("p");
            c.setAttribute("style", "color: red; text-align: right; padding: 11px 14px 5px 10px; font-size: 15px;"),
                (c.innerHTML =
                    "Gỡ My Fpoly Extension để không bị tắt khi sử dụng<br />Quiz đáp án đúng sẽ được tô đỏ. Không làm bài quá nhanh"),
                document.getElementById("mySection").appendChild(c);
        }
        document.getElementById("mySection").appendChild(o), n({ farewell: "OK" });
    } else if ("quiz_lms" == e.type) {
        var { ques: d, ans: n, seq: e } = e;
        if (!listSeq[e]) {
            const r = document.createElement("div");
            i.innerText = n;
            const s = document.createElement("tr");
            s.innerHTML = `<td style='width:2.5rem; text-align:center;'>${e}</td><td>${iconQues}</td><td>${d}</td>`;
            const a = document.createElement("tr");
            (a.innerHTML = `<td></td><td>${iconAns}</td><td>${i.outerHTML}</td>`),
                r.appendChild(s),
                r.appendChild(a),
                document.querySelector("table").appendChild(r);
        }
        listSeq[e] = 1;
    }
    return !0;
}),
    document.addEventListener("DOMContentLoaded", function (e) {
        (document.body.oncopy = function (e) {
            e.preventDefault();
        }),
            document.addEventListener(
                "keydown",
                function (e) {
                    !e.ctrlKey || ("c" != e.key && "u" != e.key && "I" != e.key) || disabledEvent(e),
                        "F12" == e.key && disabledEvent(e);
                },
                !1
            ),
            document.addEventListener(
                "contextmenu",
                function (e) {
                    e.preventDefault();
                },
                !1
            );
    });
