try {
    const quizTitle = document.querySelector(".ilc_qtitle_Title");
    const answerElements = document.querySelectorAll("label.answertext");

    let answerTexts = "";
    answerElements.forEach((e) => {
        answerTexts += e.outerText + ",\n";
    });

    let prompt =
        "Chỉ ra đáp án đúng nhất không giải thích gì thêm. \n\nCâu hỏi: " +
        quizTitle.innerText +
        "\n\nCác đáp án:\n\n" +
        answerTexts;

    const btn = document.createElement("button");
    btn.innerText = "Coppy AI Prompt";
    btn.type = "button";
    quizTitle.parentElement.appendChild(btn);

    const AIChat = document.createElement("div");
    const alert = document.createElement("div");
    alert.innerText = "Chú ý độ chính xác của AI chỉ đạt khoảng 80%, nên cân nhắc trước khi sử dụng!";
    alert.style.color = "red";
    alert.style.fontStyle = "italic";
    AIChat.style.height = "700px";

    AIChat.innerHTML = `<iframe style="width: 100%; height: 100%" src="https://copilot.microsoft.com/" frameborder="0"></iframe>`;

    quizTitle.parentElement.appendChild(alert);

    quizTitle.parentElement.appendChild(AIChat);

    btn.onclick = () => {
        navigator.clipboard.writeText(prompt);
        btn.innerText = "Coppied!";

        setTimeout(() => {
            btn.innerText = "Coppy AI Prompt";
        }, 1500);
    };
} catch (error) {
    console.error("Không thể tạo câu hỏi!");
}
