'use client'

import { deleteGame } from '@/actions/games'
import { Trash2 } from 'lucide-react'

export function DeleteGameButton({ gameId }: { gameId: string }) {
    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this game and all associated stats?')) {
            await deleteGame(gameId)
        }
    }

    return (
        <button
            onClick={handleDelete}
            style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}
            title="Delete Game"
        >
            <Trash2 size={18} className="hover:text-[var(--accent-danger)] transition-colors" />
        </button>
    )
}
