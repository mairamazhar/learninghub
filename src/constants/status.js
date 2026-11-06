// Single source of truth for student statuses (labels + colours)
export const STATUS_META = {
  active: { label: 'Active', color: '#16a34a' },
  graduated: { label: 'Graduated', color: '#2563eb' },
  probation: { label: 'On probation', color: '#dc2626' },
}

export const getStatusLabel = (status) => STATUS_META[status]?.label ?? status
