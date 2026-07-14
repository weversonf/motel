import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ReservaPage } from "./routes/reserva/ReservaPage";
import { NpsPage } from "./routes/nps/NpsPage";
import { LinksPage } from "./routes/links/LinksPage";
import { LoginPage } from "./routes/admin/LoginPage";
import {
  DashboardPage,
  CalendarioPage,
  TabelaPage,
  RelatoriosPage,
  RecepcaoPage,
  ProdutosPage,
  EstoquePage,
  CadastroPage,
  ControleAcessoPage,
  NpsAdminPage,
  EncurtadorPage,
  GovernancaPage,
} from "./routes/admin/AdminPages";
import "./styles/GlobalStyles";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/reserva" element={<ReservaPage />} />
          <Route path="/nps" element={<NpsPage />} />
          <Route path="/links" element={<LinksPage />} />
          <Route path="/admin/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="calendario" element={<CalendarioPage />} />
            <Route path="tabela" element={<TabelaPage />} />
            <Route path="relatorios" element={<RelatoriosPage />} />
            <Route path="recepcao" element={<RecepcaoPage />} />
            <Route path="produtos" element={<ProdutosPage />} />
            <Route path="estoque" element={<EstoquePage />} />
            <Route path="cadastro" element={<CadastroPage />} />
            <Route path="acesso" element={<ControleAcessoPage />} />
            <Route path="nps" element={<NpsAdminPage />} />
            <Route path="encurtador" element={<EncurtadorPage />} />
            <Route path="governanca" element={<GovernancaPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </StrictMode>
);
