import { useTheme } from "../../context/ThemeContext";

export const Card = ({ children, style:sx={} }) => {
  const { t } = useTheme();
  return (
    <div style={{ background:t.bgCard, border:`1px solid ${t.border}`, borderRadius:8, ...sx }}>
      {children}
    </div>
  );
};
