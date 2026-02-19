import { getAnalyticsRawData } from '@/actions/analytics'
import ClientAnalytics from './ClientAnalytics'

export default async function AnalyticsPage() {
    const data = await getAnalyticsRawData()
    return (
        <div>
            <h1 className="title-gradient" style={{ fontSize: '2.5rem', marginBottom: '1.5rem' }}>Team Analytics</h1>
            <ClientAnalytics initialData={data} />
        </div>
    )
}
