import { t } from "../../styles/tokens";

export const Btn = ({ children, onClick, variant="primary", small=false, disabled=false, style:sx={} }) => {
  const base = { border:"none", borderRadius:100, fontWeight:600, cursor:disabled?"not-allowed":"pointer",
    padding: small ? "5px 12px" : "9px 18px", fontSize: small ? 12 : 13, opacity:disabled?.5:1,
    transition:"filter .15s", ...sx };
  const variants = {
    primary:  { background:"linear-gradient(135deg, #d20150, #a0013d)", color:t.white, boxShadow:"0 2px 8px rgba(210,1,80,0.2)" },
    ghost:    { background:"transparent", color:t.textSecondary, border:`1px solid ${t.border}` },
    danger:   { background:t.red,      color:t.white   },
    success:  { background:t.green,    color:t.white   },
    warning:  { background:t.yellow,   color:"#000"    },
  };
  return (
    <button onClick={disabled?undefined:onClick} style={{...base,...variants[variant]}}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.filter="brightness(1.1)";e.currentTarget.style.transform="translateY(-1px)"}}}
      onMouseLeave={e=>{e.currentTarget.style.filter="none";e.currentTarget.style.transform="none"}}>
      {children}
    </button>
  );
};
