import { getActivePlayers } from '@/actions/players'
import { addTeamFee, logPayment } from '@/actions/finances'

export default async function FinancesPage() {
    const activePlayers = await getActivePlayers()

    return (
        <div>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Finances & Fees</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* Charge Team Fee */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Charge Team Fee</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Applies a fee to ALL active players</p>
                    <form action={async (formData) => {
                        'use server'
                        await addTeamFee({
                            amountPerPlayer: Number(formData.get('amount')),
                            season: formData.get('season') as string,
                            description: formData.get('description') as string
                        })
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input type="number" name="amount" required placeholder="Amount per player ($)" step="0.01" className="input-field" />
                        <input type="text" name="season" required placeholder="Season (e.g., Summer 2024)" className="input-field" />
                        <input type="text" name="description" required placeholder="Description (e.g., Rego Fee)" className="input-field" />
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>Add Team Fee</button>
                    </form>
                </div>

                {/* Log Payment */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-success)' }}>Log Payment</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Record a payment from a player</p>
                    <form action={async (formData) => {
                        'use server'
                        await logPayment({
                            playerId: formData.get('playerId') as string,
                            amount: Number(formData.get('amount')),
                            date: new Date(formData.get('date') as string)
                        })
                    }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <select name="playerId" required className="input-field">
                            <option value="">Select Player</option>
                            {activePlayers.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <input type="number" name="amount" required placeholder="Amount paid ($)" step="0.01" className="input-field" />
                        <input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} className="input-field" />
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem', background: 'var(--accent-success)' }}>Log Payment</button>
                    </form>
                </div>

            </div>
        </div>
    )
}
