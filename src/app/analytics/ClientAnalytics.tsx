'use client'

import { useState, useMemo } from 'react'
import { Shield, Target, Crown, Users, Zap, Trophy, Flame, Coins, HeartPulse } from 'lucide-react'

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

    const [minGames, setMinGames] = useState(3)
    const [seasonFilter, setSeasonFilter] = useState('All')
    const [groupSize, setGroupSize] = useState(3)

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

        // --- POWER RANKINGS (INDIVIDUAL) ---
        const individualStats = activePlayersList.map((player: any) => {
            const playerGames = filteredGames.filter((g: any) => g.GameStats.some((s: any) => s.playerId === player.id));
            const gp = playerGames.length;

            // Raw stats for Golden Boot/Reliability (no min games)
            const ptsScored = playerGames.reduce((sum: number, g: any) => {
                const pStat = g.GameStats.find((s: any) => s.playerId === player.id)
                return sum + (pStat?.points || 0)
            }, 0);

            if (gp < minGames) {
                return {
                    id: player.id,
                    name: player.name,
                    gamesPlayed: gp,
                    ptsScored: ptsScored,
                    meetsMin: false,
                    oRtg: 0, dRtg: 0, netRtg: 0,
                    efficiency: 0, luckyCharm: 0
                }
            }

            const teamPtsScored = playerGames.reduce((sum: number, g: any) => sum + g.teamScore, 0);
            const teamPtsConceded = playerGames.reduce((sum: number, g: any) => sum + g.opponentScore, 0);

            // New Stats Logic
            const efficiency = ptsScored / gp;

            const wins = playerGames.filter((g: any) => g.result === 'W')
            const luckyCharm = (wins.length / gp) * 100

            return {
                id: player.id,
                name: player.name,
                gamesPlayed: gp,
                ptsScored: ptsScored,
                meetsMin: true,
                oRtg: teamPtsScored / gp,
                dRtg: teamPtsConceded / gp,
                netRtg: (teamPtsScored / gp) - (teamPtsConceded / gp),
                efficiency, luckyCharm
            }
        }) as any[]

        const eligible = individualStats.filter(p => p.meetsMin)

        // Rankings
        const spearhead = [...eligible].sort((a, b) => b.oRtg - a.oRtg);
        const wall = [...eligible].sort((a, b) => a.dRtg - b.dRtg);
        const differenceMaker = [...eligible].sort((a, b) => b.netRtg - a.netRtg);

        const efficiency = [...eligible].sort((a, b) => b.efficiency - a.efficiency)
        const reliability = [...individualStats].filter(p => p.gamesPlayed > 0).sort((a, b) => b.gamesPlayed - a.gamesPlayed)
        const luckyCharm = [...eligible].sort((a, b) => b.luckyCharm - a.luckyCharm || b.gamesPlayed - a.gamesPlayed)


        // --- TEAM SYNERGY (COMBINATIONS) ---
        let synergyCore: any[] = []
        let synergyWinners: any[] = []
        let synergyWall: any[] = []

        if (groupSize <= activePlayersList.length) {
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
                const ptsConceded = comboGames.reduce((sum: number, g: any) => sum + g.opponentScore, 0)

                return {
                    id: comboIds.join('-'),
                    comboNames: combo.map((p: any) => p.name).join(', '),
                    gamesPlayed: gp,
                    winPct: (wins / gp) * 100,
                    dRtg: ptsConceded / gp
                }
            }).filter(Boolean) as any[]

            if (comboStats.length > 0) {
                synergyCore = [...comboStats].sort((a, b) => b.gamesPlayed - a.gamesPlayed)
                synergyWinners = [...comboStats].sort((a, b) => b.winPct - a.winPct || b.gamesPlayed - a.gamesPlayed)
                synergyWall = [...comboStats].sort((a, b) => a.dRtg - b.dRtg || b.gamesPlayed - a.gamesPlayed)
            }
        }

        return {
            totalWins, totalGamesPlayed, winPct, oRtg, dRtg, netRtg,
            spearhead, wall, differenceMaker,
            efficiency, reliability, luckyCharm,
            synergyCore, synergyWinners, synergyWall
        }
    }, [games, players, minGames, seasonFilter, groupSize])

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
                    {/* --- GENERAL SEASON SUMMARY --- */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div className="glass-card">
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Offensive Rating</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-primary)' }}>{stats.oRtg.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>PPG</span></div>
                        </div>
                        <div className="glass-card">
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Defensive Rating</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-danger)' }}>{stats.dRtg.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>Cncdd</span></div>
                        </div>
                        <div className="glass-card">
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Net Rating</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: stats.netRtg > 0 ? 'var(--accent-success)' : 'var(--accent-warning)' }}>
                                {stats.netRtg > 0 ? '+' : ''}{stats.netRtg.toFixed(1)}
                            </div>
                        </div>
                        <div className="glass-card">
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Win %</h3>
                            <div style={{ fontSize: '2rem', fontWeight: 700, color: stats.winPct > 50 ? 'var(--accent-success)' : 'var(--text-primary)' }}>
                                {stats.winPct.toFixed(1)}%
                            </div>
                        </div>
                    </div>


                    {/* --- INDIVIDUAL STATS (ROW 1) --- */}
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'var(--accent-primary)' }}>⚡</span> Power Rankings <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>(Individual Impact)</span>
                    </h2>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', height: '350px', marginBottom: '1.5rem' }}>

                        {/* Efficiency */}
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Target size={20} color="var(--accent-primary)" />
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Efficiency</h3>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                Average points scored per game (min {minGames} games).
                            </p>
                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {stats.efficiency.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No players meet the requirement.</div>}
                                {stats.efficiency.map((p, idx) => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={{ fontSize: '0.75rem', width: '20px', textAlign: 'center', color: idx < 3 ? 'var(--accent-warning)' : 'var(--text-muted)', fontWeight: 700 }}>{idx + 1}</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{p.efficiency.toFixed(2)} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>PPG</span></span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Reliability */}
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Shield size={20} color="var(--accent-primary)" />
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Games Attended</h3>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                Total number of games attended.
                            </p>
                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {stats.reliability.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No attendance records found.</div>}
                                {stats.reliability.map((p, idx) => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={{ fontSize: '0.75rem', width: '20px', textAlign: 'center', color: idx < 3 ? 'var(--accent-warning)' : 'var(--text-muted)', fontWeight: 700 }}>{idx + 1}</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{p.gamesPlayed}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Lucky Charm */}
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Crown size={20} color="var(--accent-primary)" />
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Win %</h3>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                % of games won when this player is playing (min {minGames} games).
                            </p>
                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {stats.luckyCharm.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No players meet the requirement.</div>}
                                {stats.luckyCharm.map((p, idx) => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={{ fontSize: '0.75rem', width: '20px', textAlign: 'center', color: idx < 3 ? 'var(--accent-warning)' : 'var(--text-muted)', fontWeight: 700 }}>{idx + 1}</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{p.luckyCharm.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>




                    {/* --- INDIVIDUAL STATS (ROW 3 - Advanced Team Ratings) --- */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', height: '350px', marginBottom: '3rem' }}>

                        {/* The Spearhead */}
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Coins size={20} color="var(--accent-primary)" />
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Offensive Rating</h3>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                Offensive Rating: Average points scored by the team when playing (min {minGames} games).
                            </p>
                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {stats.spearhead.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No players meet the requirement.</div>}
                                {stats.spearhead.map((p, idx) => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={{ fontSize: '0.75rem', width: '20px', textAlign: 'center', color: idx < 3 ? 'var(--accent-warning)' : 'var(--text-muted)', fontWeight: 700 }}>{idx + 1}</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{p.oRtg.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* The Wall */}
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Shield size={20} color="var(--accent-primary)" />
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Defensive Rating</h3>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                Defensive Rating: Average points conceded by the team when playing (min {minGames} games).
                            </p>
                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {stats.wall.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No players meet the requirement.</div>}
                                {stats.wall.map((p, idx) => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={{ fontSize: '0.75rem', width: '20px', textAlign: 'center', color: idx < 3 ? 'var(--accent-warning)' : 'var(--text-muted)', fontWeight: 700 }}>{idx + 1}</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{p.dRtg.toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Difference Maker */}
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <HeartPulse size={20} color="var(--accent-primary)" />
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Net Rating</h3>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                Net Rating: Average point difference when playing (min {minGames} games).
                            </p>
                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {stats.differenceMaker.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No players meet the requirement.</div>}
                                {stats.differenceMaker.map((p, idx) => (
                                    <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                            <span style={{ fontSize: '0.75rem', width: '20px', textAlign: 'center', color: idx < 3 ? 'var(--accent-warning)' : 'var(--text-muted)', fontWeight: 700 }}>{idx + 1}</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.name}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '1rem', color: p.netRtg > 0 ? 'var(--accent-success)' : p.netRtg < 0 ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                                            {p.netRtg > 0 ? '+' : ''}{p.netRtg.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>


                    {/* --- TEAM SYNERGY --- */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <Users color="var(--accent-success)" /> Team Synergy <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>({groupSize === 3 ? 'Trios' : groupSize === 4 ? 'Quartets' : '5s'})</span>
                        </h2>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginRight: '0.5rem' }}>Group Size:</span>
                            {[3, 4, 5].map(size => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => setGroupSize(size)}
                                    style={{
                                        padding: '0.4rem 0.8rem',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        borderRadius: '20px',
                                        border: '1px solid',
                                        borderColor: groupSize === size ? 'var(--accent-success)' : 'rgba(255,255,255,0.1)',
                                        background: groupSize === size ? 'var(--accent-success)' : 'transparent',
                                        color: groupSize === size ? 'black' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {size === 3 ? 'Trios (x3)' : size === 4 ? 'Quartets (x4)' : '5s (x5)'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', height: '350px', marginBottom: '3rem' }}>

                        {/* The Core */}
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Users size={20} color="var(--accent-primary)" />
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>The Core</h3>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                Groups with the most appearances together.
                            </p>

                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {stats.synergyCore.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No groups meet the requirement.</div>}
                                {stats.synergyCore.map((g, idx) => (
                                    <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                                            <span style={{ fontSize: '0.75rem', width: '20px', textAlign: 'center', color: idx < 3 ? 'var(--accent-warning)' : 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>{idx + 1}</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', maxWidth: '200px', lineHeight: '1.3' }}>{g.comboNames}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-primary)', flexShrink: 0 }}>{g.gamesPlayed} Games</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Match Winners */}
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Crown size={20} color="var(--accent-success)" />
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Match Winners</h3>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                Highest Win % (min {minGames} games).
                            </p>

                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {stats.synergyWinners.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No groups meet the requirement.</div>}
                                {stats.synergyWinners.map((g, idx) => (
                                    <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                                            <span style={{ fontSize: '0.75rem', width: '20px', textAlign: 'center', color: idx < 3 ? 'var(--accent-warning)' : 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>{idx + 1}</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', maxWidth: '200px', lineHeight: '1.3' }}>{g.comboNames}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-success)', flexShrink: 0 }}>{g.winPct.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* The Wall */}
                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <Shield size={20} color="var(--accent-danger)" />
                                <h3 style={{ fontSize: '1.1rem', margin: 0 }}>The Wall</h3>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
                                Lowest Avg Points Conceded (min {minGames} games).
                            </p>

                            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                {stats.synergyWall.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No groups meet the requirement.</div>}
                                {stats.synergyWall.map((g, idx) => (
                                    <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.8rem' }}>
                                            <span style={{ fontSize: '0.75rem', width: '20px', textAlign: 'center', color: idx < 3 ? 'var(--accent-warning)' : 'var(--text-muted)', fontWeight: 700, marginTop: '2px' }}>{idx + 1}</span>
                                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)', maxWidth: '200px', lineHeight: '1.3' }}>{g.comboNames}</span>
                                        </div>
                                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-danger)', flexShrink: 0 }}>{g.dRtg.toFixed(2)}</span>
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
