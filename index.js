import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { onValue, ref } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";
import { auth, database } from "./firebase.js";

const loginForm = document.getElementById("loginform");
const loginError = document.getElementById("login-error");
const dataElement = document.getElementById("data");
const signupButton = document.getElementById("signup");
const forgotPasswordButton = document.getElementById("forgot-password");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const resetEmailNotice = "If an account exists for that email, a password reset link has been sent.";

onValue(
  ref(database, "username"),
  (snapshot) => {
    const value = snapshot.val();
    dataElement.textContent =
      value === null
        ? "No database data found."
        : typeof value === "string"
          ? value
          : JSON.stringify(value, null, 2);
  },
  (error) => {
    console.error("Failed to read Realtime Database:", error);
    dataElement.textContent = "Unable to load database data.";
  },
);

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    clearError();
    await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
  } catch (error) {
    console.error("Failed to sign in:", error);
    showError(getAuthErrorMessage(error, "Unable to sign in. Check your email and password."));
  }
});

signupButton.addEventListener("click", async () => {
  if (!loginForm.reportValidity()) {
    return;
  }

  try {
    clearError();
    await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
  } catch (error) {
    console.error("Failed to create account:", error);
    showError(getAuthErrorMessage(error, "Unable to create your account."));
  }
});

forgotPasswordButton.addEventListener("click", async () => {
  clearError();
  emailInput.value = emailInput.value.trim();
  emailInput.setCustomValidity("");

  if (!emailInput.value) {
    emailInput.setCustomValidity("Enter your email address to reset your password.");
  }

  if (!emailInput.reportValidity()) {
    return;
  }

  try {
    await sendPasswordResetEmail(auth, emailInput.value);
    showError(resetEmailNotice);
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    if (error.code === "auth/user-not-found") {
      showError(resetEmailNotice);
      return;
    }
    showError(getAuthErrorMessage(error, "Unable to send a password reset email. Please try again."));
  }
});

emailInput.addEventListener("input", () => {
  emailInput.setCustomValidity("");
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    location.replace("welcome.html");
  }
});

function clearError() {
  loginError.hidden = true;
  loginError.textContent = "";
}

function showError(message) {
  loginError.textContent = message;
  loginError.hidden = false;
}

function getAuthErrorMessage(error, fallback) {
  switch (error.code) {
    case "auth/email-already-in-use":
      return "An account already exists for this email.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return "Choose a stronger password (at least 6 characters).";
    default:
      return fallback;
  }
}