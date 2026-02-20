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

    // New Advanced Scoring Metrics
    const pointsArray = player.GameStats.map((s: any) => s.points).sort((a: number, b: number) => a - b);
    const highestScoringGame = pointsArray.length > 0 ? pointsArray[pointsArray.length - 1] : 0;

    let medianPpg = 0;
    if (pointsArray.length > 0) {
        const mid = Math.floor(pointsArray.length / 2);
        if (pointsArray.length % 2 === 0) {
            medianPpg = (pointsArray[mid - 1] + pointsArray[mid]) / 2;
        } else {
            medianPpg = pointsArray[mid];
        }
    }

    let consistencyIndex = '0.00';
    let consistencyRate = '0.0';
    let mad = '0.0';

    if (gp > 0) {
        const meanPoints = totalPoints / gp;
        let sumSquaredDiffs = 0;
        let sumAbsoluteDiffs = 0;
        let gamesInBand = 0;
        const bandWidth = 5;

        pointsArray.forEach((p: number) => {
            sumSquaredDiffs += Math.pow(p - meanPoints, 2);
            sumAbsoluteDiffs += Math.abs(p - meanPoints);

            if (p >= (meanPoints - bandWidth) && p <= (meanPoints + bandWidth)) {
                gamesInBand++;
            }
        });

        const sd = Math.sqrt(sumSquaredDiffs / gp);
        if (meanPoints > 0) {
            const cv = sd / meanPoints;
            consistencyIndex = (1 - cv).toFixed(2);
        }

        consistencyRate = ((gamesInBand / gp) * 100).toFixed(1);
        mad = (sumAbsoluteDiffs / gp).toFixed(1);
    }

    const allGames = await db.game.findMany();
    const totalTeamGames = allGames.length;
    let totalGlobalTeamPoints = 0;
    let totalGlobalOpponentPoints = 0;

    allGames.forEach((g: any) => {
        totalGlobalTeamPoints += g.teamScore;
        totalGlobalOpponentPoints += g.opponentScore;
    });

    const teamAvgORtg = totalTeamGames > 0 ? (totalGlobalTeamPoints / totalTeamGames).toFixed(1) : '0.0';
    const teamAvgDRtg = totalTeamGames > 0 ? (totalGlobalOpponentPoints / totalTeamGames).toFixed(1) : '0.0';
    const teamAvgNetRtg = totalTeamGames > 0 ? ((totalGlobalTeamPoints / totalTeamGames) - (totalGlobalOpponentPoints / totalTeamGames)).toFixed(1) : '0.0';

    return {
        ...player,
        careerStats: {
            gp,
            ppg,
            medianPpg,
            highestScoringGame,
            onesPct,
            twosPct,
            threesPct,
            oRtg,
            dRtg,
            netRtg,
            totalPoints,
            consistencyIndex,
            consistencyRate,
            mad
        },
        teamAverages: {
            oRtg: teamAvgORtg,
            dRtg: teamAvgDRtg,
            netRtg: teamAvgNetRtg
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
