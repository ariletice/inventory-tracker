type StockLevelCellProps = {
  quantityInStock: number
  minimumStockThreshold: number
}

function isValidThreshold(threshold: number): boolean {
  return (
    typeof threshold === 'number' &&
    Number.isFinite(threshold) &&
    threshold > 0
  )
}

function barFillClass(displayPercentage: number, quantityInStock: number): string {
  if (quantityInStock === 0 || displayPercentage === 0) return 'bg-red-800'
  if (displayPercentage <= 50) return 'bg-brand-danger'
  if (displayPercentage <= 100) return 'bg-brand-orange'
  if (displayPercentage <= 125) return 'bg-amber-400'
  return 'bg-emerald-600'
}

function percentageTextClass(displayPercentage: number, quantityInStock: number): string {
  if (quantityInStock === 0 || displayPercentage === 0) return 'text-white'
  if (displayPercentage <= 100) return 'text-white'
  if (displayPercentage <= 125) return 'text-brand-navy'
  return 'text-white'
}

export function StockLevelCell({
  quantityInStock,
  minimumStockThreshold,
}: StockLevelCellProps) {
  const quantityLabel = Number.isFinite(quantityInStock)
    ? quantityInStock
    : 'Not provided'

  if (!isValidThreshold(minimumStockThreshold)) {
    return (
      <div className="min-w-[140px]">
        <p className="tabular-nums text-brand-text">
          {quantityLabel} liters/kg
        </p>
        <p className="mt-1 text-xs text-brand-muted">Threshold unavailable</p>
      </div>
    )
  }

  const stockPercentage = (quantityInStock / minimumStockThreshold) * 100
  const displayPercentage = Math.round(stockPercentage)
  const barWidth = Math.min(Math.max(stockPercentage, 0), 100)
  const fillClass = barFillClass(displayPercentage, quantityInStock)
  const textClass = percentageTextClass(displayPercentage, quantityInStock)
  const fillTooNarrow = barWidth < 28

  return (
    <div className="min-w-[150px] max-w-[200px]">
      <p className="tabular-nums text-brand-text">
        {quantityInStock} / {minimumStockThreshold} liters/kg
      </p>
      <div
        className="relative mt-1.5 h-4 w-full overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(Math.max(displayPercentage, 0), 100)}
        aria-label={`Stock level is ${displayPercentage} percent of the minimum threshold`}
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
