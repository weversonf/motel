import { t } from "../../styles/tokens";
import { Chip } from "./Chip";

export const RES_STATUS = {
  confirmado:      { label:"Confirmado",       color:t.confirmed, bg:t.confirmedBg  },
  pix_pendente:    { label:"PIX Pendente",     color:t.yellow,    bg:t.pixPendBg    },
  cartao_pendente: { label:"Cartão Pendente",  color:t.blue,      bg:t.cardPendBg   },
  aguardando:      { label:"Aguardando Pagto", color:t.red,       bg:t.waitingBg    },
  pendente:        { label:"Pendente",         color:t.pending,   bg:t.pendingBg    },
  cancelado:       { label:"Cancelado",        color:t.cancelled, bg:t.cancelledBg  },
};

export const StatusChip = ({ status }) => {
  const cfg = RES_STATUS[status] || RES_STATUS.pendente;
  return <Chip color={cfg.color} bg={cfg.bg}>{cfg.label}</Chip>;
};
