import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function getPlayerDetail(id: string) {
    const player = await db.player.findUnique({
        where: { id },
        include: {
            GameStats: {
                include: { Game: true },
                orderBy: { Game: { date: 'desc' } }
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

    const onesPct = totalPoints > 0 ? ((totalOnes / totalPoints) * 100).toFixed(1) : '0.0';
    const twosPct = totalPoints > 0 ? ((totalTwos / totalPoints) * 100).toFixed(1) : '0.0';
    const threesPct = totalPoints > 0 ? ((totalThrees / totalPoints) * 100).toFixed(1) : '0.0';

    const oRtg = gp > 0 ? (totalTeamPoints / gp).toFixed(1) : '0.0';
    const dRtg = gp > 0 ? (totalOpponentPoints / gp).toFixed(1) : '0.0';
    const netRtg = gp > 0 ? ((totalTeamPoints / gp) - (totalOpponentPoints / gp)).toFixed(1) : '0.0';

    const pointsArray = player.GameStats.map((s: any) => s.points).sort((a: number, b: number) => a - b);
    const highestScoringGame = pointsArray.length > 0 ? pointsArray[pointsArray.length - 1] : 0;

    let medianPpg: number = 0;
    if (pointsArray.length > 0) {
        const mid = Math.floor(pointsArray.length / 2);
        if (pointsArray.length % 2 === 0) {
            medianPpg = (pointsArray[mid - 1] + pointsArray[mid]) / 2;
        } else {
            medianPpg = pointsArray[mid];
        }
    }

    return {
        ...player,
        careerStats: { gp, ppg, medianPpg, highestScoringGame, onesPct, twosPct, threesPct, oRtg, dRtg, netRtg, totalPoints },
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

async function test() {
    try {
        console.log("Fetching player ID 11b695a0-0043-4e4f-bca2-8db859cbf258...")
        const data = await getPlayerDetail("11b695a0-0043-4e4f-bca2-8db859cbf258")
        console.dir(data, { depth: null })
    } catch (err) {
        console.error("Error caught:", err)
    } finally {
        await db.$disconnect()
    }
}

test()
