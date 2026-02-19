'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

export function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <button
            onClick={handleCopy}
            className={`btn ${copied ? '' : 'btn-secondary'}`}
            style={{
                background: copied ? 'var(--accent-success)' : undefined,
                color: copied ? 'white' : undefined,
                borderColor: copied ? 'transparent' : undefined
            }}
        >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
        </button>
    )
}
