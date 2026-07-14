import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../context/ThemeContext";
import { loadReservations } from "../services/dataService";
import GlobalStyles from "../styles/GlobalStyles";
import { Sidebar } from "./layout/Sidebar";
import { Btn } from "./ui/Btn";
import { PageCalendario } from "./pages/PageCalendario";
import { PageTabela } from "./pages/PageTabela";
import { PageRelatorios } from "./pages/PageRelatorios";
import { PageRecepcao } from "./pages/PageRecepcao";
import { PageEstoque } from "./pages/PageEstoque";
import { PageProdutos } from "./pages/PageProdutos";
import { PageNPS } from "./pages/PageNPS";
import { PageCadastro } from "./pages/PageCadastro";
import { PageEncurtador } from "./pages/PageEncurtador";
import { ModuleGovernanca } from "./pages/ModuleGovernanca";
import { PageGerenciar } from "./pages/PageGerenciar";
import { PageApi } from "./pages/PageApi";
import { PageControleAcesso } from "./pages/PageControleAcesso";

export function AdminShell({ suites, setSuites, moteis, setMoteis }) {
  const { t } = useTheme();
  const [page, setPage] = useState("calendario");
  const [open, setOpen] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReservations().then(data => {
      setReservations(data);
      setLoading(false);
    });
  }, []);

  const handleSetReservations = useCallback((valOrFn) => {
    setReservations(valOrFn);
  }, []);

  if (loading) return <div style={{ minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",color:t.textSecondary,fontFamily:"sans-serif",background:t.bg }}>Carregando reservas...</div>;

  if (page === "governanca") {
    return (
      <div>
        <GlobalStyles/>
        <div style={{ position:"fixed",top:10,left:10,zIndex:200 }}>
          <Btn small variant="ghost" onClick={()=>setPage("calendario")}>← Voltar ao painel</Btn>
        </div>
        <ModuleGovernanca suites={suites} setSuites={setSuites}/>
      </div>
    );
  }

  const pages = {
    calendario: <PageCalendario reservations={reservations} setReservations={handleSetReservations} moteis={moteis}/>,
    tabela:     <PageTabela reservations={reservations} setReservations={handleSetReservations} suites={suites} setSuites={setSuites} moteis={moteis}/>,
    relatorios: <PageRelatorios/>,
    recepcao:   <PageRecepcao suites={suites} setSuites={setSuites} moteis={moteis}/>,
    estoque:    <PageEstoque/>,
    produtos:   <PageProdutos/>,
    financeiro: <PageRelatorios/>,
    cadastro:   <PageCadastro/>,
    nps:        <PageNPS/>,
    encurtador: <PageEncurtador/>,
    governanca: null,
    gerenciar:  <PageGerenciar moteis={moteis} setMoteis={setMoteis} suites={suites} setSuites={setSuites}/>,
    api:        <PageApi moteis={moteis} setMoteis={setMoteis}/>,
    acesso:     <PageControleAcesso/>,
  };

  return (
    <div style={{ display:"flex", height:"100vh", background:t.bg, overflow:"hidden" }}>
      <GlobalStyles/>
      <Sidebar active={page} setActive={setPage} open={open} setOpen={setOpen}/>
      <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {pages[page] || <div style={{ padding:40,color:t.textSecondary }}>Em breve</div>}
      </main>
    </div>
  );
}
