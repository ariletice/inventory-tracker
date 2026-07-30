import {
  AlertCircle,
  CalendarClock,
  PackageMinus,
  PackageX,
} from 'lucide-react'

export type SummaryCardKey =
  | 'expired'
  | 'outOfStock'
  | 'lowStock'
  | 'expiringWithin14Days'

type SummaryCardsProps = {
  expired: number
  outOfStock: number
  lowStock: number
  expiringWithin14Days: number
  onCardClick?: (key: SummaryCardKey) => void
}

const cards = [
  {
    key: 'expired' as const,
    label: 'Expired',
    action: 'Remove from inventory',
    icon: PackageX,
    accent: 'dangerStrong' as const,
  },
  {
    key: 'outOfStock' as const,
    label: 'Out of Stock',
    action: 'Reorder now',
    icon: AlertCircle,
    accent: 'dangerSoft' as const,
  },
  {
    key: 'lowStock' as const,
    label: 'Low Stock',
    action: 'Reorder soon',
    icon: PackageMinus,
    accent: 'orange' as const,
  },
  {
    key: 'expiringWithin14Days' as const,
    label: 'Expiring Within 14 Days',
    action: 'Sell or use soon',
    icon: CalendarClock,
    accent: 'orange' as const,
  },
]

const accentStyles = {
  dangerStrong: {
    number: 'text-brand-danger',
    iconWrap: 'bg-brand-danger text-white',
    card: 'border-brand-danger/25',
  },
  dangerSoft: {
    number: 'text-brand-danger',
    iconWrap: 'bg-brand-danger-light text-brand-danger',
    card: 'border-brand-border',
  },
  orange: {
    number: 'text-brand-orange',
    iconWrap: 'bg-brand-orange-light text-brand-orange',
    card: 'border-brand-border',
  },
}

export function SummaryCards({ onCardClick, ...props }: SummaryCardsProps) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon
          const value = props[card.key]
          const styles = accentStyles[card.accent]
          const interactive = Boolean(onCardClick)

          const content = (
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-brand-muted">
                  {card.label}
                </p>
                <p
                  className={`mt-2 text-3xl font-semibold tracking-tight ${styles.number}`}
                >
                  {value}
                </p>
                <p className="mt-2 text-sm font-medium text-brand-text">
                  {card.action}
                </p>
              </div>
              <div
                className={`shrink-0 rounded-xl p-2.5 ${styles.iconWrap}`}
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          )

          if (interactive) {
            return (
              <button
                key={card.key}
                type="button"
                onClick={() => onCardClick?.(card.key)}
                className={`rounded-2xl border bg-brand-white p-5 text-left shadow-sm transition hover:bg-brand-bg/60 focus-visible:outline-offset-2 ${styles.card}`}
              >
                {content}
              </button>
            )
          }

          return (
            <article
              key={card.key}
              className={`rounded-2xl border bg-brand-white p-5 shadow-sm ${styles.card}`}
            >
              {content}
            </article>
          )
        })}
      </div>
      <p className="mt-4 text-sm text-brand-muted">
        A product may appear in more than one alert.
      </p>
    </div>
  )
}
