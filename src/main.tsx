import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FlatProvider } from "./context/FlatContext";
import "./index.css";

import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FlatProvider>
      <App />
    </FlatProvider>
  </StrictMode>
);