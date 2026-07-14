import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../lib/api";
import { t } from "../../styles/tokens";

interface LinktreeItem {
  id: string; title: string; url: string; icon: string; ordem: number;
}
interface Motel {
  id: string; nome: string;
}

export function LinksPage() {
  const [params] = useSearchParams();
  const motelId = params.get("id") || "";

  const [motel, setMotel] = useState<Motel | null>(null);
  const [links, setLinks] = useState<LinktreeItem[]>([]);

  useEffect(() => {
    if (!motelId) return;
    api.get<Motel>(`/motels/${motelId}`).then(setMotel).catch(console.error);
    api.get<LinktreeItem[]>(`/linktree/${motelId}`).then(setLinks).catch(() => setLinks([]));
  }, [motelId]);

  if (!motelId) {
    return <div style={{ padding: 40, textAlign: "center", color: t.textSecondary }}>Motel não especificado.</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: `linear-gradient(180deg, #0d0d0d 0%, #1a1a2e 100%)`, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg, #d20150, #a0013d)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color: "#fff", fontSize: 32 }}>
          🏨
        </div>
        <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 700, margin: 0 }}>{motel?.nome || "Motéis Fortaleza"}</h1>
      </div>

      <div style={{ width: "100%", maxWidth: 400, display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map((l) => (
          <a
            key={l.id}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 18px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#fff",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 600,
              transition: "background .15s",
            }}
          >
            <span style={{ fontSize: 20 }}>{l.icon || "🔗"}</span>
            <span>{l.title}</span>
          </a>
        ))}
        {links.length === 0 && (
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            Nenhum link disponível
          </p>
        )}
      </div>
    </div>
  );
}
