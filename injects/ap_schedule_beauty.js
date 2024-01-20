chrome.runtime.sendMessage("get_ap_cookie", (e) => {
    fetch(e.url, {
        method: "GET",
        headers: {
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Encoding": "gzip, deflate, br",
            "Accept-Language": "vi,vi-VN;q=0.9,fr-FR;q=0.8,fr;q=0.7,en-US;q=0.6,en;q=0.5",
            Cookie: e.cookie,
        },
    })
        .then((res) => res.text())
        .then((res) => {
            const doc = document.createElement("div");
            doc.innerHTML = res;
            reWriteData(doc);
        });
});

function reWriteData(doc) {
    const table = doc.querySelector("table");

    const rows = table.querySelectorAll("tbody tr");

    const data = [];
    rows.forEach((row) => {
        const cols = row.querySelectorAll("td");

        const item = {
            stt: cols[0].textContent,
            date: cols[1].textContent,
            room: cols[2].textContent + " - " + cols[3].textContent,
            courseCode: cols[4].textContent,
            courseName: cols[5].textContent,
            roomName: cols[6].textContent,
            teacher: cols[7].textContent,
            slot: cols[8].textContent,
            time: cols[9].textContent,
            meet: cols[10].textContent,
            details: cols[11].innerHTML,
        };

        data.push(item);
    });

    const groupedItems = {};

    data.forEach((item) => {
        const date = item.date;

        if (!groupedItems[date]) {
            groupedItems[date] = [];
        }

        groupedItems[date].push(item);
    });

    const newTable = document.createElement("div");

    Object.keys(groupedItems).forEach((date) => {
        const card = document.createElement("div");
        card.classList.add("lich-hoc-card");

        const header = document.createElement("div");
        header.classList.add("lich-hoc-header");
        header.innerHTML = `<h4 style="text-align: center">${date.replace(date[0], date[0].toUpperCase())}</h4>`;

        const content = document.createElement("div");
        content.classList.add("lich-hoc-content");

        groupedItems[date].forEach((item) => {
            const itemDiv = document.createElement("div");
            itemDiv.classList.add("lich-hoc-item");

            var typeRoom;
            if (Number(item.slot) <= 6) {
                typeRoom = "Ca: " + item.slot;
            } else {
                typeRoom = "Tự học";
            }

            let nameDetails = item.details.replace(item.details.split("</a>")[0].split(">")[1], item.courseName);

            itemDiv.innerHTML = `
                <div class="lich-hoc-item-tag" ${
                    typeRoom == "Tự học"
                        ? 'style = "background: white; color: #959cb6;border: 2px dashed #959cb6;border-top: 0"'
                        : 'style = "top: -2px"'
                }>${typeRoom}</div>
                <div class="courseName"><h5>${nameDetails}</h5></div>
                <div><strong>room     : </strong> ${item.room}</div>
                <div><strong>class    : </strong> ${item.roomName}</div>
                <div><strong>teacher  : </strong> ${item.teacher}</div>
                <div><strong>slot     : </strong>[${item.time}]</div>
                <div><strong></strong> <a href="${item.meet}" target="_blank">${item.meet}</a></div>
          `;

            content.appendChild(itemDiv);
        });

        card.appendChild(header);
        card.appendChild(content);

        newTable.appendChild(card);
    });

    const real = document.querySelector("#DataTables_Table_0");

    real.parentNode.appendChild(newTable);
    real.remove();
}
