try {
    const quizTitle = document.querySelector(".ilc_qtitle_Title");
    const answerElements = document.querySelectorAll("label.answertext");

    let answerTexts = "";
    answerElements.forEach((e) => {
        answerTexts += e.outerText + ",\n";
    });

    let prompt =
        "Show only the most accurate answer and no further explanation. \n\nQuestion: " +
        quizTitle.innerText +
        "\n\nBelow is a list of answers to the above question:\n\n" +
        answerTexts;

    const btn = document.createElement("button");
    btn.innerText = "Coppy AI Prompt";
    btn.type = "button";
    quizTitle.parentElement.appendChild(btn);

    const alert = document.createElement("div");
    alert.innerText = "Chú ý độ chính xác của AI chỉ đạt khoảng 80%, nên cân nhắc trước khi sử dụng!";
    alert.style.color = "red";
    alert.style.fontStyle = "italic";

    quizTitle.parentElement.appendChild(alert);

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
