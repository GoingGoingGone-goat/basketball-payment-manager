import { getDebtSummary, getFinancesTotals } from '@/actions/finances'
import { getGames } from '@/actions/games'
import { getActivePlayers } from '@/actions/players'
import { CopyButton } from './CopyButton'

export default async function Dashboard() {
  const [debtSummary, { totalDebt }, games, activePlayers] = await Promise.all([
    getDebtSummary(),
    getFinancesTotals(),
    getGames(),
    getActivePlayers()
  ])

  // Process game stats
  const totalGames = games.length
  const wins = games.filter((g: any) => g.result === 'W').length
  const losses = games.filter((g: any) => g.result === 'L').length
  const draws = games.filter((g: any) => g.result === 'D').length

  // Debt list for clipboard
  const debtListText = debtSummary
    .filter((d: any) => d.debt > 0)
    .map((d: any) => `${d.player.name}: $${d.debt.toFixed(2)}`)
    .join('\n')

  const clipboardText = `Outstanding Team Debt:\n${debtListText}\n\nTotal Owed: $${totalDebt.toFixed(2)}`

  return (
    <div>
      <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div className="glass-card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Outstanding Debt</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-danger)' }}>
            ${totalDebt.toFixed(2)}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Games Played</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
            {totalGames}
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {wins}W - {losses}L - {draws}D
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Active Players</h3>
          <div style={{ fontSize: '2.5rem', fontWeight: 700, color: 'var(--accent-success)' }}>
            {activePlayers.length}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Debt List</h2>
            <CopyButton text={clipboardText} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
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
      </div>
    </div>
  )
}
