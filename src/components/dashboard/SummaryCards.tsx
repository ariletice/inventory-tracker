import {
  AlertTriangle,
  Clock3,
  Package,
  CheckCircle2,
} from 'lucide-react'

type SummaryCardsProps = {
  totalProducts: number
  needsAttention: number
  nextInQueue: number
  noAction: number
}

const cards = [
  {
    key: 'totalProducts' as const,
    label: 'Total Products',
    icon: Package,
    accent: 'blue' as const,
  },
  {
    key: 'needsAttention' as const,
    label: 'Needs Attention',
    icon: AlertTriangle,
    accent: 'orange' as const,
  },
  {
    key: 'nextInQueue' as const,
    label: 'Coming Up Next',
    icon: Clock3,
    accent: 'blue' as const,
  },
  {
    key: 'noAction' as const,
    label: 'Currently Stable',
    icon: CheckCircle2,
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
