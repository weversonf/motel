import { useState } from "react";
import { AppCtx } from "./context/AppContext";
import { SUITES_DATA } from "./data/mock";
import { LoginPage } from "./components/pages/LoginPage";
import { AdminShell } from "./components/AdminShell";

export default function App() {
  const [page, setPage] = useState("login");
  const [user, setUser] = useState(null);
  const [suites, setSuites] = useState(SUITES_DATA.map(s=>({...s})));
  const login = u => { setUser(u); setPage("admin"); };
  const logout = () => { setUser(null); setPage("login"); };
  return (
    <AppCtx.Provider value={{ page, setPage, user, login, logout }}>
      {page==="login" && <LoginPage/>}
      {page==="admin" && <AdminShell suites={suites} setSuites={setSuites}/>}
    </AppCtx.Provider>
  );
}
