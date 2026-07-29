import {
  AlertCircle,
  CalendarClock,
  PackageMinus,
  PackageX,
} from 'lucide-react'

type SummaryCardsProps = {
  expired: number
  outOfStock: number
  lowStock: number
  expiringWithin14Days: number
}

const cards = [
  {
    key: 'expired' as const,
    label: 'Expired',
    support: 'Remove from inventory immediately',
    action: 'Remove from inventory',
    icon: PackageX,
    accent: 'red' as const,
  },
  {
    key: 'outOfStock' as const,
    label: 'Out of Stock',
    support: 'Products that need immediate reordering',
    action: 'Reorder now',
    icon: AlertCircle,
    accent: 'red' as const,
  },
  {
    key: 'lowStock' as const,
    label: 'Low Stock',
    support: 'Products that may run out soon',
    action: 'Reorder soon',
    icon: PackageMinus,
    accent: 'orange' as const,
  },
  {
    key: 'expiringWithin14Days' as const,
    label: 'Expiring Within 14 Days',
    support: 'Products that should be sold or used soon',
    action: 'Sell or use soon',
    icon: CalendarClock,
    accent: 'orange' as const,
  },
]

const accentStyles = {
  red: {
    number: 'text-brand-danger',
    iconWrap: 'bg-brand-danger-light text-brand-danger',
  },
  orange: {
    number: 'text-brand-orange',
    iconWrap: 'bg-brand-orange-light text-brand-orange',
  },
}

export function SummaryCards(props: SummaryCardsProps) {
  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {cards.map((card) => {
          const Icon = card.icon
          const value = props[card.key]
          const styles = accentStyles[card.accent]

          return (
            <article
              key={card.key}
              className="rounded-2xl border border-brand-border bg-brand-white p-5 shadow-sm"
            >
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
                  <p className="mt-2 text-sm text-brand-muted">{card.support}</p>
                  <p className="mt-1 text-sm font-medium text-brand-text">
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
