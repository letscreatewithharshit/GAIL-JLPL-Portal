import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./styles.css";
import { PortalProvider } from "./context/PortalContext.jsx";
import { LanguageProvider } from "./context/LanguageContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <LanguageProvider>
      <PortalProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </PortalProvider>
    </LanguageProvider>
  </React.StrictMode>,
);
