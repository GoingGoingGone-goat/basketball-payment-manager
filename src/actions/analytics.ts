'use server'

import { db } from '@/lib/db'

export async function getAnalyticsRawData() {
    const games = await db.game.findMany({
        include: {
            GameStats: {
                include: { Player: true }
            }
        },
        orderBy: { date: 'asc' }
    })

    const players = await db.player.findMany()
    const seasonsData = await db.game.groupBy({
        by: ['season']
    })

    const seasons = seasonsData.map((s: any) => s.season)

    return { games, players, seasons }
}
