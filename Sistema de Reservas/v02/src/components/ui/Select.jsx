import { useTheme } from "../../context/ThemeContext";

export const Select = ({ value, onChange, children, style:sx={} }) => {
  const { t } = useTheme();
  return (
    <select value={value} onChange={onChange}
      style={{ width:"100%", background:t.bg, border:`1px solid ${t.border}`,
        borderRadius:5, padding:"8px 11px", color:t.textPrimary, fontSize:13,
        outline:"none", ...sx }}>
      {children}
    </select>
  );
};
