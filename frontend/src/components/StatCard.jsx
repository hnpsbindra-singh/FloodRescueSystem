import React from 'react'

export default function StatCard({ label, value, icon, color = 'var(--green)', sublabel }) {
  return (
    <div className="card stat-card">
      <div className="stat-card__inner">
        <div>
          <div className="stat-card__label">
            {label}
          </div>
          <div className="stat-card__value" style={{ color }}>
            {value ?? <span className="spinner" />}
          </div>
          {sublabel && <div className="stat-card__sublabel">{sublabel}</div>}
        </div>
        <div className="stat-card__icon" style={{ color }}>{icon}</div>
      </div>
    </div>
  )
}
