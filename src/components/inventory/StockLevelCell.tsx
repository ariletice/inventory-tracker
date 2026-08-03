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

function formatAmount(value: number): string {
  if (!Number.isFinite(value)) return 'Not provided'
  return `${value} L/kg`
}

/**
 * Bar fill vs minimum only:
 * - below minimum → progress toward minimum (capped at 100%)
 * - at/above minimum → full bar
 * Never overflow; never encode urgency via color.
 */
function fillTowardMinimum(
  quantityInStock: number,
  minimumStockThreshold: number,
): number {
  if (quantityInStock <= 0) return 0
  if (quantityInStock >= minimumStockThreshold) return 100
  return Math.min(
    100,
    (quantityInStock / minimumStockThreshold) * 100,
  )
}

export function StockLevelCell({
  quantityInStock,
  minimumStockThreshold,
}: StockLevelCellProps) {
  if (!isValidThreshold(minimumStockThreshold)) {
    return (
      <div className="min-w-[120px]">
        <p className="tabular-nums text-sm font-semibold text-brand-text">
          {formatAmount(quantityInStock)}
        </p>
        <p className="mt-1 text-xs text-brand-muted">Threshold unavailable</p>
      </div>
    )
  }

  const barWidth = fillTowardMinimum(
    quantityInStock,
    minimumStockThreshold,
  )
  const meetsMinimum = quantityInStock >= minimumStockThreshold
  const ariaLabel = meetsMinimum
    ? `Current inventory ${quantityInStock} L/kg meets the minimum of ${minimumStockThreshold} L/kg`
    : `Current inventory ${quantityInStock} L/kg is below the minimum of ${minimumStockThreshold} L/kg`

  return (
    <div className="min-w-[140px] max-w-[180px]">
      <p className="tabular-nums text-sm font-semibold leading-tight text-brand-text">
        {formatAmount(quantityInStock)}
      </p>
      <div
        className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-brand-surface-muted"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(barWidth)}
        aria-label={ariaLabel}
      >
        <div
          className="h-full rounded-full bg-brand-muted/55"
          style={{ width: `${barWidth}%` }}
        />
      </div>
      <p className="mt-1 tabular-nums text-[11px] leading-tight text-brand-muted">
        {minimumStockThreshold} L/kg minimum
      </p>
    </div>
  )
}
