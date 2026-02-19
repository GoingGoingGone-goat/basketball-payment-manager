'use client'

import { useState, useMemo } from 'react'

function getCombinations<T>(array: T[], size: number): T[][] {
    const result: T[][] = []
    function recurse(start: number, combo: T[]) {
        if (combo.length === size) {
            result.push([...combo])
            return
        }
        for (let i = start; i < array.length; i++) {
            combo.push(array[i])
            recurse(i + 1, combo)
            combo.pop()
        }
    }
    recurse(0, [])
    return result
}

export default function ClientAnalytics({ initialData }: { initialData: any }) {
    const { games, players, seasons } = initialData

    const [groupSize, setGroupSize] = useState(3)
    const [minGames, setMinGames] = useState(1)
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

        const oRtg = totalPointsScored / totalGamesPlayed
        const dRtg = totalPointsConceded / totalGamesPlayed
        const netRtg = oRtg - dRtg

        const activePlayerIds = new Set<string>()
        filteredGames.forEach((g: any) => {
            g.GameStats.forEach((s: any) => activePlayerIds.add(s.playerId))
        })
        const activePlayersList = players.filter((p: any) => activePlayerIds.has(p.id))

        if (groupSize > activePlayersList.length) {
            return { totalWins, totalGamesPlayed, winPct, oRtg, dRtg, netRtg, mostGames: null, highestWinPct: null, theWall: null }
        }

        const playerCombos = getCombinations(activePlayersList, groupSize)
        const comboStats = playerCombos.map(combo => {
            const comboIds = combo.map((p: any) => p.id)

            const comboGames = filteredGames.filter((g: any) => {
                const gamePlayerIds = new Set(g.GameStats.map((s: any) => s.playerId))
                return comboIds.every(id => gamePlayerIds.has(id))
            })

            const gp = comboGames.length
            if (gp < minGames) return null

            const wins = comboGames.filter((g: any) => g.result === 'W').length
            const ptsScored = comboGames.reduce((sum: number, g: any) => sum + g.teamScore, 0)
            const ptsConceded = comboGames.reduce((sum: number, g: any) => sum + g.opponentScore, 0)

            return {
                comboNames: combo.map((p: any) => p.name).join(', '),
                gamesPlayed: gp,
                winPct: (wins / gp) * 100,
                oRtg: ptsScored / gp,
                dRtg: ptsConceded / gp,
                netRtg: (ptsScored / gp) - (ptsConceded / gp)
            }
        }).filter(Boolean) as any[]

        let mostGames = null, highestWinPct = null, theWall = null
        if (comboStats.length > 0) {
            mostGames = [...comboStats].sort((a, b) => b.gamesPlayed - a.gamesPlayed)[0]
            highestWinPct = [...comboStats].sort((a, b) => b.winPct - a.winPct || b.gamesPlayed - a.gamesPlayed)[0]
            theWall = [...comboStats].sort((a, b) => a.dRtg - b.dRtg || b.gamesPlayed - a.gamesPlayed)[0]
        }

        return { totalWins, totalGamesPlayed, winPct, oRtg, dRtg, netRtg, mostGames, highestWinPct, theWall }
    }, [games, players, groupSize, minGames, seasonFilter])

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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Group Size</label>
                    <select value={groupSize} onChange={e => setGroupSize(Number(e.target.value))} className="input-field" style={{ width: '200px' }}>
                        {[2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Players</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Min Games Played</label>
                    <select value={minGames} onChange={e => setMinGames(Number(e.target.value))} className="input-field" style={{ width: '200px' }}>
                        {[1, 3, 5, 10, 15, 20].map(n => <option key={n} value={n}>{n} Matches</option>)}
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

                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>Group Combinations</h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                        {/* Core */}
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ color: 'var(--accent-secondary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>The Core</div>
                            <h3 style={{ marginBottom: '1rem' }}>Most Games Together</h3>
                            {stats.mostGames ? (
                                <>
                                    <div style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{stats.mostGames.comboNames}</div>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <span><strong>{stats.mostGames.gamesPlayed}</strong> Games</span>
                                        <span><strong>{stats.mostGames.winPct.toFixed(1)}%</strong> Win</span>
                                    </div>
                                </>
                            ) : (
                                <div style={{ color: 'var(--text-muted)' }}>No group meets the requirement.</div>
                            )}
                        </div>

                        {/* Highest Win % */}
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ color: 'var(--accent-success)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>The Winners</div>
                            <h3 style={{ marginBottom: '1rem' }}>Highest Win %</h3>
                            {stats.highestWinPct ? (
                                <>
                                    <div style={{ color: 'var(--accent-success)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{stats.highestWinPct.comboNames}</div>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <span><strong>{stats.highestWinPct.winPct.toFixed(1)}%</strong> Win</span>
                                        <span><strong>{stats.highestWinPct.gamesPlayed}</strong> Games</span>
                                    </div>
                                </>
                            ) : (
                                <div style={{ color: 'var(--text-muted)' }}>No group meets the requirement.</div>
                            )}
                        </div>

                        {/* The Wall */}
                        <div className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.5rem' }}>The Wall</div>
                            <h3 style={{ marginBottom: '1rem' }}>Lowest Pts Conceded</h3>
                            {stats.theWall ? (
                                <>
                                    <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{stats.theWall.comboNames}</div>
                                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                        <span><strong>{stats.theWall.dRtg.toFixed(1)}</strong> DRtg</span>
                                        <span><strong>{stats.theWall.gamesPlayed}</strong> Games</span>
                                    </div>
                                </>
                            ) : (
                                <div style={{ color: 'var(--text-muted)' }}>No group meets the requirement.</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
