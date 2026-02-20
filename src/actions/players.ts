'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function addPlayer(name: string) {
    const player = await db.player.create({
        data: {
            name,
            active: true,
        }
    })
    revalidatePath('/')
    return player
}

export async function getActivePlayers() {
    return db.player.findMany({
        where: { active: true },
        orderBy: { name: 'asc' }
    })
}

export async function getAllPlayers() {
    return db.player.findMany({
        orderBy: { name: 'asc' }
    })
}

export async function togglePlayerActive(id: string, active: boolean) {
    await db.player.update({
        where: { id },
        data: { active }
    })
    revalidatePath('/players')
    revalidatePath('/')
}

export async function updatePlayerProfile(id: string, data: { photoUrl?: string, height?: string, weight?: string, positions?: string }) {
    await db.player.update({
        where: { id },
        data
    })
    revalidatePath(`/players/${id}`)
    revalidatePath('/players')
}

export async function getPlayerDetail(id: string) {
    const player = await db.player.findUnique({
        where: { id },
        include: {
            GameStats: {
                include: {
                    Game: true
                },
                orderBy: {
                    Game: {
                        date: 'desc'
                    }
                }
            }
        }
    })

    if (!player) return null;

    const gp = player.GameStats.length;
    let totalPoints = 0;
    let totalOnes = 0;
    let totalTwos = 0;
    let totalThrees = 0;
    let totalTeamPoints = 0;
    let totalOpponentPoints = 0;

    player.GameStats.forEach((stat: any) => {
        totalPoints += stat.points;
        totalOnes += stat.ones;
        totalTwos += stat.twos * 2;
        totalThrees += stat.threes * 3;
        totalTeamPoints += stat.Game.teamScore;
        totalOpponentPoints += stat.Game.opponentScore;
    })

    const ppg = gp > 0 ? (totalPoints / gp).toFixed(1) : '0.0';

    // Percentages
    const onesPct = totalPoints > 0 ? ((totalOnes / totalPoints) * 100).toFixed(1) : '0.0';
    const twosPct = totalPoints > 0 ? ((totalTwos / totalPoints) * 100).toFixed(1) : '0.0';
    const threesPct = totalPoints > 0 ? ((totalThrees / totalPoints) * 100).toFixed(1) : '0.0';

    // Advanced Ratings
    const oRtg = gp > 0 ? (totalTeamPoints / gp).toFixed(1) : '0.0';
    const dRtg = gp > 0 ? (totalOpponentPoints / gp).toFixed(1) : '0.0';
    const netRtg = gp > 0 ? ((totalTeamPoints / gp) - (totalOpponentPoints / gp)).toFixed(1) : '0.0';

    return {
        ...player,
        careerStats: {
            gp,
            ppg,
            onesPct,
            twosPct,
            threesPct,
            oRtg,
            dRtg,
            netRtg,
            totalPoints
        },
        recentGames: player.GameStats.slice(0, 10).map((stat: any) => ({
            id: stat.Game.id,
            date: stat.Game.date,
            opponent: stat.Game.opponent,
            pointsScoed: stat.points,
            result: stat.Game.result,
            teamScore: stat.Game.teamScore,
            opponentScore: stat.Game.opponentScore
        }))
    }
}
