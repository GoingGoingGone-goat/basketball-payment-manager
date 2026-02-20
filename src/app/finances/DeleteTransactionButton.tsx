'use client'

import { deleteTransaction } from '@/actions/finances'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

export function DeleteTransactionButton({ id, type }: { id: string, type: 'FEE' | 'PAYMENT' }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete this ${type.toLowerCase()}? This action cannot be undone.`)) {
            return
        }

        setIsDeleting(true)
        try {
            await deleteTransaction(id, type)
        } catch (error) {
            console.error('Failed to delete transaction:', error)
            alert('An error occurred while deleting the transaction.')
            setIsDeleting(false)
        }
    }

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                opacity: isDeleting ? 0.5 : 1,
                padding: '0.4rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-full)',
                transition: 'all 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.color = 'var(--accent-danger)'}
            onMouseOut={e => e.currentTarget.style.color = 'var(--text-muted)'}
            title={isDeleting ? 'Deleting...' : `Delete ${type.toLowerCase()}`}
        >
            <Trash2 size={16} />
        </button>
    )
}
