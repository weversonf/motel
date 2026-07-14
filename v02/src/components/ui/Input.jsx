import { useTheme } from "../../context/ThemeContext";

export const Input = ({ value, onChange, placeholder, type="text", style:sx={} }) => {
  const { t } = useTheme();
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      style={{ width:"100%", background:t.bg, border:`1px solid ${t.border}`,
        borderRadius:5, padding:"8px 11px", color:t.textPrimary, fontSize:13,
        outline:"none", ...sx }}
      onFocus={e=>{ e.target.style.borderColor=t.accent; e.target.style.background="#fff5f8" }}
      onBlur={e=>{ e.target.style.borderColor=t.border; e.target.style.background=t.bg }}/>
  );
};
