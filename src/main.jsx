import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

import { auth } from "./firebase";
import { signInAnonymously } from "firebase/auth";

async function init() {
  try {
    const userCredential = await signInAnonymously(auth);

    console.log("✅ Anonymous login successful");
    console.log(userCredential.user);
  } catch (error) {
    console.error("❌ Firebase Auth Error");
    console.error("Code:", error.code);
    console.error("Message:", error.message);
    console.error(error);
  }

  ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}

init();