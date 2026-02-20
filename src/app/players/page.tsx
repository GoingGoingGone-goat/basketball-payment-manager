import { getAllPlayers, addPlayer, togglePlayerActive } from '@/actions/players'
import Link from 'next/link'
import { User } from 'lucide-react'

export default async function PlayersPage() {
    const players = await getAllPlayers()

    // Separate active and inactive
    const activePlayers = players.filter((p: any) => p.active)
    const inactivePlayers = players.filter((p: any) => !p.active)

    return (
        <div>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Manage Roster</h1>

            {/* Add New Player Form */}
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', marginBottom: '3rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Add New Player</h2>
                <form action={async (formData) => {
                    'use server'
                    const name = formData.get('name') as string
                    if (name) await addPlayer(name)
                }} style={{ display: 'flex', gap: '1rem' }}>
                    <input type="text" name="name" required placeholder="Player Name" className="input-field" />
                    <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>Add Player</button>
                </form>
            </div>

            {/* Active Players Grid */}
            <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--accent-success)' }}>●</span> Active Roster
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
                {activePlayers.map((player: any) => (
                    <Link href={`/players/${player.id}`} key={player.id} style={{ textDecoration: 'none' }}>
                        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }}>
                            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid var(--panel-border)' }}>
                                {player.photoUrl ? (
                                    <img src={player.photoUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <User size={30} color="var(--text-muted)" />
                                )}
                            </div>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', marginBottom: '0.3rem' }}>{player.name}</h3>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {player.positions && <span style={{ background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{player.positions}</span>}
                                    {player.height && <span>{player.height}</span>}
                                    {player.weight && <span>• {player.weight}</span>}
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>


            {/* Inactive Players */}
            {inactivePlayers.length > 0 && (
                <>
                    <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                        Inactive / Alumni
                    </h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {inactivePlayers.map((player: any) => (
                            <Link href={`/players/${player.id}`} key={player.id} style={{ textDecoration: 'none', opacity: 0.7 }}>
                                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', cursor: 'pointer' }}>
                                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(0,0,0,0.3)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {player.photoUrl ? (
                                            <img src={player.photoUrl} alt={player.name} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(100%)' }} />
                                        ) : (
                                            <User size={30} color="var(--text-muted)" />
                                        )}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '0.3rem' }}>{player.name}</h3>
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Inactive</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}

        </div>
    )
}
