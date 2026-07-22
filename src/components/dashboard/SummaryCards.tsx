import {
  AlertTriangle,
  Clock3,
  PackageMinus,
  CalendarClock,
} from 'lucide-react'

type SummaryCardsProps = {
  needsAttention: number
  nextInQueue: number
  lowStock: number
  expiringSoon: number
}

const cards = [
  {
    key: 'needsAttention' as const,
    label: 'Needs Attention Today',
    icon: AlertTriangle,
    accent: 'orange' as const,
  },
  {
    key: 'nextInQueue' as const,
    label: 'Next in Queue',
    icon: Clock3,
    accent: 'blue' as const,
  },
  {
    key: 'lowStock' as const,
    label: 'Low-Stock Products',
    icon: PackageMinus,
    accent: 'orange' as const,
  },
  {
    key: 'expiringSoon' as const,
    label: 'Expiring Within 14 Days',
    icon: CalendarClock,
    accent: 'blue' as const,
  },
]

export function SummaryCards(props: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        const value = props[card.key]
        const isOrange = card.accent === 'orange'

        return (
          <article
            key={card.key}
            className="rounded-2xl border border-brand-border bg-brand-white p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-brand-muted">
                  {card.label}
                </p>
                <p
                  className={`mt-2 text-3xl font-semibold tracking-tight ${
                    isOrange ? 'text-brand-orange' : 'text-brand-blue'
                  }`}
                >
                  {value}
                </p>
              </div>
              <div
                className={`rounded-xl p-2.5 ${
                  isOrange
                    ? 'bg-brand-orange-light text-brand-orange'
                    : 'bg-brand-blue-light text-brand-blue'
                }`}
                aria-hidden
              >
                <Icon className="h-5 w-5" />
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}
