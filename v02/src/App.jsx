import { useState, useEffect } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import { AppCtx } from "./context/AppContext";
import { loadMotels } from "./services/dataService";
import { LoginPage } from "./components/pages/LoginPage";
import { AdminShell } from "./components/AdminShell";

export default function App() {
  const [page, setPage] = useState("login");
  const [suites, setSuites] = useState([]);
  const [moteis, setMoteis] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMotels().then(({ moteis: m, suites: s }) => {
      setMoteis(m);
      setSuites(s.map(x => ({ ...x })));
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:"#7a5a8a",fontFamily:"sans-serif" }}>Carregando...</div>;

  return (
    <ThemeProvider>
      <AppCtx.Provider value={{ page, setPage }}>
        {page === "login" && <LoginPage />}
        {page === "admin" && <AdminShell suites={suites} setSuites={setSuites} moteis={moteis} setMoteis={setMoteis} />}
      </AppCtx.Provider>
    </ThemeProvider>
  );
}
