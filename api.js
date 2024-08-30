import { db } from "./firestore.js";
import { collection, query, where, getDocs, doc, getDoc, addDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

export async function getAllExpenses() {
    const snap = await getDocs(collection(db, "expenses"));
    let expenses = {};
    snap.forEach((doc) => {
        expenses[doc.id] = doc.data();
    })
    return expenses;
}

export async function getExpense(id) {
    const ref = doc(db, "expenses", id);
    const snap = await getDoc(ref);
    return snap.data();
}

export async function createExpense(name, payer, paid) {
    return addDoc(collection(db, "expenses"), {
        "name": name,
        "payer": payer,
        "paid": paid
    });
}

export async function setExpense(id, name, payer, paid) {
    return setDoc(doc(db, "expenses", id), {
        "name": name,
        "payer": payer,
        "paid": paid
    });
}

export async function getEntries(id) {
    const q = query(collection(db, "entries"), where("expense", "==", id));
    const snap = await getDocs(q);
    let entries = {};
    snap.forEach((doc) => {
        entries[doc.id] = doc.data();
    })
    return entries;
}

export async function createEntry(name, cost, expense, optout) {
    return addDoc(collection(db, "entries"), {
        "name": name,
        "cost": cost,
        "expense": expense,
        "optout": optout
    });
}

export async function setEntry(id, name, cost, expense, optout) {
    return setDoc(doc(db, "entries", id), {
        "name": name,
        "cost": cost,
        "expense": expense,
        "optout": optout
    });
}