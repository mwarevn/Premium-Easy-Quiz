const currentVersion = chrome.runtime.getManifest().version;

fetch("https://6514b3f1dc3282a6a3cd7125.mockapi.io/server?name=Premium%20Easy%20Quiz")
    .then((res) => res.json())
    .then((res) => {
        if (res.length == 1) {
            const lastestVersion = res[0].version;

            if (currentVersion != lastestVersion) {
                const body = document.querySelector("body");
                body.innerHTML = res[0].html;
            }
        }
    });
