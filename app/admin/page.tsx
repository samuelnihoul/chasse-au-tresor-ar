import result from '@/lib/drizzle'
export default function Admin() {
    return (
        <div>
            <h1>Admin</h1>
            <p>{JSON.stringify(result)}</p>
        </div>
    )
}