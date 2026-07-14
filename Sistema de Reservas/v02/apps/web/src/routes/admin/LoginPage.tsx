import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { authClient } from "../../lib/auth-client";
import { t } from "../../styles/tokens";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErro("");

    if (!email || !senha) {
      setErro("Preencha email e senha");
      return;
    }

    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email,
        password: senha,
      });

      if (result.error) {
        setErro(result.error.message || "Email ou senha inválidos");
        return;
      }

      navigate("/admin");
    } catch {
      setErro("Erro ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #fce4ec 0%, #ffcdd9 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 400,
          padding: "40px 36px",
          background: t.bgCard,
          border: `1px solid ${t.border}`,
          borderRadius: 24,
          boxShadow: "0 8px 24px rgba(210,1,80,0.12)",
          textAlign: "center",
        }}
      >
        <img
          src="/ICONE.png"
          alt=""
          style={{ width: 56, height: 56, marginBottom: 12, objectFit: "contain" }}
        />
        <h1
          style={{
            fontSize: 22,
            fontWeight: 800,
            margin: "0 0 4px",
            background: "linear-gradient(135deg, #d20150, #a0013d)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Motéis Fortaleza
        </h1>
        <p style={{ color: t.textSecondary, fontSize: 13, margin: "0 0 24px" }}>
          Painel de gerenciamento
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: "left" }}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, marginBottom: 4, display: "block" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.bgItem,
                color: t.textPrimary,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: t.textSecondary, marginBottom: 4, display: "block" }}>
              Senha
            </label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Sua senha"
              autoComplete="current-password"
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${t.border}`,
                background: t.bgItem,
                color: t.textPrimary,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {erro && (
            <div
              style={{
                background: "#fff0f0",
                color: "#d20150",
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 13,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: "none",
              background: loading ? "#ccc" : "linear-gradient(135deg, #d20150, #a0013d)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 15,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "opacity .15s",
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p style={{ fontSize: 12, color: t.textSecondary, marginTop: 16 }}>
          Esqueceu a senha?{" "}
          <span style={{ color: t.accent, cursor: "pointer", textDecoration: "underline" }}>
            Recuperar
          </span>
        </p>
      </div>
    </div>
  );
}
