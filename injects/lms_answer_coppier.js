try {
    const quizTitle = document.querySelector(".ilc_qtitle_Title");
    const answerElements = document.querySelectorAll("label.answertext");
    const nextbutton = document.getElementById("nextbutton");

    let answerTexts = Array.from(answerElements, (e) => e.outerText).join(",\n");
    let prompt = `Chỉ ra các đáp án đúng trong các đáp án dưới đây không giải thích gì thêm. \n\nCâu hỏi: ${quizTitle.innerText}\n\nCác đáp án:\n\n${answerTexts}`;

    const btnCopyAIPrompt = document.createElement("button");
    btnCopyAIPrompt.innerText = "Copy câu hỏi";
    btnCopyAIPrompt.type = "button";

    const alert = document.createElement("div");
    alert.innerText = "Chú ý độ chính xác của AI chỉ đạt khoảng 80%, nên cân nhắc trước khi sử dụng!";
    alert.style.color = "red";
    alert.style.fontStyle = "italic";
    quizTitle.parentElement.append(btnCopyAIPrompt);

    if (nextbutton) {
        const btnNext = document.createElement("button");
        btnNext.innerText = "Next >>>";
        btnNext.type = "button";
        btnNext.onclick = () => nextbutton.click();
        quizTitle.parentElement.append(btnNext);
    }
    quizTitle.parentElement.append(alert);

    btnCopyAIPrompt.onclick = () => {
        navigator.clipboard.writeText(prompt);
        btnCopyAIPrompt.innerText = "Copied!";

        setTimeout(() => {
            btnCopyAIPrompt.innerText = "Copy câu hỏi";
        }, 1500);
    };
} catch (error) {
    // console.error("Không thể tạo câu hỏi!" + error);
}
