import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { AssigneesProvider } from "./context/AssigneesContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AssigneesProvider>
        <App />
      </AssigneesProvider>
    </BrowserRouter>
  </React.StrictMode>
);
