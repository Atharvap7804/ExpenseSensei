import React from "react";
import ReactDOM from "react-dom/client";   // 👈 IMPORTANT
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
ReactDOM.createRoot(document.getElementById("root")).render(
  <AuthProvider>
      <AppProvider> 
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
);