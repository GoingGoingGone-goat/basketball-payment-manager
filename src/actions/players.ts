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
    revalidatePath('/')
}
