import { getGames } from '@/actions/games'
import { getActivePlayers } from '@/actions/players'
import { SeasonFilter } from './SeasonFilter'
import { ClientStatsTable } from './ClientStatsTable'
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

        let totalOnes = 0
        let totalTwos = 0
        let totalThrees = 0

        playerGames.forEach((g: any) => {
            const pStat = g.GameStats.find((s: any) => s.playerId === player.id)
            if (pStat) {
                totalPoints += pStat.points
                totalFouls += pStat.fouls
                totalOnes += pStat.ones
                totalTwos += pStat.twos * 2
                totalThrees += pStat.threes * 3
                totalTeamPoints += g.teamScore
                totalOppPoints += g.opponentScore
            }
            if (g.result === 'W') wins++
        })

        const onesPct = totalPoints > 0 ? (totalOnes / totalPoints) * 100 : 0
        const twosPct = totalPoints > 0 ? (totalTwos / totalPoints) * 100 : 0
        const threesPct = totalPoints > 0 ? (totalThrees / totalPoints) * 100 : 0

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
            netRtg,
            onesPct,
            twosPct,
            threesPct
        }
    }).sort((a: any, b: any) => b.gamesPlayed > 0 ? b.ppg - a.ppg : b.gamesPlayed - a.gamesPlayed)

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                <h1 className="title-gradient" style={{ fontSize: '2.5rem', margin: 0 }}>Individual Player Statistics</h1>
                <SeasonFilter seasons={allSeasons} />
            </div>

            <ClientStatsTable playerStats={playerStats} />
        </div>
    )
}
