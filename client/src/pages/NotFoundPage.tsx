import { useNavigate } from 'react-router-dom'
import { Home, ArrowLeft, Radar } from 'lucide-react'
import { useDocumentTitle } from '../hooks'
import { Button } from '../components/ui/button'

export function NotFoundPage() {
  useDocumentTitle('Not Found')
  const navigate = useNavigate()

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-4 text-center text-foreground">
      {/* Glowing icon */}
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-2xl" />
        <div className="relative rounded-full border border-white/10 bg-white/5 p-6">
          <Radar className="h-12 w-12 text-sky-400" />
        </div>
      </div>

      <div>
        <p className="text-6xl font-bold tracking-tight text-zinc-50">404</p>
        <p className="mt-2 text-lg font-medium text-zinc-300">Page not found</p>
        <p className="mt-2 max-w-sm text-sm text-zinc-500">
          The page you're looking for doesn't exist or has been moved.
        </p>
      </div>

      <div className="flex gap-3">
        <Button
          variant="ghost"
          className="border border-white/10 text-zinc-300 hover:bg-white/5 hover:text-zinc-50"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4" /> Go back
        </Button>
        <Button
          className="bg-zinc-100 text-zinc-950 hover:bg-zinc-200"
          onClick={() => navigate('/')}
        >
          <Home className="h-4 w-4" /> Home
        </Button>
      </div>
    </main>
  )
}
