'use client'

import { useState } from 'react'
import { addTeamFee } from '@/actions/finances'

export function AddTeamFeeForm({ activePlayers }: { activePlayers: any[] }) {
    const [amount, setAmount] = useState('')
    const [season, setSeason] = useState('Autumn 2026')
    const [description, setDescription] = useState('')

    // Default to all checked
    const [selectedPlayers, setSelectedPlayers] = useState<Record<string, boolean>>(
        activePlayers.reduce((acc, p) => ({ ...acc, [p.id]: true }), {})
    )

    const handleTogglePlayer = (id: string) => {
        setSelectedPlayers(prev => ({ ...prev, [id]: !prev[id] }))
    }

    const handleToggleAll = (val: boolean) => {
        setSelectedPlayers(activePlayers.reduce((acc, p) => ({ ...acc, [p.id]: val }), {}))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const selectedPlayerIds = Object.entries(selectedPlayers)
            .filter(([_, isSelected]) => isSelected)
            .map(([id]) => id)

        if (selectedPlayerIds.length === 0) {
            alert('Please select at least one player to charge.')
            return
        }

        await addTeamFee({
            amountPerPlayer: Number(amount),
            season,
            description,
            selectedPlayerIds
        })

        // Reset
        setAmount('')
        setDescription('')
        alert(`Successfully charged $${amount} to ${selectedPlayerIds.length} players.`)
    }

    const selectedCount = Object.values(selectedPlayers).filter(Boolean).length

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="Amount per player ($)" step="0.01" className="input-field" />

            <select value={season} onChange={e => setSeason(e.target.value)} required className="input-field">
                <option value="Autumn 2025">Autumn 2025</option>
                <option value="Spring 2025">Spring 2025</option>
                <option value="Autumn 2026">Autumn 2026</option>
            </select>

            <input type="text" value={description} onChange={e => setDescription(e.target.value)} required placeholder="Description (e.g., Rego Fee)" className="input-field" />

            <div style={{ marginTop: '0.5rem', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Select Players to Charge</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={() => handleToggleAll(true)} style={{ fontSize: '0.8rem', color: 'var(--accent-primary)', textDecoration: 'underline' }}>Select All</button>
                        <button type="button" onClick={() => handleToggleAll(false)} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textDecoration: 'underline' }}>Deselect All</button>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }}>
                    {activePlayers.map(p => (
                        <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer', color: selectedPlayers[p.id] ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                            <input
                                type="checkbox"
                                checked={selectedPlayers[p.id] || false}
                                onChange={() => handleTogglePlayer(p.id)}
                            />
                            {p.name}
                        </label>
                    ))}
                </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                Charge {selectedCount} Player{selectedCount !== 1 ? 's' : ''}
            </button>
        </form>
    )
}
