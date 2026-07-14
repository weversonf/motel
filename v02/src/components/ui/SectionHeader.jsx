import { useTheme } from "../../context/ThemeContext";

export const SectionHeader = ({ title, sub, right }) => {
  const { t } = useTheme();
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20, flexWrap:"wrap", gap:10 }}>
      <div>
        <h2 style={{ color:t.textPrimary, fontSize:18, fontWeight:700, margin:0 }}>{title}</h2>
        {sub && <p style={{ color:t.textSecondary, fontSize:13, margin:"3px 0 0" }}>{sub}</p>}
      </div>
      {right && <div style={{ display:"flex", gap:8 }}>{right}</div>}
    </div>
  );
};
