// src/components/StatusBadge.jsx
// One reusable badge for pet, application and verification statuses.

const labels = {
  available: 'Available',
  adopted: 'Adopted',
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  not_submitted: 'Not submitted',
  done: 'Done',
};

export default function StatusBadge({ status }) {
  if (!status) return null;

  return <span className={`status-badge status-${status}`}>{labels[status] || status}</span>;
}
