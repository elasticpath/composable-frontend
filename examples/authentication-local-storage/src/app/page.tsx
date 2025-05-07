import { ClientComponent } from "./client-component"

export default async function Home() {
  return (
    <div className="min-h-screen p-4 font-sans bg-gray-50">
      <main className="max-w-3xl mx-auto bg-white p-6 rounded shadow-sm">
        <ClientComponent />
      </main>
    </div>
  )
}
