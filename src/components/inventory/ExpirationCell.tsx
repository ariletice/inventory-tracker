type ExpirationCellProps = {
  expirationDate: string
  daysUntilExpiry: number
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00')
  if (Number.isNaN(d.getTime())) return 'Not provided'
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function urgencyPresentation(daysUntilExpiry: number): {
  label: string
  className: string
} | null {
  if (!Number.isFinite(daysUntilExpiry)) return null

  if (daysUntilExpiry < 0) {
    return {
      label: `Expired ${Math.abs(daysUntilExpiry)}d ago`,
      className: 'text-brand-danger',
    }
  }

  if (daysUntilExpiry <= 7) {
    return {
      label: `${daysUntilExpiry}d left`,
      className: 'text-brand-orange',
    }
  }

  if (daysUntilExpiry <= 30) {
    return {
      label: `${daysUntilExpiry}d left`,
      className: 'text-brand-warning',
    }
  }

  return {
    label: `${daysUntilExpiry}d left`,
    className: 'text-brand-success',
  }
}

export function ExpirationCell({
  expirationDate,
  daysUntilExpiry,
}: ExpirationCellProps) {
  const dateLabel = formatDate(expirationDate)
  const urgency = urgencyPresentation(daysUntilExpiry)

  return (
    <div className="leading-tight">
      <div className="text-brand-muted">{dateLabel}</div>
      {urgency && (
        <div className={`text-xs font-medium ${urgency.className}`}>
          {urgency.label}
        </div>
      )}
    </div>
  )
}
