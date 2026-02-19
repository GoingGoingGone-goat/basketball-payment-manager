import { getAllPlayers, addPlayer, togglePlayerActive } from '@/actions/players'

export default async function PlayersPage() {
    const players = await getAllPlayers()

    return (
        <div>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Manage Roster</h1>
            <div className="glass-panel" style={{ padding: '2rem', maxWidth: '600px', marginBottom: '2rem' }}>
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

            <div className="glass-panel" style={{ padding: '2rem' }}>
                <h2 style={{ marginBottom: '1rem' }}>Team Roster</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                    {players.map((player: any) => (
                        <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                            <span style={{ fontWeight: 600, color: player.active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                                {player.name} {player.active ? '(Active)' : '(Inactive)'}
                            </span>
                            <form action={async () => {
                                'use server'
                                await togglePlayerActive(player.id, player.active)
                            }}>
                                <button type="submit" className={`btn ${player.active ? 'btn-danger' : 'btn-secondary'}`} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                                    {player.active ? 'Deactivate' : 'Activate'}
                                </button>
                            </form>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
