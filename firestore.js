// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCJsu5WEYEQDvaEp5oIUUrbQXTHyfK3gq0",
    authDomain: "expensehelper-d1ac3.firebaseapp.com",
    projectId: "expensehelper-d1ac3",
    storageBucket: "expensehelper-d1ac3.appspot.com",
    messagingSenderId: "884921440982",
    appId: "1:884921440982:web:d1e251a2fa6a5b671c4777"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);