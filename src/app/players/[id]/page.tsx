import { getPlayerDetail, updatePlayerProfile } from '@/actions/players'
import Link from 'next/link'
import { ArrowLeft, User, Ruler, Weight, Shield, Coins, Activity, Flame, Target } from 'lucide-react'

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const player = await getPlayerDetail(id)

    if (!player) {
        return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Player not found.</div>
    }

    const { careerStats, recentGames } = player

    return (
        <div>
            {/* Back Navigation */}
            <Link href="/players" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', textDecoration: 'none', marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 600, transition: 'color 0.2s' }}>
                <ArrowLeft size={16} /> Back to Roster
            </Link>

            {/* --- HERO SECTION --- */}
            <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
                <h1 className="title-gradient" style={{ fontSize: '3rem', margin: 0, lineHeight: '1.1' }}>{player.name}</h1>
                {!player.active && (
                    <div>
                        <span style={{ padding: '4px 10px', background: 'rgba(239, 68, 68, 0.2)', color: 'var(--accent-danger)', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem' }}>Inactive</span>
                    </div>
                )}
            </div>

            {/* --- CORE STATS ROW --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Games Played</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{careerStats.gp}</span>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>PPG</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)', marginTop: '0.5rem' }}>{careerStats.ppg}</span>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Median PPG</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>{Number(careerStats.medianPpg).toFixed(1)}</span>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Career High</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-warning)', marginTop: '0.5rem' }}>{careerStats.highestScoringGame}</span>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Net Rating</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: Number(careerStats.netRtg) > 0 ? 'var(--accent-success)' : Number(careerStats.netRtg) < 0 ? 'var(--accent-danger)' : 'var(--text-primary)', marginTop: '0.5rem' }}>
                        {Number(careerStats.netRtg) > 0 ? '+' : ''}{careerStats.netRtg}
                    </span>
                </div>
            </div>

            {/* --- DETAILED SPLITS & METRICS --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>

                {/* Scoring Profile */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={20} color="var(--accent-primary)" /> Scoring Breakdown
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>From Free Throws (1s)</span>
                                <span style={{ fontWeight: 700 }}>{careerStats.onesPct}%</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${careerStats.onesPct}%`, background: 'var(--accent-primary)' }} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>From Field Goals (2s)</span>
                                <span style={{ fontWeight: 700 }}>{careerStats.twosPct}%</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${careerStats.twosPct}%`, background: 'var(--accent-primary)' }} />
                            </div>
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.9rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>From Deep (3s)</span>
                                <span style={{ fontWeight: 700 }}>{careerStats.threesPct}%</span>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${careerStats.threesPct}%`, background: 'var(--accent-primary)' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Ratings */}
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Activity size={20} color="var(--accent-primary)" /> Advanced Metrics
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Offensive Rating</span>
                            <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{careerStats.oRtg} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TEAM PPG</span></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Defensive Rating</span>
                            <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{careerStats.dRtg} <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>OPP PPG</span></span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-sm)' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total Career Points</span>
                            <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{careerStats.totalPoints}</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* --- LAST 10 GAMES LOG --- */}
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Flame size={20} color="var(--accent-primary)" /> Last 10 Games
            </h2>

            <div className="glass-panel" style={{ overflow: 'hidden' }}>
                {recentGames.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No games played yet.</div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: 'rgba(0,0,0,0.4)', borderBottom: '1px solid var(--panel-border)' }}>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Date</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Opponent</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Points Scored</th>
                                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px' }}>Result</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentGames.map((game: any) => (
                                <tr key={game.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                                        {new Date(game.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500, color: 'var(--text-primary)' }}>vs {game.opponent}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ display: 'inline-block', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-primary)', padding: '4px 12px', borderRadius: '12px', fontWeight: 700, fontSize: '0.95rem' }}>
                                            {game.pointsScoed} pts
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            fontWeight: 800,
                                            color: game.result === 'W' ? 'var(--accent-success)' : game.result === 'L' ? 'var(--accent-danger)' : 'var(--text-primary)',
                                            letterSpacing: '1px'
                                        }}>
                                            {game.result} <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>({game.teamScore}-{game.opponentScore})</span>
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <div style={{ height: '3rem' }} />
        </div>
    )
}
