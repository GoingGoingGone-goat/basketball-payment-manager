import type { Metadata } from 'next'
import Link from 'next/link'
import { Sidebar } from './Sidebar'
import './globals.css'

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Basketball Payment Manager',
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
          <Sidebar />

          <main className="main-content animate-fade-in">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
