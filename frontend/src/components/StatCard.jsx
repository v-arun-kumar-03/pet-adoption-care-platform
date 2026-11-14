// src/components/StatCard.jsx
// Simple number card used on dashboards.
export default function StatCard({ icon, label, value, note, tone = 'teal' }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon" aria-hidden="true">
        {icon}
      </div>
      <div>
        <p className="stat-label">{label}</p>
        <p className="stat-value">{value}</p>
        {note && <p className="stat-note">{note}</p>}
      </div>
    </div>
  );
}
