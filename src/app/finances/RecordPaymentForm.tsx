'use client'

import { useState } from 'react'
import { logPayment } from '@/actions/finances'

export function RecordPaymentForm({ activePlayers }: { activePlayers: any[] }) {
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [description, setDescription] = useState('')

    // Default to NONE checked logic
    const [selectedPlayers, setSelectedPlayers] = useState<Record<string, boolean>>({})

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
            alert('Please select at least one player to log a payment for.')
            return
        }

        await logPayment({
            amount: Number(amount),
            date: new Date(date),
            description: description || undefined,
            selectedPlayerIds
        })

        // Reset
        setAmount('')
        setDescription('')
        setSelectedPlayers({})
        alert(`Successfully logged $${amount} payment for ${selectedPlayerIds.length} players.`)
    }

    const selectedCount = Object.values(selectedPlayers).filter(Boolean).length

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required placeholder="Amount paid ($)" step="0.01" className="input-field" />
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="input-field" />

            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (Optional)" className="input-field" />

            <div style={{ marginTop: '0.5rem', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-md)', padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Select Players</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="button" onClick={() => handleToggleAll(true)} style={{ fontSize: '0.8rem', color: 'var(--accent-success)', textDecoration: 'underline' }}>Select All</button>
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

            <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', background: 'var(--accent-success)', color: 'black', fontWeight: 600 }}>
                Log Payment for {selectedCount} Player{selectedCount !== 1 ? 's' : ''}
            </button>
        </form>
    )
}
