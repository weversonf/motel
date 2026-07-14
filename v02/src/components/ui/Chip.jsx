import { useTheme } from "../../context/ThemeContext";

export const Chip = ({ children, color, bg }) => {
  const { t } = useTheme();
  return (
    <span style={{
      display:"inline-block", padding:"2px 9px", borderRadius:4, fontSize:11,
      fontWeight:600, letterSpacing:.3,
      color: color || t.textSecondary,
      background: bg || t.bgItem,
      border:`1px solid ${color || t.border}33`,
    }}>{children}</span>
  );
};
