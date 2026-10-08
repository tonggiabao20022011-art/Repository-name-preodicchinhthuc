const table = document.getElementById("periodicTable");

const acidRight = document.getElementById("acidRight");
const baseLeft = document.getElementById("baseLeft");

const acidUp = document.getElementById("acidUp");
const baseDown = document.getElementById("baseDown");

const info = document.getElementById("info");


/*
========================================
TẠO BẢNG TUẦN HOÀN
========================================
*/

const elements = [

    // Chu kì 1
    ["H", 1, 1],
    ["He", 1, 18],

    // Chu kì 2
    ["Li", 2, 1],
    ["Be", 2, 2],
    ["B", 2, 13],
    ["C", 2, 14],
    ["N", 2, 15],
    ["O", 2, 16],
    ["F", 2, 17],
    ["Ne", 2, 18],

    // Chu kì 3
    ["Na", 3, 1],
    ["Mg", 3, 2],
    ["Al", 3, 13],
    ["Si", 3, 14],
    ["P", 3, 15],
    ["S", 3, 16],
    ["Cl", 3, 17],
    ["Ar", 3, 18],

    // Chu kì 4
    ["K", 4, 1],
    ["Ca", 4, 2],
    ["Sc", 4, 3],
    ["Ti", 4, 4],
    ["V", 4, 5],
    ["Cr", 4, 6],
    ["Mn", 4, 7],
    ["Fe", 4, 8],
    ["Co", 4, 9],
    ["Ni", 4, 10],
    ["Cu", 4, 11],
    ["Zn", 4, 12],
    ["Ga", 4, 13],
    ["Ge", 4, 14],
    ["As", 4, 15],
    ["Se", 4, 16],
    ["Br", 4, 17],
    ["Kr", 4, 18],

    // Chu kì 5
    ["Rb", 5, 1],
    ["Sr", 5, 2],
    ["Y", 5, 3],
    ["Zr", 5, 4],
    ["Nb", 5, 5],
    ["Mo", 5, 6],
    ["Tc", 5, 7],
    ["Ru", 5, 8],
    ["Rh", 5, 9],
    ["Pd", 5, 10],
    ["Ag", 5, 11],
    ["Cd", 5, 12],
    ["In", 5, 13],
    ["Sn", 5, 14],
    ["Sb", 5, 15],
    ["Te", 5, 16],
    ["I", 5, 17],
    ["Xe", 5, 18],

    // Chu kì 6
    ["Cs", 6, 1],
    ["Ba", 6, 2],
    ["La", 6, 3],
    ["Hf", 6, 4],
    ["Ta", 6, 5],
    ["W", 6, 6],
    ["Re", 6, 7],
    ["Os", 6, 8],
    ["Ir", 6, 9],
    ["Pt", 6, 10],
    ["Au", 6, 11],
    ["Hg", 6, 12],
    ["Tl", 6, 13],
    ["Pb", 6, 14],
    ["Bi", 6, 15],
    ["Po", 6, 16],
    ["At", 6, 17],
    ["Rn", 6, 18],

    // Chu kì 7
    ["Fr", 7, 1],
    ["Ra", 7, 2],
    ["Ac", 7, 3],
    ["Rf", 7, 4],
    ["Db", 7, 5],
    ["Sg", 7, 6],
    ["Bh", 7, 7],
    ["Hs", 7, 8],
    ["Mt", 7, 9],
    ["Ds", 7, 10],
    ["Rg", 7, 11],
    ["Cn", 7, 12],
    ["Nh", 7, 13],
    ["Fl", 7, 14],
    ["Mc", 7, 15],
    ["Lv", 7, 16],
    ["Ts", 7, 17],
    ["Og", 7, 18]
];


/*
========================================
TẠO CÁC Ô
========================================
*/

elements.forEach(([symbol, row, column]) => {

    const element = document.createElement("div");

    element.className = "element";

    element.textContent = symbol;

    element.style.gridRow = row;

    element.style.gridColumn = column;


    /*
    ========================================
    KHI ĐƯA CHUỘT VÀO Ô
    ========================================
    */

    element.addEventListener("mouseenter", () => {

        const tableBox =
            document.querySelector(".table-box");

        const tableRect =
            tableBox.getBoundingClientRect();

        const elementRect =
            element.getBoundingClientRect();


        /*
        Vị trí trung tâm của ô
        */

        const x =
            elementRect.left -
            tableRect.left +
            elementRect.width / 2;

        const y =
            elementRect.top -
            tableRect.top +
            elementRect.height / 2;


        /*
        ========================================
        MŨI TÊN NGANG
        ========================================

        AXIT tăng: trái → phải

        BAZƠ tăng: phải → trái
        */


        acidRight.style.left =
            `${x + 35}px`;

        acidRight.style.top =
            `${y - 25}px`;


        baseLeft.style.left =
            `${x - 100}px`;

        baseLeft.style.top =
            `${y + 20}px`;


        /*
        ========================================
        MŨI TÊN DỌC
        ========================================

        AXIT tăng: dưới → trên

        BAZƠ tăng: trên → dưới
        */

        acidUp.style.left =
            `${x - 55}px`;

        acidUp.style.top =
            `${y - 100}px`;


        baseDown.style.left =
            `${x + 35}px`;

        baseDown.style.top =
            `${y + 40}px`;


        /*
        ========================================
        KIỂM TRA NHÓM A / NHÓM B
        ========================================
        */

        // Nhóm B: cột 3 → 12
        const isGroupB = column >= 3 && column <= 12;


        /*
        ========================================
        NẾU LÀ NHÓM B
        ========================================
        */

        if (isGroupB) {

            // Ẩn toàn bộ mũi tên
            acidRight.classList.remove("show");
            baseLeft.classList.remove("show");
            acidUp.classList.remove("show");
            baseDown.classList.remove("show");

            info.innerHTML = `
                <b>${symbol}</b>

                <p>
                    Nhóm B không có quy luật axit – bazơ đơn giản
                    như nhóm A.
                    <br>
                    Tính axit – bazơ phụ thuộc nhiều vào
                    <b>số oxi hóa</b>.
                </p>
            `;

        }


        /*
        ========================================
        NẾU LÀ NHÓM A
        ========================================
        */

        else {

            // Hiện mũi tên
            acidRight.classList.add("show");
            baseLeft.classList.add("show");
            acidUp.classList.add("show");
            baseDown.classList.add("show");

            info.innerHTML = `
                <b>${symbol}</b>

                <p>
                    ← Tính bazơ tăng dần
                    &nbsp;&nbsp;&nbsp;
                    → Tính axit tăng dần
                    <br>
                    ↑ Tính axit tăng dần
                    &nbsp;&nbsp;&nbsp;
                    ↓ Tính bazơ tăng dần
                </p>
            `;
        }
    });


    table.appendChild(element);
});


/*
========================================
RỜI KHỎI BẢNG
========================================
*/

table.addEventListener("mouseleave", () => {

    acidRight.classList.remove("show");

    baseLeft.classList.remove("show");

    acidUp.classList.remove("show");

    baseDown.classList.remove("show");

    info.innerHTML = `
        <b>Đưa chuột vào một ô nguyên tố</b>

        <p>
            Các mũi tên sẽ xuất hiện để chỉ chiều tăng.
        </p>
    `;
});