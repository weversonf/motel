import { useState, useEffect } from "react";

export function useTimer(since) {
  const [e, setE] = useState(0);
  useEffect(() => {
    if (!since) return;
    const tick = () => setE(Math.floor((Date.now() - new Date(since).getTime()) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [since]);
  const h = String(Math.floor(e / 3600)).padStart(2, "0");
  const m = String(Math.floor((e % 3600) / 60)).padStart(2, "0");
  const s = String(e % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}
