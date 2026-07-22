import type { StatusLabel } from '../../types/inventory'

type StatusBadgeProps = {
  label: StatusLabel
  tone?: 'urgent' | 'queue'
}

const styles: Record<
  StatusLabel,
  { urgent: string; queue: string }
> = {
  'Out of Stock': {
    urgent: 'bg-brand-danger-light text-brand-danger ring-brand-danger/20',
    queue: 'bg-brand-danger-light text-brand-danger ring-brand-danger/20',
  },
  'Reorder Now': {
    urgent: 'bg-brand-orange-light text-brand-orange ring-brand-orange/25',
    queue: 'bg-brand-orange-light text-brand-orange ring-brand-orange/25',
  },
  'Expiring Soon': {
    urgent: 'bg-brand-orange-light text-orange-700 ring-brand-orange/20',
    queue: 'bg-brand-yellow-light text-yellow-800 ring-brand-yellow/30',
  },
  'Monitor Stock': {
    urgent: 'bg-brand-blue-light text-brand-blue ring-brand-blue/20',
    queue: 'bg-brand-blue-light text-brand-blue ring-brand-blue/20',
  },
  'Upcoming Expiration': {
    urgent: 'bg-brand-yellow-light text-yellow-800 ring-brand-yellow/30',
    queue: 'bg-brand-yellow-light text-yellow-800 ring-brand-yellow/30',
  },
}

export function StatusBadge({ label, tone = 'urgent' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[label][tone]}`}
    >
      {label}
    </span>
  )
}
