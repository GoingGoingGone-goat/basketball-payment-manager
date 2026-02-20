import { getActivePlayers } from '@/actions/players'
import { logPayment, getDebtSummary, getTransactionHistory } from '@/actions/finances'
import { AddTeamFeeForm } from './AddTeamFeeForm'
import { RecordPaymentForm } from './RecordPaymentForm'
import { DeleteTransactionButton } from './DeleteTransactionButton'
import { format } from 'date-fns'

export default async function FinancesPage() {
    const [activePlayers, debtSummary, transactions] = await Promise.all([
        getActivePlayers(),
        getDebtSummary(),
        getTransactionHistory()
    ])

    return (
        <div>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Finances & Fees</h1>

            {/* TOP ROW: Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

                {/* Charge Team Fee (Top Left) */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-primary)' }}>Charge Team Fee</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Charge specific active players</p>
                    <AddTeamFeeForm activePlayers={activePlayers} />
                </div>

                {/* Log Payment (Top Right) */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-success)' }}>Record Payment</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Record a player's transaction</p>
                    <RecordPaymentForm activePlayers={activePlayers} />
                </div>

            </div>


            {/* BOTTOM ROW: History & Debt */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>

                {/* Active Debt (Bottom Left) */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ marginBottom: '1.5rem' }}>Active Debt List</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                        {debtSummary.filter((d: any) => d.debt > 0).length === 0 ? (
                            <p style={{ color: 'var(--text-muted)' }}>No outstanding debts. Great job team!</p>
                        ) : (
                            debtSummary.filter((d: any) => d.debt > 0).map((d: any) => (
                                <div key={d.player.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                                    <span style={{ fontWeight: 500 }}>{d.player.name}</span>
                                    <span style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>${d.debt.toFixed(2)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Transaction History (Bottom Right) */}
                <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '2rem 2rem 1rem 2rem' }}>
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                            <span style={{ color: 'var(--text-secondary)' }}>🕒</span> Transaction History
                        </h2>
                    </div>

                    <div style={{ padding: '0 2rem 1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: 'minmax(80px, 1fr) 2fr 1fr auto', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>
                        <span>Date</span>
                        <span>Player / Item</span>
                        <span style={{ textAlign: 'right' }}>Amount</span>
                        <span style={{ width: '28px' }}></span>
                    </div>

                    {/* Transaction List Container - Set height to match roughly with the debt list */}
                    <div style={{ flex: 1, padding: '1rem 1rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '500px', overflowY: 'auto' }}>
                        {transactions.length === 0 ? (
                            <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '2rem' }}>No transactions recorded.</p>
                        ) : (
                            transactions.map((t: any) => (
                                <div key={t.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(80px, 1fr) 2fr 1fr auto', gap: '1rem', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)', transition: 'background 0.2s' }} className="hover:bg-[rgba(255,255,255,0.05)]">
                                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                        {format(new Date(t.date), 'M/d/yyyy')}
                                    </span>

                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{t.Player.name}</span>
                                        {t.type === 'FEE' && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.description || 'Fee'}</span>
                                        )}
                                        {t.type === 'PAYMENT' && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.description || 'Payment'}</span>
                                        )}
                                    </div>

                                    <span style={{ textAlign: 'right', fontWeight: 700, color: t.type === 'PAYMENT' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                                        {t.type === 'PAYMENT' ? '+' : '-'}${t.amount.toFixed(2)}
                                    </span>

                                    <DeleteTransactionButton id={t.id} type={t.type} />
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    )
}
