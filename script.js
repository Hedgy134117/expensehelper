import { createEntry, createExpense, getAllExpenses, getEntries, getExpense, setEntry, setExpense } from "./api.js";

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

function taxInput(key, input) {
    if (key == "t") {
        input.value = (input.value * 1.07).toFixed(2);
    }
}

function createNewRow() {
    i++;
    let newInputRow = document.querySelector("#entry").content.cloneNode(true);

    const newInputs = [...newInputRow.querySelectorAll("input")];
    for (let input of newInputs) {
        input.setAttribute("form", `row${i}`);
        input.value = "";
    }
    newInputs[0].parentElement.parentElement.removeAttribute("data-entryid");
    newInputs[1].addEventListener("keydown", e => taxInput(e.key, e.target));
    newInputRow.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
        checkbox.addEventListener("change", updateInformation);
    })
    document.querySelector("tbody").appendChild(newInputRow);

    const newForm = document.createElement("form");
    newForm.addEventListener("submit", e => submitForm(e));
    newForm.id = `row${i}`;
    document.querySelector("section").insertAdjacentElement("afterbegin", newForm);

    return document.querySelector("tbody").lastChild.previousSibling;
}

function loadNewRow(row, id, data) {
    const newRow = createNewRow(row);
    console.log(newRow);
    newRow.setAttribute("data-entryid", id);
    const inputs = [...newRow.querySelectorAll("input")];
    inputs[0].value = data["name"];
    inputs[1].value = data["cost"];
    for (let i = 2; i <= 6; i++) {
        inputs[i].checked = data["optout"][i - 2];
    }
    return newRow;
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

    document.querySelector("#expense-total").innerText = `$${dues.reduce((a, b) => a + b, 0).toFixed(2)}`;
}

async function loadExpense(id) {
    const expense = await getExpense(id);
    const entries = await getEntries(id);

    // Change title
    document.querySelector("#title-entry").value = expense["name"];
    document.querySelector("#expense-id").value = id;

    // Clear current expense
    const oldRows = [...document.querySelectorAll(".entry")];
    for (let i = 0; i < oldRows.length; i++) {
        oldRows[i].remove();
    }

    // Load new entries
    let lastRowCreated = null;
    for (const [id, data] of Object.entries(entries)) {
        if (lastRowCreated != null) {
            lastRowCreated = loadNewRow(lastRowCreated, id, data);
        } else {
            lastRowCreated = loadNewRow(document.querySelector("#entry"), id, data)
        }
    }

    // Load payments
    let payments = [...document.querySelectorAll(".due-paid")];
    for (let i = 0; i < expense["paid"].length; i++) {
        payments[i].checked = expense["paid"][i];
    }

    updateInformation();
}

async function loadAllExpenses() {
    const expenses = await getAllExpenses();
    const expenseList = document.querySelector("#expense-list");
    expenseList.innerHTML = "";
    for (const [id, data] of Object.entries(expenses)) {
        const expenseObject = document.createElement("li");
        expenseObject.innerText = data["name"];
        expenseObject.setAttribute("data-eid", id);
        expenseObject.addEventListener("click", e => {
            document.querySelectorAll("#expense-list li").forEach(expense => {
                expense.classList.remove("expense-selected");
            })

            e.target.classList.add("expense-selected");
            loadExpense(id)
        });
        expenseList.insertAdjacentElement("afterbegin", expenseObject);
    }
}

async function save() {
    toggleSaveDisplay();
    const titleForm = document.querySelector("#title");
    const title = titleForm[0].value;

    if (title === "") {
        alert("Expense needs a title");
        return;
    }

    // Create expense if it doesn't exist
    let expenseId = titleForm[1].value;
    const payer = titleForm[2].value;
    let duePaid = [...document.querySelectorAll(".due-paid")]
    for (let i = 0; i < duePaid.length; i++) {
        duePaid[i] = duePaid[i].checked;
    }

    if (expenseId === "") {
        expenseId = (await createExpense(title, payer, duePaid)).id;
    } else {
        await setExpense(expenseId, title, payer, duePaid);
    }

    // Create/update each entry
    const entries = [...document.querySelectorAll(".entry")];
    for (let entry of entries) {
        const inputs = [...entry.querySelectorAll("input")];
        const entryName = inputs[0].value;

        if (entryName === "") {
            continue;
        }

        const entryCost = parseFloat(inputs[1].value);
        let optout = [];
        for (let i = 2; i <= 6; i++) {
            optout.push(inputs[i].checked);
        }

        if (entry.hasAttribute("data-entryid")) {
            await setEntry(entry.getAttribute("data-entryid"), entryName, entryCost, expenseId, optout);
        } else {
            await createEntry(entryName, entryCost, expenseId, optout);
        }
    }
    await loadAllExpenses();
    toggleSaveDisplay();
}

function toggleSaveDisplay() {
    const overlay = document.querySelector("#saving-overlay");
    overlay.toggleAttribute("hidden");
}

window.onload = async () => {
    document.querySelector("#title").addEventListener("submit", e => {
        e.preventDefault();
        if (document.querySelector(".entry") == null) {
            createNewRow(document.querySelector("#entry"));
        }
        document.querySelector(".entry input").focus();
    })


    document.querySelector("#save").addEventListener("click", e => {
        e.preventDefault();
        save();
    })

    document.addEventListener("keydown", e => {
        if (e.ctrlKey && e.key === "s") {
            e.preventDefault();
            save();
        }
    })

    await loadAllExpenses();
}

