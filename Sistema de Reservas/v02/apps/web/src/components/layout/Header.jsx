import { t } from "../../styles/tokens";

export function Header({ title, sub, right }) {
  return (
    <div style={{ padding:"14px 24px", borderBottom:`1px solid ${t.border}`,
      display:"flex", justifyContent:"space-between", alignItems:"center",
      background:t.bgCard, gap:12, flexWrap:"wrap" }}>
      <div>
        <h2 style={{ color:t.textPrimary, fontSize:16, fontWeight:700, margin:0 }}>{title}</h2>
        {sub && <p style={{ color:t.textSecondary, fontSize:12, margin:"2px 0 0" }}>{sub}</p>}
      </div>
      {right && <div style={{ display:"flex", gap:8, alignItems:"center" }}>{right}</div>}
    </div>
  );
}
