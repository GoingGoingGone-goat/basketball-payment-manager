import { getGames } from '@/actions/games'
import { format } from 'date-fns'
import { DeleteGameButton } from '../DeleteGameButton'

export default async function OpponentsPage() {
    const games = await getGames()

    const opponentsMap = new Map<string, typeof games>()
    for (const game of games) {
        const list = opponentsMap.get(game.opponent) || []
        list.push(game)
        opponentsMap.set(game.opponent, list)
    }

    return (
        <div>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Opponents History</h1>

            {games.length === 0 ? (
                <div className="glass-panel" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No games logged yet.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {Array.from(opponentsMap.entries()).map(([opponent, gamesList]) => (
                        <div key={opponent} className="glass-panel" style={{ padding: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem' }}>{opponent}</h2>
                                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                    {gamesList.length} match{gamesList.length !== 1 ? 'es' : ''}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {gamesList.map((game: any) => (
                                    <div key={game.id} style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--panel-border)', borderRadius: 'var(--radius-sm)' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
                                            <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {format(new Date(game.date), 'MMMM d, yyyy')}
                                                <DeleteGameButton gameId={game.id} />
                                            </span>
                                            <span style={{
                                                fontWeight: 700,
                                                color: game.result === 'W' ? 'var(--accent-success)' : game.result === 'L' ? 'var(--accent-danger)' : 'var(--accent-warning)',
                                                background: 'rgba(255,255,255,0.05)',
                                                padding: '0.2rem 0.6rem',
                                                borderRadius: 'var(--radius-full)'
                                            }}>
                                                {game.result} ({game.teamScore} - {game.opponentScore})
                                            </span>
                                        </div>

                                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                                            <strong style={{ color: 'var(--text-primary)' }}>Roster & Scoring: </strong>
                                            {game.GameStats.length > 0
                                                ? game.GameStats.map((stat: any) => `${stat.Player.name} (${stat.points})`).join(' • ')
                                                : 'No players logged'}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
