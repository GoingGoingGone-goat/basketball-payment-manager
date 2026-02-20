import { getActivePlayers } from '@/actions/players'
import { getGames } from '@/actions/games'
import GameForm from './GameForm'

export default async function GamesPage() {
    const activePlayers = await getActivePlayers()
    const games = await getGames()

    // Extract unique opponents and sort alphabetically
    const pastOpponents = Array.from(new Set(games.map((g: any) => g.opponent))).sort()

    return (
        <div>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Log Game</h1>
            <GameForm players={activePlayers} pastOpponents={pastOpponents} />
        </div>
    )
}
