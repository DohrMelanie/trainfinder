import type { TicketType } from '@/lib/types';

interface TicketBadgeProps {
  type: TicketType;
  compact?: boolean;
}

export default function TicketBadge({ type, compact = false }: TicketBadgeProps) {
  let label = '';
  let className = 'badge ';

  switch (type) {
    case 'deutschlandticket':
      label = compact ? 'D-Ticket' : 'Deutschlandticket';
      className += 'badge-deutschlandticket';
      break;
    case 'klimaticket-ooe':
      label = compact ? 'Klima OÖ' : 'Klimaticket OÖ';
      className += 'badge-klimaticket-ooe';
      break;
    case 'vorteilscard':
      label = compact ? 'Vorteilscard' : 'ÖBB Vorteilscard';
      className += 'badge-vorteilscard';
      break;
    case 'full-price':
      label = compact ? 'Regular Ticket' : 'Regular Ticket';
      className += 'badge-full-price';
      break;
    case 'walking':
      label = 'Walking';
      className += 'badge-walking';
      break;
  }

  return (
    <span className={className}>
      {label}
    </span>
  );
}
