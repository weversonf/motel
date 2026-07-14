import { createContext, useContext, useState, useEffect } from "react";

const tokensLight = {
  bg:       "#f5f0f8",
  bgCard:   "#ffffff",
  bgItem:   "#faf5ff",
  bgHover:  "#fce4ec",
  border:   "#e8dff0",
  border2:  "#d4c8e0",
  textPrimary:   "#2d1b3d",
  textSecondary: "#7a5a8a",
  textMuted:     "#b8a0c8",
  accent:    "#d20150",
  accentL:   "#fce4ec",
  accentGlow:"rgba(210,1,80,0.12)",
  confirmed: "#00d99f",
  confirmedBg:"rgba(0,217,159,0.15)",
  pending:   "#ffc107",
  pendingBg: "rgba(255,193,7,0.15)",
  waiting:   "#ff6b6b",
  waitingBg: "rgba(255,107,107,0.15)",
  cancelled: "#b8a0c8",
  cancelledBg:"rgba(184,160,200,0.15)",
  pagarMotel:"#b8860b",
  pagarMotelBg:"rgba(184,134,11,0.15)",
  checkin:   "#0077cc",
  checkinBg: "rgba(0,119,204,0.15)",
  avail:   "#00d99f",
  occupied:"#ff6b6b",
  dirty:   "#ffc107",
  cleaning:"#2563eb",
  maint:   "#d20150",
  white:  "#ffffff",
  green:  "#00d99f",
  red:    "#ff6b6b",
  yellow: "#ffc107",
  blue:   "#2563eb",
  pixPend:   "#ffc107",
  pixPendBg: "rgba(255,193,7,0.15)",
  cardPend:  "#2563eb",
  cardPendBg:"rgba(37,99,235,0.15)",
  shadowSm: "0 2px 8px rgba(210,1,80,0.08)",
  shadowMd: "0 8px 24px rgba(210,1,80,0.12)",
  accentBg: "rgba(210,1,80,0.1)",
  pinkSoft: "#fce4ec",
  orangeSoft: "#ffe8d0",
};

const tokensDark = {
  bg:       "#0f0f13",
  bgCard:   "#18181d",
  bgItem:   "#1e1e24",
  bgHover:  "rgba(210,1,80,0.12)",
  border:   "#2a2a33",
  border2:  "#3a3a44",
  textPrimary:   "#e8e8ed",
  textSecondary: "#8888a0",
  textMuted:     "#55556a",
  accent:    "#d20150",
  accentL:   "rgba(210,1,80,0.15)",
  accentGlow:"rgba(210,1,80,0.2)",
  confirmed: "#00e676",
  confirmedBg:"rgba(0,230,118,0.15)",
  pending:   "#ffc107",
  pendingBg: "rgba(255,193,7,0.15)",
  waiting:   "#ff5252",
  waitingBg: "rgba(255,82,82,0.15)",
  cancelled: "#55556a",
  cancelledBg:"rgba(85,85,106,0.15)",
  pagarMotel:"#ffa000",
  pagarMotelBg:"rgba(255,160,0,0.15)",
  checkin:   "#40a9ff",
  checkinBg: "rgba(64,169,255,0.15)",
  avail:   "#00e676",
  occupied:"#ff5252",
  dirty:   "#ffc107",
  cleaning:"#40a9ff",
  maint:   "#d20150",
  white:  "#ffffff",
  green:  "#00e676",
  red:    "#ff5252",
  yellow: "#ffc107",
  blue:   "#40a9ff",
  pixPend:   "#ffc107",
  pixPendBg: "rgba(255,193,7,0.15)",
  cardPend:  "#40a9ff",
  cardPendBg:"rgba(64,169,255,0.15)",
  shadowSm: "0 2px 8px rgba(0,0,0,0.3)",
  shadowMd: "0 8px 24px rgba(0,0,0,0.4)",
  accentBg: "rgba(210,1,80,0.1)",
  pinkSoft: "rgba(210,1,80,0.15)",
  orangeSoft: "rgba(255,200,100,0.1)",
};

const ThemeCtx = createContext({ theme: "light", toggleTheme: () => {}, t: tokensLight });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem("moteis-theme") || "light"; } catch { return "light"; }
  });

  useEffect(() => {
    try { localStorage.setItem("moteis-theme", theme); } catch {}
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => setTheme(t => t === "light" ? "noir" : "light");
  const t = theme === "noir" ? tokensDark : tokensLight;

  return (
    <ThemeCtx.Provider value={{ theme, toggleTheme, t }}>
      {children}
    </ThemeCtx.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeCtx);
}
