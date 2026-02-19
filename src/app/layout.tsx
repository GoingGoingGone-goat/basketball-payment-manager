import type { Metadata } from 'next'
import Link from 'next/link'
import { LayoutDashboard, Users, Trophy, BarChart3, Wallet, Swords } from 'lucide-react'
import './globals.css'

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'CourtCash | Basketball Manager',
  description: 'Premium basketball team and finance manager',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="layout-container">
          <aside className="sidebar">
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 className="title-gradient" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.8rem' }}>🏀</span> CourtCash
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>Team MVP Manager</p>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <Link href="/" className="nav-link">
                <LayoutDashboard size={20} />
                Dashboard
              </Link>
              <Link href="/opponents" className="nav-link">
                <Swords size={20} />
                Opponents
              </Link>
              <Link href="/stats" className="nav-link">
                <Trophy size={20} />
                Player Stats
              </Link>
              <Link href="/analytics" className="nav-link">
                <BarChart3 size={20} />
                Analytics
              </Link>
              <Link href="/finances" className="nav-link">
                <Wallet size={20} />
                Finances & Fees
              </Link>
              <div style={{ height: '1px', background: 'var(--panel-border)', margin: '1rem 0' }} />
              <Link href="/players" className="nav-link">
                <Users size={20} />
                Manage Roster
              </Link>
            </nav>

            <div style={{ marginTop: 'auto', paddingTop: '2rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              &copy; {new Date().getFullYear()} Team MVP
            </div>
          </aside>

          <main className="main-content animate-fade-in">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
