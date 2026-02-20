'use client'

import { useState } from 'react'
import { logGame } from '@/actions/games'
import { useRouter } from 'next/navigation'

export default function GameForm({ players, pastOpponents = [] }: { players: any[], pastOpponents?: string[] }) {
    const router = useRouter()
    const [opponent, setOpponent] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [teamScore, setTeamScore] = useState('')
    const [opponentScore, setOpponentScore] = useState('')
    const [season, setSeason] = useState('Autumn 2026')
    const [rawPaste, setRawPaste] = useState('')

    // Auto calculate result
    const tScore = parseInt(teamScore) || 0;
    const oScore = parseInt(opponentScore) || 0;
    const result = tScore > oScore ? 'W' : tScore < oScore ? 'L' : 'D';

    const [selectedPlayers, setSelectedPlayers] = useState<Record<string, { played: boolean, ones: string, twos: string, threes: string, fouls: string }>>({})

    const handleTogglePlayer = (id: string) => {
        setSelectedPlayers(prev => ({
            ...prev,
            [id]: { played: !prev[id]?.played, ones: prev[id]?.ones || '0', twos: prev[id]?.twos || '0', threes: prev[id]?.threes || '0', fouls: prev[id]?.fouls || '0' }
        }))
    }

    const handleStatChange = (id: string, field: 'ones' | 'twos' | 'threes' | 'fouls', val: string) => {
        setSelectedPlayers(prev => ({
            ...prev,
            [id]: { ...prev[id], played: true, [field]: val }
        }))
    }

    const handleParsePaste = () => {
        const lines = rawPaste.split('\n').map(l => l.trim()).filter(l => l)
        let updatedPlayers = { ...selectedPlayers }

        for (let i = 0; i < lines.length - 2; i++) {
            const jersey = parseInt(lines[i])
            if (!isNaN(jersey)) {
                const name = lines[i + 1]
                const statsLine = lines[i + 2]
                const stats = statsLine.split(/\s+/)

                if (stats.length >= 5) {
                    const [_totalPts, ones, twos, threes, fouls] = stats

                    const p = players.find((p: any) => p.jerseyNumber === jersey || p.name.toLowerCase() === name.toLowerCase())
                    if (p) {
                        updatedPlayers[p.id] = { played: true, ones, twos, threes, fouls }
                    }
                }
            }
        }
        setSelectedPlayers(updatedPlayers)
        setRawPaste('') // clear after parse
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const playerStats = Object.entries(selectedPlayers)
            .filter(([_, data]) => data.played)
            .map(([id, data]) => {
                const ones = parseInt(data.ones) || 0;
                const twos = parseInt(data.twos) || 0;
                const threes = parseInt(data.threes) || 0;
                const fouls = parseInt(data.fouls) || 0;
                const points = (ones * 1) + (twos * 2) + (threes * 3);

                return { playerId: id, points, ones, twos, threes, fouls }
            })

        await logGame({
            opponent,
            date: new Date(date),
            teamScore: parseInt(teamScore),
            opponentScore: parseInt(opponentScore),
            result,
            season,
            playerStats
        })

        router.push('/')
    }

    return (
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Opponent Team</label>
                    <input type="text" list="opponents-list" value={opponent} onChange={e => setOpponent(e.target.value)} required className="input-field" placeholder="e.g. Tropics" />
                    <datalist id="opponents-list">
                        {pastOpponents.map(opp => <option key={opp} value={opp} />)}
                    </datalist>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="input-field" />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Season</label>
                    <select value={season} onChange={e => setSeason(e.target.value)} required className="input-field">
                        <option value="">Select Season</option>
                        <option value="Autumn 2025">Autumn 2025</option>
                        <option value="Spring 2025">Spring 2025</option>
                        <option value="Autumn 2026">Autumn 2026</option>
                    </select>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Our Score</label>
                    <input type="number" value={teamScore} onChange={e => setTeamScore(e.target.value)} required className="input-field" />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Opponent Score</label>
                    <input type="number" value={opponentScore} onChange={e => setOpponentScore(e.target.value)} required className="input-field" />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Result (Auto)</label>
                    <div className="input-field" style={{ background: 'rgba(255,255,255,0.02)', fontWeight: 700, color: result === 'W' ? 'var(--accent-success)' : result === 'L' ? 'var(--accent-danger)' : 'var(--text-primary)' }}>
                        {result === 'W' ? 'Win (W)' : result === 'L' ? 'Loss (L)' : 'Draw (D)'}
                    </div>
                </div>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: 'var(--radius-md)', marginBottom: '2.5rem', border: '1px dashed var(--panel-border)' }}>
                <h4 style={{ marginBottom: '1rem', color: 'var(--accent-primary)', fontSize: '1.1rem' }}>Smart Paste: PlayHQ Stats</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Toggle 'Show advanced stats' on. Highlight and copy the rows from the "Player Statistics" table on PlayHQ and paste them below.</p>
                <textarea
                    value={rawPaste}
                    onChange={e => setRawPaste(e.target.value)}
                    className="input-field"
                    style={{ minHeight: '100px', marginBottom: '1rem', resize: 'vertical' }}
                    placeholder="Paste stats here..."
                />
                <button type="button" onClick={handleParsePaste} className="btn" style={{ background: 'var(--accent-primary)', color: 'black', fontWeight: 600 }}>Parse & Populate Roster</button>
            </div>

            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Player Stats (Roster)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '2.5rem' }}>
                {players.map(p => {
                    const isPlayed = selectedPlayers[p.id]?.played || false;
                    const sp = selectedPlayers[p.id] || { ones: '0', twos: '0', threes: '0', fouls: '0' };
                    // calculate auto points just for UI display feedback
                    const uiPoints = (parseInt(sp.ones) || 0) * 1 + (parseInt(sp.twos) || 0) * 2 + (parseInt(sp.threes) || 0) * 3;

                    return (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: isPlayed ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.2)', border: isPlayed ? '1px solid var(--accent-primary)' : '1px solid transparent', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s', flexWrap: 'wrap' }}>
                            <input type="checkbox" checked={isPlayed} onChange={() => handleTogglePlayer(p.id)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                            <span style={{ minWidth: '150px', fontWeight: isPlayed ? 600 : 400, color: isPlayed ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                                {p.jerseyNumber ? `#${p.jerseyNumber} ` : ''}{p.name}
                            </span>

                            {isPlayed && (
                                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>1pts</label>
                                        <input type="number" value={sp.ones} onChange={e => handleStatChange(p.id, 'ones', e.target.value)} className="input-field" style={{ width: '60px', padding: '0.4rem', border: '1px solid var(--panel-border)' }} min="0" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>2pts</label>
                                        <input type="number" value={sp.twos} onChange={e => handleStatChange(p.id, 'twos', e.target.value)} className="input-field" style={{ width: '60px', padding: '0.4rem', border: '1px solid var(--panel-border)' }} min="0" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>3pts</label>
                                        <input type="number" value={sp.threes} onChange={e => handleStatChange(p.id, 'threes', e.target.value)} className="input-field" style={{ width: '60px', padding: '0.4rem', border: '1px solid var(--panel-border)' }} min="0" />
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', marginLeft: '1rem' }}>
                                        <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Fouls</label>
                                        <input type="number" value={sp.fouls} onChange={e => handleStatChange(p.id, 'fouls', e.target.value)} className="input-field" style={{ width: '60px', padding: '0.4rem', border: '1px solid var(--accent-danger)' }} min="0" />
                                    </div>
                                    <div style={{ marginLeft: 'auto', fontWeight: 700, color: 'var(--accent-primary)', fontSize: '1.2rem' }}>
                                        {uiPoints} PTS
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>Save Game & Stats</button>
        </form>
    )
}
