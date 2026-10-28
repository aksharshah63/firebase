import {
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import {
  get,
  limitToLast,
  onValue,
  orderByKey,
  push,
  query,
  ref,
  remove,
  runTransaction,
  set,
  update,
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";
import { auth, database } from "./firebase.js";

let stopDatabaseListener;
const statusElement = document.getElementById("database-status");
const dataElement = document.getElementById("database-data");
const profileForm = document.getElementById("user-data-form");

onAuthStateChanged(auth, (user) => {
  if (!user) {
    if (stopDatabaseListener) {
      stopDatabaseListener();
      stopDatabaseListener = undefined;
    }
    location.replace("index.html");
  } else {
    document.getElementById("user").textContent = `Hello, ${user.email}`;
    if (!stopDatabaseListener) {
      stopDatabaseListener = onValue(
        ref(database, `users/${user.uid}`),
        (snapshot) => {
          const value = snapshot.val();
          dataElement.textContent = value === null ? "No database data found." : JSON.stringify(value, null, 2);
        },
        (error) => {
          console.error("Failed to read Realtime Database:", error);
          showStatus("Unable to read your database data.");
        },
      );
    }
  }
});

document.getElementById("set-data").addEventListener("click", async () => {
  if (!profileForm.reportValidity()) {
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    return;
  }

  try {
    await set(ref(database, `users/${user.uid}/profile`), getProfileValues());
    showStatus("Profile saved.");
  } catch (error) {
    console.error("Failed to set user profile:", error);
    showStatus("Unable to save your profile.");
  }
});

document.getElementById("update-data").addEventListener("click", async () => {
  if (!profileForm.reportValidity()) {
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    return;
  }

  try {
    await update(ref(database, `users/${user.uid}/profile`), getProfileValues());
    showStatus("Profile updated.");
  } catch (error) {
    console.error("Failed to update user profile:", error);
    showStatus("Unable to update your profile.");
  }
});

document.getElementById("push-data").addEventListener("click", async () => {
  if (!profileForm.reportValidity()) {
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    return;
  }

  try {
    await push(ref(database, `users/${user.uid}/entries`), getProfileValues());
    showStatus("Entry added.");
  } catch (error) {
    console.error("Failed to add user entry:", error);
    showStatus("Unable to add an entry.");
  }
});

document.getElementById("transaction-data").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    return;
  }

  try {
    const result = await runTransaction(
      ref(database, `users/${user.uid}/transactionCount`),
      (count) => (typeof count === "number" ? count : 0) + 1,
    );
    showStatus(result.committed ? `Transaction count: ${result.snapshot.val()}` : "Transaction was not committed.");
  } catch (error) {
    console.error("Failed to run database transaction:", error);
    showStatus("Unable to run the transaction.");
  }
});

document.getElementById("remove-data").addEventListener("click", async () => {
  const user = auth.currentUser;
  if (!user) {
    return;
  }

  try {
    const entriesQuery = query(
      ref(database, `users/${user.uid}/entries`),
      orderByKey(),
      limitToLast(1),
    );
    const snapshot = await get(entriesQuery);
    const latestEntry = snapshot.exists() ? Object.keys(snapshot.val())[0] : null;

    if (!latestEntry) {
      showStatus("There are no pushed entries to remove.");
      return;
    }

    await remove(ref(database, `users/${user.uid}/entries/${latestEntry}`));
    showStatus("Latest pushed entry removed.");
  } catch (error) {
    console.error("Failed to remove user entry:", error);
    showStatus("Unable to remove the latest entry.");
  }
});

document.getElementById("logout").addEventListener("click", async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Failed to sign out:", error);
  }
});

function getProfileValues() {
  return {
    name: document.getElementById("name").value.trim(),
    age: Number(document.getElementById("age").value),
  };
}

function showStatus(message) {
  statusElement.textContent = message;
}