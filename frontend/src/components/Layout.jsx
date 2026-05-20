import React from 'react'
import Sidebar from './Sidebar'
import EmergencyTicker from './EmergencyTicker'

export default function Layout({ children }) {
  return (
    <>
      <EmergencyTicker />
      <div className="page-wrapper" style={{ paddingTop: '28px' }}>
        <Sidebar />
        <main className="main-content">
          {children}
        </main>
      </div>
    </>
  )
}
