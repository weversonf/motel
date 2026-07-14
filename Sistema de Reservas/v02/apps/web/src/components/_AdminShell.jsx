import { useState } from "react";
import { t } from "../styles/tokens";
import { RESERVATIONS_DATA } from "../data/mock";
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
import { PageDashboard } from "./pages/PageDashboard";
import { PageControleAcesso } from "./pages/PageControleAcesso";

export function AdminShell({ suites, setSuites }) {
  const [page, setPage] = useState("dashboard");
  const [open, setOpen] = useState(true);
  const [reservations, setReservations] = useState(RESERVATIONS_DATA.map(r=>({...r})));

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
    dashboard:  <PageDashboard/>,
    calendario: <PageCalendario reservations={reservations} setReservations={setReservations}/>,
    tabela:     <PageTabela reservations={reservations}/>,
    relatorios: <PageRelatorios/>,
    recepcao:   <PageRecepcao suites={suites} setSuites={setSuites}/>,
    estoque:    <PageEstoque/>,
    produtos:   <PageProdutos/>,
    financeiro: <PageRelatorios/>,
    cadastro:   <PageCadastro/>,
    acesso:     <PageControleAcesso/>,
    nps:        <PageNPS/>,
    encurtador: <PageEncurtador/>,
    governanca: null,
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
