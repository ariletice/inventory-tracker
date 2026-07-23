import {
  AlertCircle,
  CalendarClock,
  Package,
  PackageMinus,
} from 'lucide-react'

type SummaryCardsProps = {
  productsUploaded: number
  outOfStock: number
  belowReorderThreshold: number
  expiringWithin14Days: number
}

const cards = [
  {
    key: 'productsUploaded' as const,
    label: 'Products Uploaded',
    support: 'Successfully analyzed from the latest file',
    icon: Package,
    accent: 'blue' as const,
  },
  {
    key: 'outOfStock' as const,
    label: 'Out of Stock',
    support: 'Products with zero quantity on hand',
    icon: AlertCircle,
    accent: 'red' as const,
  },
  {
    key: 'belowReorderThreshold' as const,
    label: 'Below Reorder Threshold',
    support: 'Products that may need to be reordered',
    icon: PackageMinus,
    accent: 'orange' as const,
  },
  {
    key: 'expiringWithin14Days' as const,
    label: 'Expiring Within 14 Days',
    support: 'Products approaching their expiration date',
    icon: CalendarClock,
    accent: 'orange' as const,
  },
]

const accentStyles = {
  blue: {
    number: 'text-brand-blue',
    iconWrap: 'bg-brand-blue-light text-brand-blue',
  },
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
