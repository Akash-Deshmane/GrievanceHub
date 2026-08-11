const STATUS_MAP = {
  pending:      { label: 'Pending',     cls: 'badge-pending' },
  under_review: { label: 'Under Review',cls: 'badge-review' },
  in_progress:  { label: 'In Progress', cls: 'badge-progress' },
  resolved:     { label: 'Resolved',    cls: 'badge-resolved' },
  rejected:     { label: 'Rejected',    cls: 'badge-rejected' },
  closed:       { label: 'Closed',      cls: 'badge-closed' },
  // capitalised variants
  Pending:      { label: 'Pending',     cls: 'badge-pending' },
  'In Progress':{ label: 'In Progress', cls: 'badge-progress' },
  Resolved:     { label: 'Resolved',    cls: 'badge-resolved' },
  Rejected:     { label: 'Rejected',    cls: 'badge-rejected' },
  Closed:       { label: 'Closed',      cls: 'badge-closed' },
};

const PRIORITY_MAP = {
  Low:      'badge-low',
  Medium:   'badge-medium',
  High:     'badge-high',
  Critical: 'badge-critical',
  low:      'badge-low',
  medium:   'badge-medium',
  high:     'badge-high',
  critical: 'badge-critical',
};

export const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || { label: status, cls: 'badge-closed' };
  return <span className={s.cls}>{s.label}</span>;
};

export const PriorityBadge = ({ priority }) => {
  const cls = PRIORITY_MAP[priority] || 'badge-medium';
  return <span className={cls}>{priority}</span>;
};
