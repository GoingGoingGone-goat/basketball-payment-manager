'use client'

import { useState } from 'react'
import { logGame } from '@/actions/games'
import { useRouter } from 'next/navigation'

export default function GameForm({ players }: { players: any[] }) {
    const router = useRouter()
    const [opponent, setOpponent] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [teamScore, setTeamScore] = useState('')
    const [opponentScore, setOpponentScore] = useState('')
    const [result, setResult] = useState('W')
    const [season, setSeason] = useState('')

    const [selectedPlayers, setSelectedPlayers] = useState<Record<string, { played: boolean, points: string }>>({})

    const handleTogglePlayer = (id: string) => {
        setSelectedPlayers(prev => ({
            ...prev,
            [id]: { played: !prev[id]?.played, points: prev[id]?.points || '0' }
        }))
    }

    const handlePointsChange = (id: string, val: string) => {
        setSelectedPlayers(prev => ({
            ...prev,
            [id]: { ...prev[id], played: true, points: val }
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const playerStats = Object.entries(selectedPlayers)
            .filter(([_, data]) => data.played)
            .map(([id, data]) => ({ playerId: id, points: parseInt(data.points) || 0 }))

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
        <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '2rem', maxWidth: '800px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Opponent Team</label>
                    <input type="text" value={opponent} onChange={e => setOpponent(e.target.value)} required className="input-field" placeholder="e.g. Tropics" />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Date</label>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="input-field" />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Season</label>
                    <input type="text" value={season} onChange={e => setSeason(e.target.value)} required className="input-field" placeholder="e.g. Summer 2024" />
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
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Result</label>
                    <select value={result} onChange={e => setResult(e.target.value)} className="input-field">
                        <option value="W">Win (W)</option>
                        <option value="L">Loss (L)</option>
                        <option value="D">Draw (D)</option>
                    </select>
                </div>
            </div>

            <h3 style={{ marginBottom: '1rem', color: 'var(--accent-primary)' }}>Player Stats (Roster)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
                {players.map(p => {
                    const isPlayed = selectedPlayers[p.id]?.played || false;
                    return (
                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: isPlayed ? 'rgba(59, 130, 246, 0.1)' : 'rgba(0,0,0,0.2)', border: isPlayed ? '1px solid var(--accent-primary)' : '1px solid transparent', borderRadius: 'var(--radius-sm)', transition: 'all 0.2s' }}>
                            <input type="checkbox" checked={isPlayed} onChange={() => handleTogglePlayer(p.id)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                            <span style={{ flex: 1, fontWeight: isPlayed ? 600 : 400, color: isPlayed ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{p.name}</span>
                            {isPlayed && (
                                <input type="number" value={selectedPlayers[p.id]?.points || ''} onChange={e => handlePointsChange(p.id, e.target.value)} className="input-field" style={{ width: '80px', padding: '0.4rem', border: '1px solid var(--accent-primary)' }} placeholder="Pts" min="0" />
                            )}
                        </div>
                    )
                })}
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }}>Save Game & Stats</button>
        </form>
    )
}
