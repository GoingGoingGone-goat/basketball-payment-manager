'use client'

import { useState } from 'react'
import { Settings, X } from 'lucide-react'
import { updatePlayerProfile } from '@/actions/players'

export default function EditProfileModal({ player }: { player: any }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSaving(true)

        const formData = new FormData(e.currentTarget)
        const photoUrl = formData.get('photoUrl') as string
        const height = formData.get('height') as string
        const weight = formData.get('weight') as string
        const positions = formData.get('positions') as string

        await updatePlayerProfile(player.id, {
            photoUrl: photoUrl || undefined,
            height: height || undefined,
            weight: weight || undefined,
            positions: positions || undefined
        })

        setIsSaving(false)
        setIsOpen(false)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
            >
                <Settings size={16} /> Edit Profile
            </button>

            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }} onClick={() => setIsOpen(false)} />

                    <div className="glass-panel" style={{ position: 'relative', width: '100%', maxWidth: '500px', padding: '2rem', animation: 'fadeIn 0.2s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>Edit {player.name}</h2>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Photo URL (Direct Link)</label>
                                <input type="url" name="photoUrl" defaultValue={player.photoUrl || ''} className="input-field" placeholder="https://example.com/photo.jpg" />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Height</label>
                                    <input type="text" name="height" defaultValue={player.height || ''} className="input-field" placeholder="e.g. 6'2 or 188cm" />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Weight</label>
                                    <input type="text" name="weight" defaultValue={player.weight || ''} className="input-field" placeholder="e.g. 190 lbs or 86kg" />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Positions (Comma separated)</label>
                                <input type="text" name="positions" defaultValue={player.positions || ''} className="input-field" placeholder="e.g. PG, SG" />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsOpen(false)} className="btn btn-secondary">Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={isSaving}>
                                    {isSaving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
