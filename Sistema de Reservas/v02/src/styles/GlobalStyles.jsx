import { useTheme } from "../context/ThemeContext";

export default function GlobalStyles() {
  const { t } = useTheme();
  return (
    <style>{`
      *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
      body{background:${t.bg};color:${t.textPrimary};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
      ::-webkit-scrollbar{width:6px;height:6px}
      ::-webkit-scrollbar-track{background:transparent}
      ::-webkit-scrollbar-thumb{background:${t.border};border-radius:3px}
      ::-webkit-scrollbar-thumb:hover{background:${t.accent}}
      input,select,textarea{font-family:inherit}
      button{font-family:inherit;cursor:pointer}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
      .fade-in{animation:fadeIn .25s ease}
      .row-hover:hover{background:${t.bgHover}!important}
    `}</style>
  );
}
