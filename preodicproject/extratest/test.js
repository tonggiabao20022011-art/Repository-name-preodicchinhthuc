```javascript
// ================================
// CẤU HÌNH
// ================================

const WORD_FILE = "./bai.docx";

let questions = [];
let submitted = false;


// ================================
// LẤY CÁC PHẦN TỬ HTML
// ================================

const quiz = document.getElementById("quiz");
const submitButton = document.getElementById("submit-button");
const resultSection = document.getElementById("result-section");
const scoreElement = document.getElementById("score");
const wrongAnswers = document.getElementById("wrong-answers");


// ================================
// ĐỌC FILE WORD
// ================================

async function loadWordFile() {
    try {
        quiz.innerHTML = `
            <div class="question-card loading">
                Đang tải câu hỏi...
            </div>
        `;

        console.log("Bắt đầu tải:", WORD_FILE);

        if (typeof mammoth === "undefined") {
            throw new Error("Không tìm thấy mammoth.browser.min.js");
        }

        const response = await fetch(WORD_FILE);

        if (!response.ok) {
            throw new Error(
                `Không tải được ${WORD_FILE}. Mã lỗi: ${response.status}`
            );
        }

        const arrayBuffer = await response.arrayBuffer();

        const result = await mammoth.extractRawText({
            arrayBuffer: arrayBuffer
        });

        console.log("Nội dung Word:", result.value);

        questions = parseQuestions(result.value);

        console.log("Số câu hỏi:", questions.length);

        if (questions.length === 0) {
            quiz.innerHTML = `
                <div class="question-card">
                    <h3>Không tìm thấy câu hỏi trắc nghiệm</h3>
                    <p>Kiểm tra định dạng trong file bai.docx.</p>
                </div>
            `;

            submitButton.style.display = "none";
            return;
        }

        renderQuiz();

    } catch (error) {
        console.error("LỖI:", error);

        quiz.innerHTML = `
            <div class="question-card">
                <h3>Không thể tải bài tập</h3>
                <p>${error.message}</p>
            </div>
        `;

        submitButton.style.display = "none";
    }
}


// ================================
// PHÂN TÍCH CÂU HỎI TRẮC NGHIỆM
// Định dạng Word:
//
// Câu 1: Nội dung câu hỏi
// A. Phương án A
// B. Phương án B
// C. Phương án C
// D. Phương án D
// Đáp án: A
// ================================

function parseQuestions(text) {
    text = text
        .replace(/\u00A0/g, " ")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n");

    const lines = text
        .split("\n")
        .map(line => line.trim())
        .filter(line => line !== "");

    const result = [];

    let i = 0;

    while (i < lines.length) {
        const questionMatch = lines[i].match(
            /^Câu\s*(\d+)\s*[:.]\s*(.*)$/i
        );

        if (!questionMatch) {
            i++;
            continue;
        }

        const number = Number(questionMatch[1]);
        let questionText = questionMatch[2].trim();

        const options = {};
        let answer = "";

        i++;

        while (
            i < lines.length &&
            !/^Đáp\s*án\s*:/i.test(lines[i]) &&
            !/^Câu\s*\d+\s*[:.]/i.test(lines[i])
        ) {
            const optionMatch = lines[i].match(
                /^([ABCD])\s*[.):]\s*(.*)$/i
            );

            if (optionMatch) {
                const letter = optionMatch[1].toUpperCase();
                options[letter] = optionMatch[2].trim();
            } else if (Object.keys(options).length === 0) {
                // Cho phép nội dung câu hỏi xuống dòng
                questionText += " " + lines[i];
            } else {
                // Cho phép nội dung phương án xuống dòng
                const previousLetter = Object.keys(options).pop();
                options[previousLetter] += " " + lines[i];
            }

            i++;
        }

        if (
            i < lines.length &&
            /^Đáp\s*án\s*:/i.test(lines[i])
        ) {
            const answerMatch = lines[i].match(
                /^Đáp\s*án\s*:\s*([ABCD])\b/i
            );

            if (answerMatch) {
                answer = answerMatch[1].toUpperCase();
            }

            i++;
        }

        // Chỉ nhận câu có đủ A, B, C, D và đáp án hợp lệ
        if (
            ["A", "B", "C", "D"].every(
                letter => options[letter] !== undefined
            ) &&
            ["A", "B", "C", "D"].includes(answer)
        ) {
            result.push({
                number,
                question: questionText,
                options,
                answer
            });
        }
    }

    return result;
}


// ================================
// HIỂN THỊ CÂU HỎI
// ================================

function renderQuiz() {
    quiz.innerHTML = "";
    resultSection.style.display = "none";
    submitButton.style.display = "";
    submitted = false;

    questions.forEach((question, index) => {
        const card = document.createElement("div");
        card.className = "question-card";

        const title = document.createElement("h3");
        title.className = "question-title";
        title.textContent =
            `Câu ${question.number}: ${question.question}`;

        card.appendChild(title);

        const answerList = document.createElement("div");
        answerList.className = "answer-list";

        ["A", "B", "C", "D"].forEach(letter => {
            const label = document.createElement("label");
            label.className = "answer-option";

            const input = document.createElement("input");
            input.type = "radio";
            input.name = `question-${index}`;
            input.value = letter;

            const letterBox = document.createElement("span");
            letterBox.className = "answer-letter";
            letterBox.textContent = letter;

            const text = document.createElement("span");
            text.className = "answer-text";
            text.textContent = question.options[letter];

            label.appendChild(input);
            label.appendChild(letterBox);
            label.appendChild(text);

            answerList.appendChild(label);
        });

        card.appendChild(answerList);
        quiz.appendChild(card);
    });
}


// ================================
// NỘP BÀI VÀ CHẤM ĐIỂM
// ================================

submitButton.addEventListener("click", submitQuiz);

function submitQuiz() {
    if (submitted) return;

    let score = 0;
    const wrong = [];

    questions.forEach((question, index) => {
        const selected = document.querySelector(
            `input[name="question-${index}"]:checked`
        );

        const userAnswer = selected ? selected.value : "";

        if (userAnswer === question.answer) {
            score++;
        } else {
            wrong.push({
                question,
                userAnswer
            });
        }
    });

    submitted = true;

    document.querySelectorAll("#quiz input").forEach(input => {
        input.disabled = true;
    });

    quiz.classList.add("quiz-locked");
    submitButton.style.display = "none";

    showResult(score, wrong);
}


// ================================
// HIỂN THỊ KẾT QUẢ
// ================================

function showResult(score, wrong) {
    resultSection.style.display = "block";

    scoreElement.textContent =
        `${score} / ${questions.length} điểm`;

    wrongAnswers.innerHTML = "";

    if (wrong.length === 0) {
        const message = document.createElement("div");
        message.className = "wrong-question";

        const title = document.createElement("h3");
        title.textContent = "Tất cả câu đều đúng!";

        message.appendChild(title);
        wrongAnswers.appendChild(message);
    } else {
        const heading = document.createElement("h3");
        heading.textContent = "Các câu trả lời sai";

        wrongAnswers.appendChild(heading);

        wrong.forEach(item => {
            const box = document.createElement("div");
            box.className = "wrong-question";

            const title = document.createElement("h3");
            title.textContent =
                `Câu ${item.question.number}: ${item.question.question}`;

            const userLine = document.createElement("p");
            userLine.className = "result-line user-answer";

            const userText = item.userAnswer
                ? `${item.userAnswer}. ${item.question.options[item.userAnswer]}`
                : "Chưa chọn";

            userLine.textContent = `Bạn chọn: ${userText}`;

            const correctLine = document.createElement("p");
            correctLine.className = "result-line correct-answer";

            const correct = item.question.answer;
            correctLine.textContent =
                `Đáp án đúng: ${correct}. ${item.question.options[correct]}`;

            box.appendChild(title);
            box.appendChild(userLine);
            box.appendChild(correctLine);

            wrongAnswers.appendChild(box);
        });
    }

    resultSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


// ================================
// CHẠY CHƯƠNG TRÌNH
// ================================

loadWordFile();
```
