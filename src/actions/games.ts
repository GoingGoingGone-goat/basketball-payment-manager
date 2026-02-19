'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function logGame(data: {
    opponent: string
    date: Date
    teamScore: number
    opponentScore: number
    result: string
    season: string
    playerStats: { playerId: string; points: number }[]
}) {
    const game = await db.game.create({
        data: {
            opponent: data.opponent,
            date: new Date(data.date),
            teamScore: data.teamScore,
            opponentScore: data.opponentScore,
            result: data.result,
            season: data.season,
            GameStats: {
                create: data.playerStats.map(stat => ({
                    playerId: stat.playerId,
                    points: stat.points,
                }))
            }
        }
    })

    revalidatePath('/')
    revalidatePath('/opponents')
    revalidatePath('/stats')
    revalidatePath('/analytics')

    return game
}

export async function getGames() {
    return db.game.findMany({
        orderBy: { date: 'desc' },
        include: { GameStats: { include: { Player: true } } }
    })
}

export async function deleteGame(id: string) {
    await db.game.delete({ where: { id } })
    revalidatePath('/')
    revalidatePath('/opponents')
    revalidatePath('/stats')
    revalidatePath('/analytics')
}
