import type { StatusLabel } from '../../types/inventory'

type StockLevelCellProps = {
  quantityInStock: number
  minimumStockThreshold: number
  statuses?: StatusLabel[]
}

function isValidThreshold(threshold: number): boolean {
  return (
    typeof threshold === 'number' &&
    Number.isFinite(threshold) &&
    threshold > 0
  )
}

function stockLadderFill(
  displayPercentage: number,
  quantityInStock: number,
): string {
  if (quantityInStock === 0 || displayPercentage === 0) {
    return 'bg-brand-danger'
  }
  if (displayPercentage <= 50) return 'bg-brand-danger'
  if (displayPercentage <= 100) return 'bg-brand-orange'
  if (displayPercentage <= 125) return 'bg-brand-warning'
  return 'bg-brand-success'
}

function barFillClass(
  displayPercentage: number,
  quantityInStock: number,
  isExpired: boolean,
  isExpiringSoon: boolean,
): string {
  if (isExpired) {
    if (quantityInStock === 0 || displayPercentage === 0) {
      return 'bg-brand-danger'
    }
    return 'bg-brand-danger/80'
  }

  if (isExpiringSoon && displayPercentage > 100) {
    return 'bg-brand-warning'
  }

  return stockLadderFill(displayPercentage, quantityInStock)
}

function percentageTextClass(
  displayPercentage: number,
  quantityInStock: number,
  isExpired: boolean,
  isExpiringSoon: boolean,
): string {
  if (isExpired) return 'text-white'
  if (isExpiringSoon && displayPercentage > 100) return 'text-brand-navy'
  if (quantityInStock === 0 || displayPercentage === 0) return 'text-white'
  if (displayPercentage <= 100) return 'text-white'
  if (displayPercentage <= 125) return 'text-brand-navy'
  return 'text-white'
}

function urgencyAriaSuffix(
  isExpired: boolean,
  isExpiringSoon: boolean,
): string {
  if (isExpired) return '; product is expired'
  if (isExpiringSoon) return '; product is expiring soon'
  return ''
}

export function StockLevelCell({
  quantityInStock,
  minimumStockThreshold,
  statuses = [],
}: StockLevelCellProps) {
  const quantityLabel = Number.isFinite(quantityInStock)
    ? quantityInStock
    : 'Not provided'
  const isExpired = statuses.includes('Expired')
  const isExpiringSoon =
    !isExpired && statuses.includes('Expiring Soon')

  if (!isValidThreshold(minimumStockThreshold)) {
    return (
      <div className="min-w-[120px]">
        <p className="tabular-nums text-brand-text">{quantityLabel}</p>
        <p className="mt-1 text-xs text-brand-muted">Threshold unavailable</p>
      </div>
    )
  }

  const stockPercentage = (quantityInStock / minimumStockThreshold) * 100
  const displayPercentage = Math.round(stockPercentage)
  const barWidth = Math.min(Math.max(stockPercentage, 0), 100)
  const fillClass = barFillClass(
    displayPercentage,
    quantityInStock,
    isExpired,
    isExpiringSoon,
  )
  const textClass = percentageTextClass(
    displayPercentage,
    quantityInStock,
    isExpired,
    isExpiringSoon,
  )
  const fillTooNarrow = barWidth < 28

  return (
    <div className="min-w-[140px] max-w-[180px]">
      <p className="tabular-nums text-brand-text">
        {quantityInStock} / {minimumStockThreshold}
      </p>
      <div
        className="relative mt-1.5 h-5 w-full overflow-hidden rounded-full bg-brand-surface-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(Math.max(displayPercentage, 0), 100)}
        aria-label={`Stock level is ${displayPercentage} percent of the minimum threshold${urgencyAriaSuffix(isExpired, isExpiringSoon)}`}
      >
        <div
          className={`absolute inset-y-0 left-0 ${fillClass}`}
          style={{ width: `${barWidth}%` }}
        />
        <span
          className={`absolute inset-0 flex items-center justify-center text-[10px] font-bold leading-none ${
            fillTooNarrow ? 'text-brand-navy' : textClass
          }`}
        >
          {displayPercentage}%
        </span>
      </div>
    </div>
  )
}
