import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FlatProvider } from "./context/FlatContext";
import "./index.css";

import App from "./App";
import { BookingProvider } from "./context/BookingContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <FlatProvider>
      <BookingProvider>
        <App />
      </BookingProvider>
    </FlatProvider>
  </StrictMode>
);