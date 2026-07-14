import { t } from "../../styles/tokens";
import { Card } from "./Card";

export const KPI = ({ icon, label, value, color }) => (
  <Card style={{ padding:"16px 20px" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
      <span style={{ fontSize:18 }}>{icon}</span>
      <span style={{ color:t.textMuted, fontSize:11, textTransform:"uppercase", letterSpacing:.8 }}>{label}</span>
    </div>
    <p style={{ color:color||t.textPrimary, fontSize:26, fontWeight:700, margin:0 }}>{value}</p>
  </Card>
);
