'use client'

import { useState, useMemo } from 'react'
import { Shield, Target, Crown } from 'lucide-react'

export default function ClientAnalytics({ initialData }: { initialData: any }) {
    const { games, players, seasons } = initialData

    const [minGames, setMinGames] = useState(3)
    const [seasonFilter, setSeasonFilter] = useState('All')

    const stats = useMemo(() => {
        const filteredGames = seasonFilter === 'All'
            ? games
            : games.filter((g: any) => g.season === seasonFilter)

        if (filteredGames.length === 0) return null

        const totalWins = filteredGames.filter((g: any) => g.result === 'W').length
        const totalGamesPlayed = filteredGames.length
        const winPct = (totalWins / totalGamesPlayed) * 100

        const totalPointsScored = filteredGames.reduce((sum: number, g: any) => sum + g.teamScore, 0)
        const totalPointsConceded = filteredGames.reduce((sum: number, g: any) => sum + g.opponentScore, 0)

        const oRtg = totalGamesPlayed > 0 ? totalPointsScored / totalGamesPlayed : 0
        const dRtg = totalGamesPlayed > 0 ? totalPointsConceded / totalGamesPlayed : 0
        const netRtg = oRtg - dRtg

        const activePlayerIds = new Set<string>()
        filteredGames.forEach((g: any) => {
            g.GameStats.forEach((s: any) => activePlayerIds.add(s.playerId))
        })
        const activePlayersList = players.filter((p: any) => activePlayerIds.has(p.id))

        const individualStats = activePlayersList.map((player: any) => {
            const playerGames = filteredGames.filter((g: any) => g.GameStats.some((s: any) => s.playerId === player.id));
            const gp = playerGames.length;
            if (gp < minGames) return null;

            const ptsScored = playerGames.reduce((sum: number, g: any) => sum + g.teamScore, 0);
            const ptsConceded = playerGames.reduce((sum: number, g: any) => sum + g.opponentScore, 0);

            return {
                id: player.id,
                name: player.name,
                gamesPlayed: gp,
                oRtg: ptsScored / gp,
                dRtg: ptsConceded / gp,
                netRtg: (ptsScored / gp) - (ptsConceded / gp)
            }
        }).filter(Boolean) as any[]

        const spearhead = [...individualStats].sort((a, b) => b.oRtg - a.oRtg);
        const wall = [...individualStats].sort((a, b) => a.dRtg - b.dRtg);
        const differenceMaker = [...individualStats].sort((a, b) => b.netRtg - a.netRtg);

        return { totalWins, totalGamesPlayed, winPct, oRtg, dRtg, netRtg, spearhead, wall, differenceMaker }
    }, [games, players, minGames, seasonFilter])

    return (
        <div>
            <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Season Filter</label>
                    <select value={seasonFilter} onChange={e => setSeasonFilter(e.target.value)} className="input-field" style={{ width: '200px' }}>
                        <option value="All">All Seasons</option>
                        {seasons.map((s: string) => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Min Games Played</label>
                    <select value={minGames} onChange={e => setMinGames(Number(e.target.value))} className="input-field" style={{ width: '200px' }}>
                        {[1, 2, 3, 5, 10, 15].map(n => <option key={n} value={n}>{n} Matches</option>)}
                    </select>
                </div>
            </div>

            {!stats ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem' }}>No games match the selected filters.</div>
            ) : (
                <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div className="glass-card">
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Offensive Rating (PPG)</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{stats.oRtg.toFixed(1)}</div>
                        </div>
                        <div className="glass-card">
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Defensive Rating (Conceded)</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-danger)' }}>{stats.dRtg.toFixed(1)}</div>
                        </div>
                        <div className="glass-card">
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Net Rating</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: stats.netRtg > 0 ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                                {stats.netRtg > 0 ? '+' : ''}{stats.netRtg.toFixed(1)}
                            </div>
                        </div>
                        <div className="glass-card">
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Win %</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: stats.winPct > 50 ? 'var(--accent-success)' : 'inherit' }}>
                                {stats.winPct.toFixed(1)}%
                            </div>
                        </div>
                    </div>

                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--accent-warning)' }}>⚡</span> Power Rankings <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Individual Impact)</span>
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', height: '500px' }}>
                        {/* The Spearhead */}
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Target size={20} color="var(--accent-primary)" />
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>The Spearhead</h3>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                Offensive Rating: Average points scored by the team when this player is playing (Higher is better, min {minGames} games).
                            </p>

                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {stats.spearhead.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No players meet the minimum games requirement.</div>}
                                {stats.spearhead.map((p, idx) => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={{ fontSize: '0.8rem', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: idx === 0 || idx === 1 || idx === 2 ? 'rgba(245, 158, 11, 0.2)' : 'transparent', color: idx === 0 || idx === 1 || idx === 2 ? 'var(--accent-warning)' : 'var(--text-muted)', borderRadius: '50%', fontWeight: 700 }}>
                                                {idx + 1}
                                            </span>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{p.oRtg.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* The Wall */}
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Shield size={20} color="var(--accent-primary)" />
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>The Individual Wall</h3>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                Defensive Rating: Average points conceded by the team when this player is playing (Lower is better, min {minGames} games).
                            </p>

                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {stats.wall.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No players meet the minimum games requirement.</div>}
                                {stats.wall.map((p, idx) => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={{ fontSize: '0.8rem', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: idx === 0 || idx === 1 || idx === 2 ? 'rgba(245, 158, 11, 0.2)' : 'transparent', color: idx === 0 || idx === 1 || idx === 2 ? 'var(--accent-warning)' : 'var(--text-muted)', borderRadius: '50%', fontWeight: 700 }}>
                                                {idx + 1}
                                            </span>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>{p.dRtg.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Difference Maker */}
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Crown size={20} color="var(--accent-primary)" />
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>The Difference Maker</h3>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                Net Rating: Average point difference when this player is playing (Higher is better, min {minGames} games).
                            </p>

                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {stats.differenceMaker.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No players meet the minimum games requirement.</div>}
                                {stats.differenceMaker.map((p, idx) => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={{ fontSize: '0.8rem', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: idx === 0 || idx === 1 || idx === 2 ? 'rgba(245, 158, 11, 0.2)' : 'transparent', color: idx === 0 || idx === 1 || idx === 2 ? 'var(--accent-warning)' : 'var(--text-muted)', borderRadius: '50%', fontWeight: 700 }}>
                                                {idx + 1}
                                            </span>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: p.netRtg > 0 ? 'var(--accent-success)' : p.netRtg < 0 ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                                            {p.netRtg > 0 ? '+' : ''}{p.netRtg.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </>
            )}
        </div>
    )
}
