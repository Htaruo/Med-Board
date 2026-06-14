import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { PatientProvider } from "./context/PatientContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PatientProvider>
      <App />
    </PatientProvider>
  </StrictMode>
);