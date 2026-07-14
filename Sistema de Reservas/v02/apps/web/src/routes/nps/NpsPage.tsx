import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import { t } from "../../styles/tokens";

interface Motel {
  id: string; nome: string;
}

export function NpsPage() {
  const [searchParams] = useSearchParams();
  const motelId = searchParams.get("id") || "";

  const [motel, setMotel] = useState<Motel | null>(null);
  const [nota, setNota] = useState<number | null>(null);
  const [comentario, setComentario] = useState("");
  const [enviado, setEnviado] = useState(false);
  const [hoverNota, setHoverNota] = useState<number | null>(null);

  useEffect(() => {
    if (!motelId) return;
    api.get<Motel>(`/motels/${motelId}`).then(setMotel).catch(console.error);
  }, [motelId]);

  const enviar = async () => {
    if (nota === null) return;
    try {
      await api.post(`/nps/${motelId}`, { nota, comentario });
      setEnviado(true);
    } catch (e) {
      alert((e as Error).message);
    }
  };

  if (!motelId) {
    return <div style={{ padding: 40, textAlign: "center", color: t.textSecondary }}>Motel não especificado. Use ?id=motel-id</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(135deg, ${t.bg} 0%, #fce4ec 100%)`, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ maxWidth: 420, width: "100%", background: t.bgCard, borderRadius: 20, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", padding: "32px 28px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>⭐</div>
        <h2 style={{ margin: "0 0 4px", fontSize: 20, fontWeight: 800, color: t.textPrimary }}>
          {motel?.nome || "Motéis Fortaleza"}
        </h2>
        <p style={{ fontSize: 13, color: t.textSecondary, margin: "0 0 24px" }}>
          {enviado
            ? "Obrigado pela sua avaliação!"
            : "Como foi sua experiência? Deixe sua nota:"}
        </p>

        {!enviado ? (
          <>
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 20 }}>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => {
                const active = (hoverNota ?? nota ?? -1) >= n;
                const color = n <= 6 ? "#f44336" : n <= 8 ? "#ff9800" : "#4caf50";
                return (
                  <button
                    key={n}
                    onClick={() => setNota(n)}
                    onMouseEnter={() => setHoverNota(n)}
                    onMouseLeave={() => setHoverNota(null)}
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 6,
                      border: "none",
                      background: active ? color : t.bgItem,
                      color: active ? "#fff" : t.textSecondary,
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all .1s",
                    }}
                  >
                    {n}
                  </button>
                );
              })}
            </div>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Deixe um comentário (opcional)"
              rows={3}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: `1px solid ${t.border}`, background: t.bgItem, color: t.textPrimary, fontSize: 14, outline: "none", boxSizing: "border-box", resize: "vertical" }}
            />
            <button
              onClick={enviar}
              disabled={nota === null}
              style={{
                width: "100%", marginTop: 16, padding: "14px",
                borderRadius: 12, border: "none",
                background: nota !== null ? "linear-gradient(135deg, #d20150, #a0013d)" : "#ccc",
                color: "#fff", fontWeight: 700, fontSize: 15,
                cursor: nota !== null ? "pointer" : "not-allowed",
              }}
            >
              Enviar avaliação
            </button>
          </>
        ) : (
          <div>
            <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
            <p style={{ color: t.textSecondary, fontSize: 14 }}>Sua nota foi registrada. Volte sempre!</p>
          </div>
        )}
      </div>
    </div>
  );
}
