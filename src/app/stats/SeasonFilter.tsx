'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export function SeasonFilter({ seasons }: { seasons: string[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const currentSeason = searchParams.get('season') || 'All Time'

    const handleSeasonChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        const params = new URLSearchParams(searchParams.toString())
        if (val === 'All Time') {
            params.delete('season')
        } else {
            params.set('season', val)
        }
        router.push(`/stats?${params.toString()}`)
    }

    return (
        <select
            value={currentSeason}
            onChange={handleSeasonChange}
            className="input-field"
            style={{ width: '250px', fontWeight: 600, background: 'rgba(59, 130, 246, 0.1)', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}
        >
            <option value="All Time">All Time</option>
            {seasons.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
    )
}
