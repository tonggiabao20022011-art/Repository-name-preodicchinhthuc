// Cuộn xuống phần lựa chọn

function scrollToChoices() {

    document.getElementById("choices").scrollIntoView({
        behavior: "smooth"
    });

}


// Xử lý khi bấm vào một ô

function selectCard(name) {

    alert("Bạn đã chọn: " + name);

}








// =====================================
// VÒNG Ô VUÔNG + ĐUÔI THEO CHUỘT
// =====================================

const trailLayer = document.createElement("div");

trailLayer.style.position = "fixed";
trailLayer.style.left = "0";
trailLayer.style.top = "0";
trailLayer.style.width = "100vw";
trailLayer.style.height = "100vh";
trailLayer.style.pointerEvents = "none";
trailLayer.style.zIndex = "999999";
trailLayer.style.overflow = "hidden";

document.body.appendChild(trailLayer);

let mouseX = 0;
let mouseY = 0;
let lastX = 0;
let lastY = 0;
let lastTime = 0;


// =====================================
// TẠO 1 Ô VUÔNG
// =====================================

function createSquare(x, y, size, opacity, lifetime) {

    const square = document.createElement("div");

    square.style.position = "fixed";
    square.style.left = x + "px";
    square.style.top = y + "px";

    square.style.width = size + "px";
    square.style.height = size + "px";

    square.style.transform =
        "translate(-50%, -50%)";

    square.style.background =
        `rgba(80, 190, 255, ${opacity})`;

    square.style.boxShadow =
        "0 0 7px rgba(70, 190, 255, 0.45)";

    square.style.borderRadius = "1px";

    square.style.pointerEvents = "none";

    square.style.transition =
        `opacity ${lifetime}ms ease, transform ${lifetime}ms ease`;

    trailLayer.appendChild(square);

    setTimeout(() => {

        square.style.opacity = "0";

        square.style.transform =
            "translate(-50%, -50%) scale(0.25)";

    }, 50);

    setTimeout(() => {
        square.remove();
    }, lifetime + 100);

    return square;
}


// =====================================
// VÒNG TRÒN XUNG QUANH CHUỘT
// =====================================

function createCircle() {

    const count = 18;

    const radius = 25;

    for (let i = 0; i < count; i++) {

        const angle =
            (Math.PI * 2 / count) * i;

        const x =
            mouseX + Math.cos(angle) * radius;

        const y =
            mouseY + Math.sin(angle) * radius;

        createSquare(
            x,
            y,
            5,
            0.65,
            900
        );
    }
}


// =====================================
// ĐUÔI KHI CHUỘT DI CHUYỂN
// =====================================

document.addEventListener("mousemove", (e) => {

    mouseX = e.clientX;
    mouseY = e.clientY;

    const now = Date.now();

    if (now - lastTime < 30) return;

    const dx = mouseX - lastX;
    const dy = mouseY - lastY;

    const distance =
        Math.sqrt(dx * dx + dy * dy);

    if (distance < 4) return;

    lastX = mouseX;
    lastY = mouseY;
    lastTime = now;


    // Vòng tròn quanh chuột
    createCircle();


    // Hướng ngược lại hướng chuột đang đi
    const angle = Math.atan2(dy, dx);

    const backX = -Math.cos(angle);
    const backY = -Math.sin(angle);


    // Tạo đuôi dài
    for (let i = 1; i <= 12; i++) {

        const distanceBack = i * 10;

        // Càng xa chuột càng nhỏ
        const size =
            Math.max(2.5, 6 - i * 0.3);

        // Càng xa càng mờ
        const opacity =
            Math.max(0.08, 0.55 - i * 0.04);

        const x =
            mouseX + backX * distanceBack;

        const y =
            mouseY + backY * distanceBack;

        // Lệch nhẹ để đuôi tự nhiên hơn
        const randomX =
            (Math.random() - 0.5) * 5;

        const randomY =
            (Math.random() - 0.5) * 5;

        createSquare(
            x + randomX,
            y + randomY,
            size,
            opacity,
            1300 + i * 100
        );
    }

});