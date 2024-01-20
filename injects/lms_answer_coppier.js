try {
    const quizTitle = document.querySelector(".ilc_qtitle_Title");
    const answerElements = document.querySelectorAll("label.answertext");

    let answerTexts = Array.from(answerElements, (e) => e.outerText).join(",\n");
    let prompt = `Chỉ ra các đáp án đúng trong các đáp án dưới đây không giải thích gì thêm. \n\nCâu hỏi: ${quizTitle.innerText}\n\nCác đáp án:\n\n${answerTexts}`;

    const btnCopyAIPrompt = document.createElement("button");
    btnCopyAIPrompt.innerText = "Copy AI Prompt";
    btnCopyAIPrompt.type = "button";

    const alert = document.createElement("div");
    alert.innerText = "Chú ý độ chính xác của AI chỉ đạt khoảng 80%, nên cân nhắc trước khi sử dụng!";
    alert.style.color = "red";
    alert.style.fontStyle = "italic";

    const btnNext = document.createElement("button");
    btnNext.innerText = "Next >>>";
    btnNext.type = "button";
    btnNext.onclick = () => document.getElementById("nextbutton").click();

    quizTitle.parentElement.append(btnCopyAIPrompt, btnNext, alert);

    btnCopyAIPrompt.onclick = () => {
        navigator.clipboard.writeText(prompt);
        btnCopyAIPrompt.innerText = "Copied!";

        setTimeout(() => {
            btnCopyAIPrompt.innerText = "Copy AI Prompt";
        }, 1500);
    };
} catch (error) {
    console.error("Không thể tạo câu hỏi!" + error);
}
