import result from '@/db/drizzle'
import { getAllCoordinates } from '@/db/queries'
const coordinates = await getAllCoordinates()//cache issues
export default function Admin() {
    return (
        <div>
            <h1>Admin</h1>
            <p>{JSON.stringify(coordinates)}</p>
        </div>
    )
}