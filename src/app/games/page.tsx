import { getActivePlayers } from '@/actions/players'
import GameForm from './GameForm'

export default async function GamesPage() {
    const activePlayers = await getActivePlayers()

    return (
        <div>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Log Game</h1>
            <GameForm players={activePlayers} />
        </div>
    )
}
