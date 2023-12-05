const currentVersion = chrome.runtime.getManifest().version;
var extensionVersion;

fetch("https://6514b3f1dc3282a6a3cd7125.mockapi.io/server?name=Premium%20Easy%20Quiz")
    .then((res) => res.json())
    .then((res) => {
        if (res.length === 1) {
            extensionVersion = res[0].version;
        }
    })
    .then(() => {
        if (!currentVersion == extensionVersion) {
            try {
                const body = document.querySelector("body");
                body.innerHTML = `<h1 style="font-weight: bold; color: #303030">Premium Easy Quiz đã có phiên bản mới, vui lòng cài đặt phiên bản mới để tiếp tục
                <br />
                <a style="color: blue" target="_blank" href="https://github.com/mwarevn/Premium-Easy-Quiz"> Bấm vào đây để tải bản mới nhất</a>
                </h1>
                `;
            } catch {}
        }
    });
