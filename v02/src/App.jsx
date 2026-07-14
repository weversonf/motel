import { useState } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AppCtx } from "./context/AppContext";
import { SUITES_DATA } from "./data/mock";
import { LoginPage } from "./components/pages/LoginPage";
import { AdminShell } from "./components/AdminShell";

export default function App() {
  const [page, setPage] = useState("login");
  const [suites, setSuites] = useState(SUITES_DATA.map(s=>({...s})));
  return (
    <ThemeProvider>
      <AppCtx.Provider value={{ page, setPage }}>
        {page==="login" && <LoginPage/>}
        {page==="admin" && <AdminShell suites={suites} setSuites={setSuites}/>}
      </AppCtx.Provider>
    </ThemeProvider>
  );
}
