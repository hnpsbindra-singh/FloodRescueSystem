import React from 'react'

const ALERTS = [
  'FLOOD RESCUE SYSTEM - EMERGENCY OPERATIONS ACTIVE',
  'REAL-TIME MONITORING ENABLED',
  'CRITICAL ZONES UNDER SURVEILLANCE',
  'NGO COORDINATION IN PROGRESS',
  'REPORT FLOOD INCIDENTS IMMEDIATELY',
]

export default function EmergencyTicker() {
  const text = ALERTS.join('    /    ')
  return (
    <div className="emergency-ticker">
      <div className="emergency-ticker__track">
        {text}{'    /    '}{text}
      </div>
    </div>
  )
}
