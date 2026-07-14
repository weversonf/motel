export { useTheme } from "../context/ThemeContext";

// Backward compat — use "import { t }" still works via useTheme().t
import { useTheme } from "../context/ThemeContext";
export const t = typeof window !== "undefined" ? (()=>{try{return useTheme().t}catch{return {}}})() : {};
