'use client'

import { useState } from 'react'
import Link from 'next/link'

export function ClientStatsTable({ playerStats }: { playerStats: any[] }) {
    const [showAdvanced, setShowAdvanced] = useState(false)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '12px', border: '1px solid var(--panel-border)', userSelect: 'none' }}>
                    <input type="checkbox" checked={showAdvanced} onChange={(e) => setShowAdvanced(e.target.checked)} style={{ display: 'none' }} />
                    <span style={{ fontSize: '0.9rem', color: showAdvanced ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: 600 }}>Advanced Stats</span>
                    <div style={{
                        position: 'relative', width: '40px', height: '22px', background: showAdvanced ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)', borderRadius: '11px', transition: 'background 0.3s'
                    }}>
                        <div style={{
                            position: 'absolute', top: '2px', left: showAdvanced ? '20px' : '2px', width: '18px', height: '18px', background: '#fff', borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }} />
                    </div>
                </label>
            </div>

            <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Player</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Games Played</th>
                            <th style={{ padding: '1rem', color: 'var(--accent-primary)' }}>PPG</th>
                            <th style={{ padding: '1rem', color: 'var(--accent-danger)' }}>Fouls/G</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Win %</th>
                            {showAdvanced && (
                                <>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Total Pts</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Off Rtg</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Def Rtg</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Net Rtg</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Cons. Idx</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>1PT%</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>2PT%</th>
                                    <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>3PT%</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {playerStats.length === 0 ? (
                            <tr><td colSpan={showAdvanced ? 12 : 5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No player stats available</td></tr>
                        ) : null}
                        {playerStats.map((stat: any) => (
                            <tr key={stat.player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="hover:bg-[rgba(255,255,255,0.02)]">
                                <td style={{ padding: '1rem', fontWeight: 600 }}>
                                    <Link href={`/players/${stat.player.id}`} style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationColor: 'rgba(255,255,255,0.2)' }}>
                                        {stat.player.name}
                                    </Link>
                                </td>
                                <td style={{ padding: '1rem' }}>{stat.gamesPlayed}</td>
                                <td style={{ padding: '1rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                                    {stat.ppg.toFixed(1)}
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--accent-danger)' }}>
                                    {stat.gamesPlayed > 0 ? (stat.totalFouls / stat.gamesPlayed).toFixed(1) : '0.0'}
                                </td>
                                <td style={{ padding: '1rem', color: stat.winPct > 50 ? 'var(--accent-success)' : stat.winPct < 40 ? 'var(--accent-danger)' : 'inherit' }}>
                                    {stat.winPct.toFixed(1)}%
                                </td>
                                {showAdvanced && (
                                    <>
                                        <td style={{ padding: '1rem' }}>{stat.totalPoints}</td>
                                        <td style={{ padding: '1rem' }}>{stat.oRtg.toFixed(1)}</td>
                                        <td style={{ padding: '1rem' }}>{stat.dRtg.toFixed(1)}</td>
                                        <td style={{ padding: '1rem', color: stat.netRtg > 0 ? 'var(--accent-success)' : stat.netRtg < 0 ? 'var(--accent-danger)' : 'inherit', fontWeight: 600 }}>
                                            {stat.netRtg > 0 ? '+' : ''}{stat.netRtg.toFixed(1)}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 700, color: Number(stat.consistencyIndex) >= 0.8 ? 'var(--accent-success)' : Number(stat.consistencyIndex) >= 0.6 ? 'var(--accent-warning)' : 'inherit' }}>
                                            {stat.consistencyIndex}
                                        </td>
                                        <td style={{ padding: '1rem' }}>{stat.onesPct.toFixed(1)}%</td>
                                        <td style={{ padding: '1rem' }}>{stat.twosPct.toFixed(1)}%</td>
                                        <td style={{ padding: '1rem' }}>{stat.threesPct.toFixed(1)}%</td>
                                    </>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
