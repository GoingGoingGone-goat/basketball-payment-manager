import { getGames } from '@/actions/games'
import { getActivePlayers } from '@/actions/players'
import { SeasonFilter } from './SeasonFilter'
import Link from 'next/link'

export default async function StatsPage({ searchParams }: { searchParams: any }) {
    const sp = await searchParams;
    const seasonFilter = sp?.season;

    const allGames = await getGames()
    const allSeasons = Array.from(new Set(allGames.map((g: any) => g.season))).filter(Boolean).sort() as string[]

    const games = seasonFilter ? allGames.filter((g: any) => g.season === seasonFilter) : allGames;
    const players = await getActivePlayers()

    const playerStats = players.map((player: any) => {
        const playerGames = games.filter((g: any) => g.GameStats.some((s: any) => s.playerId === player.id))
        const totalGames = playerGames.length

        let totalPoints = 0
        let wins = 0
        let totalFouls = 0
        let totalTeamPoints = 0
        let totalOppPoints = 0

        playerGames.forEach((g: any) => {
            const pStat = g.GameStats.find((s: any) => s.playerId === player.id)
            if (pStat) {
                totalPoints += pStat.points
                totalFouls += pStat.fouls
                totalTeamPoints += g.teamScore
                totalOppPoints += g.opponentScore
            }
            if (g.result === 'W') wins++
        })

        const oRtg = totalGames > 0 ? (totalTeamPoints / totalGames) : 0
        const dRtg = totalGames > 0 ? (totalOppPoints / totalGames) : 0
        const netRtg = oRtg - dRtg

        return {
            player,
            gamesPlayed: totalGames,
            totalPoints,
            totalFouls,
            ppg: totalGames > 0 ? totalPoints / totalGames : 0,
            winPct: totalGames > 0 ? (wins / totalGames) * 100 : 0,
            oRtg,
            dRtg,
            netRtg
        }
    }).sort((a: any, b: any) => b.gamesPlayed > 0 ? b.ppg - a.ppg : b.gamesPlayed - a.gamesPlayed)

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '2.5rem', margin: 0 }}>Individual Player Statistics</h1>
                <SeasonFilter seasons={allSeasons} />
            </div>

            <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--panel-border)' }}>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Player</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Games Played</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Total Pts</th>
                            <th style={{ padding: '1rem', color: 'var(--accent-primary)' }}>PPG</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Offensive Rtg</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Defensive Rtg</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Net Rtg</th>
                            <th style={{ padding: '1rem', color: 'var(--accent-danger)' }}>Fouls/G</th>
                            <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Win %</th>
                        </tr>
                    </thead>
                    <tbody>
                        {playerStats.length === 0 ? (
                            <tr><td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No player stats available</td></tr>
                        ) : null}
                        {playerStats.map((stat: any) => (
                            <tr key={stat.player.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} className="hover:bg-[rgba(255,255,255,0.02)]">
                                <td style={{ padding: '1rem', fontWeight: 600 }}>
                                    <Link href={`/players/${stat.player.id}`} style={{ color: 'inherit', textDecoration: 'underline', textUnderlineOffset: '4px', textDecorationColor: 'rgba(255,255,255,0.2)' }}>
                                        {stat.player.name}
                                    </Link>
                                </td>
                                <td style={{ padding: '1rem' }}>{stat.gamesPlayed}</td>
                                <td style={{ padding: '1rem' }}>{stat.totalPoints}</td>
                                <td style={{ padding: '1rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
                                    {stat.ppg.toFixed(1)}
                                </td>
                                <td style={{ padding: '1rem' }}>{stat.oRtg.toFixed(1)}</td>
                                <td style={{ padding: '1rem' }}>{stat.dRtg.toFixed(1)}</td>
                                <td style={{ padding: '1rem', color: stat.netRtg > 0 ? 'var(--accent-success)' : stat.netRtg < 0 ? 'var(--accent-danger)' : 'inherit', fontWeight: 600 }}>
                                    {stat.netRtg > 0 ? '+' : ''}{stat.netRtg.toFixed(1)}
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--accent-danger)' }}>
                                    {stat.gamesPlayed > 0 ? (stat.totalFouls / stat.gamesPlayed).toFixed(1) : '0.0'}
                                </td>
                                <td style={{ padding: '1rem', color: stat.winPct > 50 ? 'var(--accent-success)' : stat.winPct < 40 ? 'var(--accent-danger)' : 'inherit' }}>
                                    {stat.winPct.toFixed(1)}%
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
