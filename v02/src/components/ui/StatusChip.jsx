import { useTheme } from "../../context/ThemeContext";
import { Chip } from "./Chip";

export const RES_STATUS = {
  confirmado:   { label:"Confirmado",        color:"confirmed",   bg:"confirmedBg"   },
  pendente:     { label:"Pendente",          color:"pending",     bg:"pendingBg"     },
  aguardando:   { label:"Aguardando Pagto",  color:"waiting",     bg:"waitingBg"     },
  cancelado:    { label:"Cancelado",         color:"cancelled",   bg:"cancelledBg"   },
  "pagar-motel":{ label:"Pagar no Motel",    color:"pagarMotel",  bg:"pagarMotelBg"  },
  "check-in":   { label:"Check-in",          color:"checkin",     bg:"checkinBg"     },
};

export const StatusChip = ({ status }) => {
  const { t } = useTheme();
  const cfg = RES_STATUS[status] || RES_STATUS.pendente;
  return <Chip color={t[cfg.color]} bg={t[cfg.bg]}>{cfg.label}</Chip>;
};
