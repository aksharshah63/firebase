import { initializeApp } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCRp7k-wQWSUwd83PB2s5MTe28585uSjsc",
  authDomain: "test-project-5f3d1.firebaseapp.com",
  projectId: "test-project-5f3d1",
  databaseURL: "https://test-project-5f3d1-default-rtdb.firebaseio.com",
  storageBucket: "test-project-5f3d1.firebasestorage.app",
  messagingSenderId: "357013630688",
  appId: "1:357013630688:web:76b42089005f6244d2ea85",
  measurementId: "G-M1B8HE551D",
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const database = getDatabase(app);
console.log(app.options)