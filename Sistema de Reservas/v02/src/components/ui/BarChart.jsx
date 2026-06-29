import { t } from "../../styles/tokens";

export const BarChart = ({ data }) => {
  const max = Math.max(...data.map(d=>d.v));
  const W=340,H=100,PB=24,PL=8,PR=8;
  const cw=(W-PL-PR)/data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{width:"100%"}}>
      {data.map((d,i)=>{
        const bh=Math.max(4,(H-PB)*(d.v/max));
        const x=PL+i*cw+cw*.15;
        const y=H-PB-bh;
        return (
          <g key={i}>
            <rect x={x} y={y} width={cw*.7} height={bh} rx={3} fill={t.accent} opacity={.75}/>
            <text x={x+cw*.35} y={H-6} textAnchor="middle" fontSize={9} fill={t.textSecondary}>{d.day}</text>
          </g>
        );
      })}
    </svg>
  );
};
