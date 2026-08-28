import { useEffect } from "react";

import AppRoutes from "./routes/AppRoutes";

const THEME_STORAGE_KEY =
  "emerald-heights-theme";

function App() {
  useEffect(() => {
    const savedTheme =
      localStorage.getItem(
        THEME_STORAGE_KEY
      );

    const isDark =
      savedTheme === "dark";

    document.documentElement.classList.toggle(
      "dark",
      isDark
    );
  }, []);

  return <AppRoutes />;
}

export default App;