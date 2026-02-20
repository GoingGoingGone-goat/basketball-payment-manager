'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function addFee(data: {
    playerId: string
    amount: number
    season: string
    description: string
}) {
    const fee = await db.fee.create({ data })
    revalidatePath('/')
    return fee
}

export async function addTeamFee(data: {
    amountPerPlayer: number
    season: string
    description: string
    selectedPlayerIds?: string[]
}) {
    let activePlayers = await db.player.findMany({ where: { active: true } })

    // Filter if specific players were selected
    if (data.selectedPlayerIds && data.selectedPlayerIds.length > 0) {
        activePlayers = activePlayers.filter((p: any) => data.selectedPlayerIds!.includes(p.id))
    }

    const fees = activePlayers.map((p: any) => ({
        playerId: p.id,
        amount: data.amountPerPlayer,
        season: data.season,
        description: data.description,
    }))

    await db.fee.createMany({ data: fees })
    revalidatePath('/')
}

export async function logPayment(data: {
    playerId: string
    amount: number
    date: Date
}) {
    const payment = await db.payment.create({
        data: {
            ...data,
            date: new Date(data.date)
        }
    })
    revalidatePath('/')
    return payment
}

export async function getDebtSummary() {
    const players = await db.player.findMany({
        include: {
            Fees: true,
            Payments: true
        },
        orderBy: { name: 'asc' }
    })

    return players.map((player: any) => {
        const totalFees = player.Fees.reduce((sum: number, f: any) => sum + f.amount, 0)
        const totalPayments = player.Payments.reduce((sum: number, p: any) => sum + p.amount, 0)
        const debt = totalFees - totalPayments
        return {
            player,
            totalFees,
            totalPayments,
            debt
        }
    }).sort((a: any, b: any) => b.debt - a.debt)
}

export async function getFinancesTotals() {
    const players = await getDebtSummary()
    const totalDebt = players.reduce((sum: number, p: any) => sum + (p.debt > 0 ? p.debt : 0), 0)
    return { totalDebt }
}

export async function getTransactionHistory() {
    const fees = await db.fee.findMany({ include: { Player: true } })
    const payments = await db.payment.findMany({ include: { Player: true } })

    // Combine and sort by date descending
    const transactions = [
        ...fees.map((f: any) => ({ ...f, type: 'FEE', date: f.createdAt })),
        ...payments.map((p: any) => ({ ...p, type: 'PAYMENT' }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return transactions
}

export async function deleteTransaction(id: string, type: 'FEE' | 'PAYMENT') {
    if (type === 'FEE') {
        await db.fee.delete({ where: { id } })
    } else {
        await db.payment.delete({ where: { id } })
    }
    revalidatePath('/')
    revalidatePath('/finances')
}
