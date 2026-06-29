import { t } from "../../styles/tokens";

export const Card = ({ children, style:sx={} }) => (
  <div style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:8, ...sx }}>
    {children}
  </div>
);
