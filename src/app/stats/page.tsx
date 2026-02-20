import { getGames } from '@/actions/games'
import { getActivePlayers } from '@/actions/players'

export default async function StatsPage() {
    const games = await getGames()
    const players = await getActivePlayers()

    const playerStats = players.map((player: any) => {
        const playerGames = games.filter((g: any) => g.GameStats.some((s: any) => s.playerId === player.id))
        const totalGames = playerGames.length

        let totalPoints = 0
        let wins = 0
        let totalThrees = 0
        let totalFouls = 0

        playerGames.forEach((g: any) => {
            const pStat = g.GameStats.find((s: any) => s.playerId === player.id)
            if (pStat) {
                totalPoints += pStat.points
                totalThrees += pStat.threes
                totalFouls += pStat.fouls
            }
            if (g.result === 'W') wins++
        })

        return {
            player,
            gamesPlayed: totalGames,
            reliability: games.length > 0 ? (totalGames / games.length) * 100 : 0,
            totalPoints,
            totalThrees,
            totalFouls,
            ppg: totalGames > 0 ? totalPoints / totalGames : 0,
            winPct: totalGames > 0 ? (wins / totalGames) * 100 : 0
        }
    }).sort((a: any, b: any) => b.ppg - a.ppg)

    return (
        <div>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Individual Player Statistics</h1>

            <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Player</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>GP</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Total Pts</th>
                            <th style={{ padding: '1rem', color: 'var(--accent-primary)' }}>PPG</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>3PTM</th>
                            <th style={{ padding: '1rem', color: 'var(--accent-danger)' }}>Fouls/G</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Win %</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Reliability</th>
                        </tr>
                    </thead>
                    <tbody>
                        {playerStats.length === 0 ? (
                            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No player stats available</td></tr>
                        ) : null}
                        {playerStats.map((stat: any) => (
                            <tr key={stat.player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="hover:bg-[rgba(255,255,255,0.02)]">
                                <td style={{ padding: '1rem', fontWeight: 600 }}>{stat.player.name}</td>
                                <td style={{ padding: '1rem' }}>{stat.gamesPlayed}</td>
                                <td style={{ padding: '1rem' }}>{stat.totalPoints}</td>
                                <td style={{ padding: '1rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                                    {stat.ppg.toFixed(1)}
                                </td>
                                <td style={{ padding: '1rem' }}>{stat.totalThrees}</td>
                                <td style={{ padding: '1rem', color: 'var(--accent-danger)' }}>
                                    {stat.gamesPlayed > 0 ? (stat.totalFouls / stat.gamesPlayed).toFixed(1) : '0.0'}
                                </td>
                                <td style={{ padding: '1rem', color: stat.winPct > 50 ? 'var(--accent-success)' : stat.winPct < 40 ? 'var(--accent-danger)' : 'inherit' }}>
                                    {stat.winPct.toFixed(1)}%
                                </td>
                                <td style={{ padding: '1rem' }}>{stat.reliability.toFixed(0)}%</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
