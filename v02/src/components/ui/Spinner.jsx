import { useTheme } from "../../context/ThemeContext";

export const Spinner = () => {
  const { t } = useTheme();
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:40 }}>
      <div style={{ width:24, height:24, border:`2px solid ${t.border2}`, borderTop:`2px solid ${t.accent}`, borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
    </div>
  );
};
