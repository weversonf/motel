import { useState } from "react";
import { AppCtx } from "./context/AppContext";
import { SUITES_DATA } from "./data/mock";
import { LoginPage } from "./components/pages/LoginPage";
import { AdminShell } from "./components/AdminShell";

export default function App() {
  const [page, setPage] = useState("login");
  const [suites, setSuites] = useState(SUITES_DATA.map(s=>({...s})));
  return (
    <AppCtx.Provider value={{ page, setPage }}>
      {page==="login" && <LoginPage/>}
      {page==="admin" && <AdminShell suites={suites} setSuites={setSuites}/>}
    </AppCtx.Provider>
  );
}
