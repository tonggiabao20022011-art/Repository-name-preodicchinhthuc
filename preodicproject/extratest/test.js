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

        // Kiểm tra Mammoth
        if (typeof mammoth === "undefined") {
            throw new Error(
                "Không tìm thấy mammoth.browser.min.js"
            );
        }

        // Đọc file Word
        const response = await fetch(WORD_FILE);

        if (!response.ok) {
            throw new Error(
                `Không tìm thấy ${WORD_FILE}`
            );
        }

        const arrayBuffer = await response.arrayBuffer();

        console.log("Đã tải bai.docx");

        // Chuyển Word → text
        const result = await mammoth.extractRawText({
            arrayBuffer: arrayBuffer
        });

        console.log("Nội dung Word:");
        console.log(result.value);

        // Phân tích câu hỏi
        questions = parseQuestions(result.value);

        console.log("Đã tìm thấy", questions.length, "câu hỏi");

        if (questions.length === 0) {

            quiz.innerHTML = `
                <div class="question-card">
                    <h3>Không tìm thấy câu hỏi</h3>
                    <p>
                        Kiểm tra lại định dạng trong file bai.docx.
                    </p>
                </div>
            `;

            submitButton.style.display = "none";

            return;
        }

        // Hiển thị câu hỏi
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
// PHÂN TÍCH FILE WORD
// ================================

function parseQuestions(text) {

    // Chuẩn hóa xuống dòng
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

        // ----------------------------
        // TÌM "Câu 1:"
        // ----------------------------

        const questionMatch = lines[i].match(
            /^Câu\s*(\d+)\s*:\s*(.*)$/i
        );

        if (!questionMatch) {
            i++;
            continue;
        }

        const number = Number(questionMatch[1]);

        const questionText = questionMatch[2].trim();

        const options = {};

        let answerText = "";

        i++;


        // ----------------------------
        // ĐỌC A B C D
        // ----------------------------

        while (
            i < lines.length &&
            !/^Đáp\s*án\s*:/i.test(lines[i]) &&
            !/^Câu\s*\d+\s*:/i.test(lines[i])
        ) {

            const optionMatch = lines[i].match(
                /^([ABCD])\s*[.):]?\s*(.*)$/i
            );

            if (optionMatch) {

                const letter =
                    optionMatch[1].toUpperCase();

                const optionText =
                    optionMatch[2].trim();

                options[letter] = optionText;
            }

            i++;
        }


        // ----------------------------
        // ĐỌC ĐÁP ÁN
        // ----------------------------

        if (
            i < lines.length &&
            /^Đáp\s*án\s*:/i.test(lines[i])
        ) {

            answerText = lines[i]
                .replace(/^Đáp\s*án\s*:/i, "")
                .trim();

            i++;
        }


        // ----------------------------
        // XÁC ĐỊNH ĐÚNG / SAI
        // ----------------------------

        const answerParts = answerText
            .replace(/,/g, " ")
            .split(/\s+/)
            .filter(Boolean)
            .map(value => value.toUpperCase());


        const isTrueFalse =
            answerParts.length === 4 &&
            answerParts.every(
                value => value === "Đ" || value === "S"
            );


        // ----------------------------
        // LƯU CÂU HỎI
        // ----------------------------

        if (isTrueFalse) {

            result.push({
                number: number,
                question: questionText,
                type: "tf",
                options: options,
                answer: answerParts
            });

        } else {

            result.push({
                number: number,
                question: questionText,
                type: "abcd",
                options: options,
                answer: answerParts[0] || ""
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

    submitted = false;


    questions.forEach((question, index) => {

        const card = document.createElement("div");

        card.className = "question-card";


        // ----------------------------
        // TIÊU ĐỀ CÂU
        // ----------------------------

        const title = document.createElement("h3");

        title.className = "question-title";

        title.textContent =
            `Câu ${question.number}: ${question.question}`;

        card.appendChild(title);


        // ============================
        // TRẮC NGHIỆM ABCD
        // ============================

        if (question.type === "abcd") {

            const answerList =
                document.createElement("div");

            answerList.className = "answer-list";


            ["A", "B", "C", "D"].forEach(letter => {

                if (
                    question.options[letter] === undefined
                ) {
                    return;
                }


                const label =
                    document.createElement("label");

                label.className = "answer-option";


                const input =
                    document.createElement("input");

                input.type = "radio";

                input.name =
                    `question-${index}`;

                input.value = letter;


                const letterBox =
                    document.createElement("span");

                letterBox.className =
                    "answer-letter";

                letterBox.textContent = letter;


                const text =
                    document.createElement("span");

                text.className = "answer-text";

                text.textContent =
                    question.options[letter];


                label.appendChild(input);

                label.appendChild(letterBox);

                label.appendChild(text);

                answerList.appendChild(label);
            });


            card.appendChild(answerList);
        }


        // ============================
        // ĐÚNG / SAI
        // ============================

        else {

            const container =
                document.createElement("div");

            container.className =
                "tf-container";


            // HEADER

            const header =
                document.createElement("div");

            header.className = "tf-row tf-header";


            const contentTitle =
                document.createElement("div");

            contentTitle.textContent =
                "Nội dung";


            const trueTitle =
                document.createElement("div");

            trueTitle.textContent = "Đúng";


            const falseTitle =
                document.createElement("div");

            falseTitle.textContent = "Sai";


            header.appendChild(contentTitle);

            header.appendChild(trueTitle);

            header.appendChild(falseTitle);

            container.appendChild(header);


            // A B C D

            ["A", "B", "C", "D"].forEach(letter => {

                if (
                    question.options[letter] === undefined
                ) {
                    return;
                }


                const row =
                    document.createElement("div");

                row.className = "tf-row";


                const statement =
                    document.createElement("div");

                statement.className =
                    "tf-statement";


                const strong =
                    document.createElement("strong");

                strong.textContent = `${letter}.`;


                statement.appendChild(strong);

                statement.appendChild(
                    document.createTextNode(
                        " " + question.options[letter]
                    )
                );


                row.appendChild(statement);


                // Đúng

                row.appendChild(
                    createTFChoice(
                        index,
                        letter,
                        "Đ"
                    )
                );


                // Sai

                row.appendChild(
                    createTFChoice(
                        index,
                        letter,
                        "S"
                    )
                );


                container.appendChild(row);
            });


            card.appendChild(container);
        }


        quiz.appendChild(card);
    });
}


// ================================
// TẠO Ô ĐÚNG / SAI
// ================================

function createTFChoice(
    questionIndex,
    letter,
    value
) {

    const label =
        document.createElement("label");

    label.className = "tf-choice";


    const input =
        document.createElement("input");

    input.type = "radio";

    input.name =
        `question-${questionIndex}-${letter}`;

    input.value = value;


    const circle =
        document.createElement("span");

    circle.className = "tf-radio";


    const text =
        document.createElement("span");

    text.textContent =
        value === "Đ"
            ? "Đúng"
            : "Sai";


    label.appendChild(input);

    label.appendChild(circle);

    label.appendChild(text);


    return label;
}


// ================================
// NỘP BÀI
// ================================

submitButton.addEventListener(
    "click",
    submitQuiz
);


function submitQuiz() {

    if (submitted) {
        return;
    }


    let score = 0;

    const wrong = [];


    questions.forEach(
        (question, index) => {


            // ========================
            // ABCD
            // ========================

            if (question.type === "abcd") {

                const selected =
                    document.querySelector(
                        `input[name="question-${index}"]:checked`
                    );


                const userAnswer =
                    selected
                        ? selected.value
                        : "";


                if (
                    userAnswer === question.answer
                ) {

                    score++;

                } else {

                    wrong.push({
                        question: question,
                        userAnswer: userAnswer
                    });
                }
            }


            // ========================
            // ĐÚNG / SAI
            // ========================

            else {

                const userAnswers = [];

                let allCorrect = true;


                ["A", "B", "C", "D"].forEach(
                    (letter, answerIndex) => {

                        const selected =
                            document.querySelector(
                                `input[name="question-${index}-${letter}"]:checked`
                            );


                        const value =
                            selected
                                ? selected.value
                                : "";


                        userAnswers.push(value);


                        if (
                            value !==
                            question.answer[answerIndex]
                        ) {

                            allCorrect = false;
                        }
                    }
                );


                // Cả 4 ý đúng mới được 1 điểm

                if (allCorrect) {

                    score++;

                } else {

                    wrong.push({
                        question: question,
                        userAnswer: userAnswers
                    });
                }
            }
        }
    );


    submitted = true;


    // ================================
    // KHÓA TOÀN BỘ CÂU HỎI
    // ================================

    document
        .querySelectorAll("#quiz input")
        .forEach(input => {

            input.disabled = true;
        });


    quiz.classList.add("quiz-locked");


    // ================================
    // ẨN NÚT NỘP
    // ================================

    submitButton.style.display = "none";


    // ================================
    // HIỆN KẾT QUẢ
    // ================================

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


    // ----------------------------
    // TẤT CẢ ĐÚNG
    // ----------------------------

    if (wrong.length === 0) {

        const message =
            document.createElement("div");

        message.className =
            "wrong-question";


        const title =
            document.createElement("h3");

        title.textContent =
            "Tất cả câu đều đúng.";


        message.appendChild(title);

        wrongAnswers.appendChild(message);


        resultSection.scrollIntoView({
            behavior: "smooth"
        });

        return;
    }


    // ----------------------------
    // TIÊU ĐỀ
    // ----------------------------

    const heading =
        document.createElement("h3");

    heading.textContent =
        "Các câu trả lời sai";


    wrongAnswers.appendChild(heading);


    // ----------------------------
    // TỪNG CÂU SAI
    // ----------------------------

    wrong.forEach(item => {

        const box =
            document.createElement("div");

        box.className =
            "wrong-question";


        const title =
            document.createElement("h3");

        title.textContent =
            `Câu ${item.question.number}: ${item.question.question}`;


        box.appendChild(title);


        // ========================
        // ABCD
        // ========================

        if (
            item.question.type === "abcd"
        ) {

            const user =
                item.userAnswer
                    ? item.userAnswer
                    : "Chưa chọn";


            const correct =
                item.question.answer;


            const userLine =
                document.createElement("p");

            userLine.className =
                "result-line user-answer";

            userLine.innerHTML =
                `Bạn chọn: <strong>${user}</strong>`;


            const correctLine =
                document.createElement("p");

            correctLine.className =
                "result-line correct-answer";

            correctLine.innerHTML =
                `Đáp án đúng: <strong>${correct}</strong>`;


            box.appendChild(userLine);

            box.appendChild(correctLine);
        }


        // ========================
        // ĐÚNG / SAI
        // ========================

        else {

            const resultContainer =
                document.createElement("div");

            resultContainer.className =
                "tf-result";


            ["A", "B", "C", "D"].forEach(
                (letter, index) => {

                    const user =
                        item.userAnswer[index]
                            || "";


                    const correct =
                        item.question.answer[index];


                    const row =
                        document.createElement("div");

                    row.className =
                        "tf-result-row";


                    if (user === correct) {

                        row.classList.add(
                            "correct"
                        );

                    } else {

                        row.classList.add(
                            "wrong"
                        );
                    }


                    const letterBox =
                        document.createElement("div");

                    letterBox.className =
                        "tf-result-letter";

                    letterBox.textContent =
                        letter;


                    const userBox =
                        document.createElement("div");

                    userBox.className =
                        "tf-result-user";

                    userBox.innerHTML =
                        `Bạn chọn: <strong>${convertTF(user)}</strong>`;


                    const correctBox =
                        document.createElement("div");

                    correctBox.className =
                        "tf-result-correct";

                    correctBox.innerHTML =
                        `Đáp án: <strong>${convertTF(correct)}</strong>`;


                    row.appendChild(letterBox);

                    row.appendChild(userBox);

                    row.appendChild(correctBox);


                    resultContainer.appendChild(row);
                }
            );


            box.appendChild(
                resultContainer
            );
        }


        wrongAnswers.appendChild(box);
    });


    resultSection.scrollIntoView({
        behavior: "smooth"
    });
}


// ================================
// ĐỔI Đ / S THÀNH CHỮ
// ================================

function convertTF(value) {

    if (value === "Đ") {
        return "Đúng";
    }

    if (value === "S") {
        return "Sai";
    }

    return "Chưa chọn";
}


// ================================
// CHẠY
// ================================

loadWordFile();