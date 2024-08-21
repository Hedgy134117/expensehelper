"use strict";

const row0Form = document.querySelector("#row0");
let i = 0;

function submitForm(e) {
    e.preventDefault();
    const row = e.submitter.parentElement.parentElement;
    const rowNum = parseInt(e.target.id.substring(3))
    updateInformation();

    if (rowNum == i) {
        createNewRow(row);
    }

    const rows = [...document.querySelectorAll("tr")];
    for (let i = 0; i < rows.length; i++) {
        if (rows[i] == row) {
            rows[i + 1].querySelector("input").select();
        }
    }
}

function createNewRow(row) {
    i++;
    const newInputRow = row.cloneNode(true);
    const newInputs = [...newInputRow.querySelectorAll("input")];
    for (let input of newInputs) {
        input.setAttribute("form", `row${i}`);
        input.value = "";
    }
    row.parentElement.appendChild(newInputRow);

    const newForm = document.createElement("form");
    newForm.addEventListener("submit", e => submitForm(e));
    newForm.id = `row${i}`;
    document.querySelector("section").insertBefore(newForm, row0Form);

    newInputRow.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
        console.log(checkbox);
        checkbox.addEventListener("change", updateInformation);
    })
}

function updateInformation() {
    let dues = [0, 0, 0, 0, 0];
    for (let entry of document.querySelectorAll(".entry")) {
        let data = [...entry.querySelectorAll("input")];
        if (data[1].value == "") {
            continue;
        }
        let due = parseFloat(data[1].value);

        // 2-6 are opt outs
        let optOuts = [false, false, false, false, false];
        let totalOptOuts = 0;
        for (let i = 2; i <= 6; i++) {
            if (data[i].checked) {
                optOuts[i - 2] = true;
                totalOptOuts++;
            }
        }

        due = due / (5 - totalOptOuts);
        for (let i = 0; i < 5; i++) {
            if (!optOuts[i]) {
                dues[i] += due;
            }
        }
    }

    let dueElements = [...document.querySelectorAll(".due")];
    for (let i = 0; i < 5; i++) {
        dueElements[i].innerText = `$${dues[i].toFixed(2)}`;
    }
}

row0Form.addEventListener("submit", e => submitForm(e));
document.querySelectorAll(".entry input[type='checkbox']").forEach(checkbox => {
    checkbox.addEventListener("change", updateInformation);
})

document.querySelector("#title").addEventListener("submit", e => {
    e.preventDefault();
    console.log(e);
    document.title = e.target[0].value;
    document.querySelector("input[form='row0']").focus();
})

