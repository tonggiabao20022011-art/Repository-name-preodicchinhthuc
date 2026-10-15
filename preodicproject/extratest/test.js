// Đọc và phân tích câu hỏi từ file bai.docx
async function loadWordFile() {
    const status = document.getElementById("status");

    try {
        if (status) status.textContent = "Đang tải câu hỏi...";

        if (typeof mammoth === "undefined") {
            throw new Error("Chưa tải được thư viện Mammoth.");
        }

        const response = await fetch("./bai.docx", {
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(
                `Không đọc được bai.docx. Mã lỗi: ${response.status}`
            );
        }

        const arrayBuffer = await response.arrayBuffer();

        if (arrayBuffer.byteLength === 0) {
            throw new Error("File bai.docx đang trống.");
        }

        const result = await mammoth.extractRawText({
            arrayBuffer: arrayBuffer
        });

        const text = result.value.trim();

        if (!text) {
            throw new Error("Không tìm thấy nội dung trong file Word.");
        }

        questions = parseQuestions(text);

        if (!questions || questions.length === 0) {
            throw new Error(
                "Không nhận diện được câu hỏi. Hãy kiểm tra định dạng file Word."
            );
        }

        renderQuiz();

        if (status) {
            status.textContent = `Đã tải ${questions.length} câu hỏi.`;
        }

    } catch (error) {
        console.error("Lỗi đọc file Word:", error);

        if (status) {
            status.textContent = "Lỗi tải câu hỏi: " + error.message;
        }
    }
}


// Phân tích nội dung Word thành danh sách câu hỏi
function parseQuestions(rawText) {
    const lines = rawText
        .replace(/\r\n?/g, "\n")
        .replace(/\u00A0/g, " ")
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0);

    const parsedQuestions = [];
    let current = null;
    let currentOption = null;

    function saveQuestion() {
        if (!current) return;

        const hasAllOptions = ["A", "B", "C", "D"].every(
            key => current.options[key] &&
                   current.options[key].trim() !== ""
        );

        if (
            current.question.trim() &&
            hasAllOptions &&
            ["A", "B", "C", "D"].includes(current.answer)
        ) {
            parsedQuestions.push({
                question: current.question.trim(),
                options: { ...current.options },
                answer: current.answer
            });
        } else {
            console.warn("Bỏ qua câu hỏi sai định dạng:", current);
        }

        current = null;
        currentOption = null;
    }

    for (const line of lines) {
        // Bắt đầu câu mới: Câu 1: ... hoặc Câu 1. ...
        const questionMatch = line.match(
            /^Câu\s*(\d+)\s*[:.]\s*(.*)$/i
        );

        if (questionMatch) {
            saveQuestion();

            current = {
                number: Number(questionMatch[1]),
                question: questionMatch[2] || "",
                options: {
                    A: "",
                    B: "",
                    C: "",
                    D: ""
                },
                answer: ""
            };

            currentOption = null;
            continue;
        }

        if (!current) continue;

        // Đáp án: A
        const answerMatch = line.match(
            /^Đáp\s*án\s*:\s*([ABCD])\s*$/i
        );

        if (answerMatch) {
            current.answer = answerMatch[1].toUpperCase();
            currentOption = null;
            continue;
        }

        // Phương án A. ... / A) ... / A: ...
        const optionMatch = line.match(
            /^([ABCD])\s*[.):]\s*(.*)$/i
        );

        if (optionMatch) {
            currentOption = optionMatch[1].toUpperCase();
            current.options[currentOption] = optionMatch[2] || "";
            continue;
        }

        // Nối những dòng bị xuống hàng trong Word
        if (currentOption) {
            current.options[currentOption] +=
                (current.options[currentOption] ? " " : "") + line;
        } else {
            current.question +=
                (current.question ? " " : "") + line;
        }
    }

    // Lưu câu cuối cùng
    saveQuestion();

    return parsedQuestions;
}
